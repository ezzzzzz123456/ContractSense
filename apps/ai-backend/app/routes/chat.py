from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm_chains import chat_about_contract
from app.db.mongo import get_db

router = APIRouter()


class ChatRequest(BaseModel):
    contract_id: str
    message: str
    history: list[dict] = []


class ChatResponse(BaseModel):
    reply: str
    sources: list[str] = []


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    """
    Outcome Simulator chat — context-aware conversation about a specific contract.
    """
    try:
        db = get_db()
        analysis = await db.analyses.find_one({"contract_id": body.contract_id})
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found for this contract")

        summary = analysis.get("summary", "")
        clauses = analysis.get("clauses", [])
        clauses_context = "\n".join(
            f"Clause {c['index']+1} ({c['risk_level'].upper()}): {c['plain_english']}"
            for c in clauses[:15]
        )

        reply = await chat_about_contract(
            contract_summary=summary,
            clauses_context=clauses_context,
            history=body.history,
            user_message=body.message,
        )

        # Extract referenced clause IDs (simple heuristic)
        source_ids = [c["id"] for c in clauses if c["plain_english"][:30].lower() in reply.lower()]

        return ChatResponse(reply=reply, sources=source_ids[:3])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
