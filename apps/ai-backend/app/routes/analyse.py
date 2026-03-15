from fastapi import APIRouter, HTTPException
from app.models.contract import AnalyseRequest, AnalyseResponse
from app.worker import analyse_contract

router = APIRouter()


@router.post("/analyse", response_model=AnalyseResponse)
async def trigger_analysis(body: AnalyseRequest) -> AnalyseResponse:
    """
    Queue a contract analysis job via Celery.
    This is an internal endpoint — called only when Core API needs to trigger
    analysis directly (e.g., re-queuing). Normal flow goes through Redis queue.
    """
    try:
        task = analyse_contract.delay(
            contract_id=body.contract_id,
            file_key=body.file_key,
            counterparty_name=body.counterparty_name,
        )
        return AnalyseResponse(task_id=task.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
