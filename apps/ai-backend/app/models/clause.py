from pydantic import BaseModel


class ClauseModel(BaseModel):
    id: str
    index: int
    original_text: str
    plain_english: str
    risk_level: str
    risk_explanation: str
    counter_clause: str
    ready_to_send_text: str
    future_predictions: list[dict]
