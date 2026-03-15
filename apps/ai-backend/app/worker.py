"""
Celery Worker — ContractSense AI Backend
Handles the full PDF analysis pipeline as a background task.
"""

import asyncio
import uuid
import httpx
import boto3
from botocore.config import Config
from celery import Celery
from app.config import settings
from app.services.pdf_parser import extract_text, split_into_clauses
from app.services.llm_chains import (
    detect_contract_type,
    simplify_clause,
    classify_risk,
    generate_counter_clause,
    predict_future_risks,
    generate_overall_summary,
)

# ─── Celery App ───────────────────────────────────────────────────────────────

celery_app = Celery(
    "contractsense",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)

# ─── MinIO / S3 Client ───────────────────────────────────────────────────────

def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        config=Config(signature_version="s3v4"),
    )


def download_file_from_minio(file_key: str) -> bytes:
    s3 = get_s3_client()
    obj = s3.get_object(Bucket=settings.s3_bucket, Key=file_key)
    return obj["Body"].read()


# ─── Main Analysis Pipeline ───────────────────────────────────────────────────

async def _run_analysis_pipeline(
    contract_id: str,
    file_key: str,
    counterparty_name: str | None,
) -> dict:
    """
    Full async pipeline:
    1. Download file from MinIO
    2. Extract text + split clauses
    3. Detect contract type
    4. Per clause: simplify, classify risk, generate counter-clause, predict risks
    5. Generate overall summary
    6. Store in MongoDB
    7. Callback to Core API
    """
    # Step 1: Download file
    file_bytes = download_file_from_minio(file_key)

    # Step 2: Extract text and split into clauses
    text = extract_text(file_bytes)
    raw_clauses = split_into_clauses(text)

    if not raw_clauses:
        raise ValueError("Could not extract any clauses from the document.")

    # Step 3: Detect contract type (use first 2000 chars)
    contract_type_result = await detect_contract_type(text[:2000])
    contract_type = contract_type_result.contract_type

    # Step 4: Process each clause in parallel (limit concurrency to avoid rate limits)
    semaphore = asyncio.Semaphore(5)

    async def process_clause(clause) -> dict:
        async with semaphore:
            clause_id = f"cls_{uuid.uuid4().hex[:20]}"

            simplification = await simplify_clause(clause.text, contract_type)
            risk = await classify_risk(clause.text, contract_type)

            counter_clause_result = None
            future_predictions = []

            if risk.risk_level in ("red", "yellow"):
                counter_clause_result = await generate_counter_clause(
                    clause.text, risk.risk_explanation, contract_type
                )
                future_preds = await predict_future_risks(clause.text, risk.risk_explanation)
                future_predictions = [p.model_dump() for p in future_preds.predictions]

            return {
                "id": clause_id,
                "index": clause.index,
                "original_text": clause.text,
                "plain_english": simplification.plain_english,
                "risk_level": risk.risk_level,
                "risk_explanation": risk.risk_explanation,
                "counter_clause": counter_clause_result.counter_clause if counter_clause_result else "",
                "ready_to_send_text": counter_clause_result.ready_to_send_text if counter_clause_result else "",
                "future_predictions": future_predictions,
            }

    processed_clauses = await asyncio.gather(*[process_clause(c) for c in raw_clauses[:30]])  # max 30 clauses

    # Step 5: Compute counts and overall summary
    red_count = sum(1 for c in processed_clauses if c["risk_level"] == "red")
    yellow_count = sum(1 for c in processed_clauses if c["risk_level"] == "yellow")
    green_count = sum(1 for c in processed_clauses if c["risk_level"] == "green")

    clause_summaries = [c["plain_english"] for c in processed_clauses]
    summary_result = await generate_overall_summary(
        contract_type, red_count, yellow_count, green_count, clause_summaries
    )

    analysis_doc = {
        "_id": f"ana_{uuid.uuid4().hex[:20]}",
        "contract_id": contract_id,
        "contract_type": contract_type,
        "overall_risk_score": summary_result.overall_risk_score,
        "summary": summary_result.summary,
        "clauses": list(processed_clauses),
        "red_flag_count": red_count,
        "yellow_flag_count": yellow_count,
        "green_flag_count": green_count,
    }

    # Step 6: Store in MongoDB
    from app.db.mongo import get_db
    db = get_db()
    await db.analyses.insert_one(analysis_doc)
    analysis_id: str = analysis_doc["_id"]

    # Step 7: Callback to Core API
    async with httpx.AsyncClient(timeout=30) as client:
        await client.post(
            f"{settings.core_api_callback_url}/{contract_id}/callback",
            json={
                "status": "analysed",
                "contractType": contract_type,
                "analysisId": analysis_id,
            },
            headers={"x-internal-secret": settings.internal_callback_secret},
        )

    return {"analysis_id": analysis_id}


# ─── Celery Task ──────────────────────────────────────────────────────────────

@celery_app.task(name="worker.analyse_contract", bind=True, max_retries=3)
def analyse_contract(
    self,
    contract_id: str,
    file_key: str,
    counterparty_name: str | None = None,
) -> dict:
    """
    Celery task entry point. Runs the async pipeline in a new event loop.
    """
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            # Connect MongoDB for this worker process
            loop.run_until_complete(__import__("app.db.mongo", fromlist=["connect_mongo"]).connect_mongo())
            result = loop.run_until_complete(
                _run_analysis_pipeline(contract_id, file_key, counterparty_name)
            )
        finally:
            loop.close()
        return result
    except Exception as exc:
        # Notify Core API of failure
        try:
            import httpx as _httpx
            _httpx.post(
                f"{settings.core_api_callback_url}/{contract_id}/callback",
                json={"status": "error"},
                headers={"x-internal-secret": settings.internal_callback_secret},
                timeout=10,
            )
        except Exception:
            pass
        raise self.retry(exc=exc, countdown=60)
