from pydantic import BaseModel
from typing import Literal


class AnalyseRequest(BaseModel):
    contract_id: str
    file_key: str
    counterparty_name: str | None = None


class AnalyseResponse(BaseModel):
    task_id: str
    status: Literal["queued"] = "queued"
