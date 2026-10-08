from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    allowed_states: List[str]
    allowed_zones: List[str]

class LoginRequest(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "viewer"
    allowed_states: List[str] = []
    allowed_zones: List[str] = []

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    allowed_states: List[str]
    allowed_zones: List[str]

    class Config:
        from_attributes = True

class PreValidationReport(BaseModel):
    period_label: str
    rows_read: int
    rows_valid: int
    rows_rejected: int
    duplicate_agents: List[str]
    is_comm_balanced: bool
    mismatched_comm_count: int
    new_agents_count: int
    missing_agents_to_zerofill: int
    summary: Dict[str, float]

class UploadConfirmRequest(BaseModel):
    month: int
    year: int
    days_in_month: int
    confirmed: bool = True
