from pydantic import BaseModel
from typing import Literal


class FuturePrediction(BaseModel):
    scenario: str
    risk: str
    advice: str


class ClauseAnalysis(BaseModel):
    id: str
    index: int
    original_text: str
    plain_english: str
    risk_level: Literal["red", "yellow", "green"]
    risk_explanation: str
    counter_clause: str
    ready_to_send_text: str
    future_predictions: list[FuturePrediction]


class AnalysisDocument(BaseModel):
    contract_id: str
    contract_type: str
    overall_risk_score: int
    summary: str
    clauses: list[ClauseAnalysis]
    red_flag_count: int
    yellow_flag_count: int
    green_flag_count: int
