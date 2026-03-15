from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.scraper import run_party_intelligence

router = APIRouter()


class PartyIntelligenceRequest(BaseModel):
    contract_id: str
    counterparty_name: str


@router.post("/party-intelligence")
async def party_intelligence(body: PartyIntelligenceRequest) -> dict:
    """
    Run Party Intelligence for a counterparty.
    Scrapes public web and returns trust score + reputation summary.
    """
    try:
        result = await run_party_intelligence(body.counterparty_name)

        # Store in MongoDB
        from app.db.mongo import get_db
        db = get_db()
        doc = {
            "contract_id": body.contract_id,
            "counterparty_name": result.counterparty_name,
            "trust_score": result.trust_score,
            "reputation_summary": result.reputation_summary,
            "red_flags": result.red_flags,
            "sources": [s.model_dump() for s in result.sources],
        }
        await db.party_intelligence.insert_one(doc)
        doc.pop("_id", None)

        return {"success": True, "data": doc, "error": None, "meta": {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
