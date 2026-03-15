"""
LangChain Chain Definitions
All LLM interactions for ContractSense live here.
Only this service is allowed to call the OpenAI API.
"""

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import Literal
from app.config import settings


# ─── LLM Instance ─────────────────────────────────────────────────────────────

def get_llm() -> ChatOpenAI:
    return ChatOpenAI(
        model=settings.openai_model,
        temperature=settings.openai_temperature,
        api_key=settings.openai_api_key,
    )


# ─── Output Models ────────────────────────────────────────────────────────────

class ContractTypeOutput(BaseModel):
    contract_type: Literal["employment", "freelance", "nda", "lease", "property", "service", "partnership", "loan", "other"]
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str


class ClauseSimplificationOutput(BaseModel):
    plain_english: str


class RiskClassificationOutput(BaseModel):
    risk_level: Literal["red", "yellow", "green"]
    risk_explanation: str


class CounterClauseOutput(BaseModel):
    counter_clause: str
    ready_to_send_text: str


class FuturePredictionItem(BaseModel):
    scenario: str
    risk: str
    advice: str


class FuturePredictionsOutput(BaseModel):
    predictions: list[FuturePredictionItem]


class OverallSummaryOutput(BaseModel):
    overall_risk_score: int = Field(ge=0, le=100)
    summary: str


# ─── Chain: Contract Type Detection ──────────────────────────────────────────

async def detect_contract_type(text_sample: str) -> ContractTypeOutput:
    """Classify the type of contract from the first ~2000 chars."""
    parser = PydanticOutputParser(pydantic_object=ContractTypeOutput)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a legal expert. Classify the contract type from the given text excerpt."),
        ("human", "Contract excerpt:\n\n{text}\n\n{format_instructions}"),
    ])
    chain = prompt | get_llm() | parser
    return await chain.ainvoke({
        "text": text_sample[:2000],
        "format_instructions": parser.get_format_instructions(),
    })


# ─── Chain: Plain English Simplification ─────────────────────────────────────

async def simplify_clause(clause_text: str, contract_type: str) -> ClauseSimplificationOutput:
    """Translate a single clause into plain English."""
    parser = PydanticOutputParser(pydantic_object=ClauseSimplificationOutput)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a legal expert helping non-lawyers understand contracts. Translate the clause into clear, simple English. Be concise (2-3 sentences max)."),
        ("human", "Contract type: {contract_type}\n\nClause:\n{clause}\n\n{format_instructions}"),
    ])
    chain = prompt | get_llm() | parser
    return await chain.ainvoke({
        "contract_type": contract_type,
        "clause": clause_text,
        "format_instructions": parser.get_format_instructions(),
    })


# ─── Chain: Risk Classification ───────────────────────────────────────────────

async def classify_risk(clause_text: str, contract_type: str) -> RiskClassificationOutput:
    """Classify the risk level of a clause: red, yellow, or green."""
    parser = PydanticOutputParser(pydantic_object=RiskClassificationOutput)
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are a legal risk analyst. Classify this contract clause as:\n"
            "- red: dangerous, potentially harmful to the signing party\n"
            "- yellow: requires caution or negotiation\n"
            "- green: standard and acceptable\n"
            "Return a risk_level and a concise risk_explanation (2-3 sentences).",
        ),
        ("human", "Contract type: {contract_type}\n\nClause:\n{clause}\n\n{format_instructions}"),
    ])
    chain = prompt | get_llm() | parser
    return await chain.ainvoke({
        "contract_type": contract_type,
        "clause": clause_text,
        "format_instructions": parser.get_format_instructions(),
    })


# ─── Chain: Counter-Clause Generator ─────────────────────────────────────────

async def generate_counter_clause(
    original_clause: str,
    risk_explanation: str,
    contract_type: str,
) -> CounterClauseOutput:
    """Generate an improved replacement clause and a ready-to-send message."""
    parser = PydanticOutputParser(pydantic_object=CounterClauseOutput)
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are a legal drafter. Rewrite the problematic clause to be fairer and more protective "
            "for the signing party. Also write a professional, email-ready counter-proposal message they can send.",
        ),
        (
            "human",
            "Contract type: {contract_type}\nRisk: {risk_explanation}\n\nOriginal clause:\n{clause}\n\n{format_instructions}",
        ),
    ])
    chain = prompt | get_llm() | parser
    return await chain.ainvoke({
        "contract_type": contract_type,
        "risk_explanation": risk_explanation,
        "clause": original_clause,
        "format_instructions": parser.get_format_instructions(),
    })


# ─── Chain: Future Risk Predictions ──────────────────────────────────────────

async def predict_future_risks(
    clause_text: str,
    risk_explanation: str,
) -> FuturePredictionsOutput:
    """Predict what real-world problems could arise from this clause."""
    parser = PydanticOutputParser(pydantic_object=FuturePredictionsOutput)
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are a legal risk forecaster. Given this clause and why it is risky, "
            "predict 1-3 realistic scenarios where this clause could harm the signing party, "
            "the associated risk, and practical advice.",
        ),
        ("human", "Risk context: {risk}\n\nClause:\n{clause}\n\n{format_instructions}"),
    ])
    chain = prompt | get_llm() | parser
    return await chain.ainvoke({
        "risk": risk_explanation,
        "clause": clause_text,
        "format_instructions": parser.get_format_instructions(),
    })


# ─── Chain: Overall Summary ───────────────────────────────────────────────────

async def generate_overall_summary(
    contract_type: str,
    red_count: int,
    yellow_count: int,
    green_count: int,
    clause_summaries: list[str],
) -> OverallSummaryOutput:
    """Generate an overall risk score (0-100) and executive summary."""
    parser = PydanticOutputParser(pydantic_object=OverallSummaryOutput)
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are a legal risk analyst. Generate an overall_risk_score from 0 (no risk) to 100 (extremely dangerous) "
            "and a 2-3 sentence executive summary for the contract.",
        ),
        (
            "human",
            "Contract type: {contract_type}\n"
            "Red flags: {red}\n"
            "Yellow flags: {yellow}\n"
            "Green clauses: {green}\n\n"
            "Key clause summaries:\n{summaries}\n\n{format_instructions}",
        ),
    ])
    chain = prompt | get_llm() | parser
    return await chain.ainvoke({
        "contract_type": contract_type,
        "red": red_count,
        "yellow": yellow_count,
        "green": green_count,
        "summaries": "\n".join(f"- {s}" for s in clause_summaries[:10]),
        "format_instructions": parser.get_format_instructions(),
    })


# ─── Chain: Outcome Simulator Chat ───────────────────────────────────────────

async def chat_about_contract(
    contract_summary: str,
    clauses_context: str,
    history: list[dict],
    user_message: str,
) -> str:
    """Answer user questions about their contract in context."""
    llm = get_llm()
    messages = [
        (
            "system",
            f"You are a helpful legal assistant for ContractSense. The user has uploaded a contract.\n\n"
            f"Contract summary: {contract_summary}\n\n"
            f"Key clauses:\n{clauses_context}\n\n"
            "Answer the user's questions clearly and helpfully. Always mention when something requires a real lawyer's advice.",
        ),
    ]
    for msg in history[-10:]:  # last 10 messages for context window management
        messages.append((msg["role"], msg["content"]))
    messages.append(("human", user_message))

    prompt = ChatPromptTemplate.from_messages(messages)  # type: ignore[arg-type]
    chain = prompt | llm
    result = await chain.ainvoke({})
    return str(result.content)
