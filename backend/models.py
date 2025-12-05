"""
Pydantic models for GRE Drill Sergeant API.
These define the strict JSON contracts between frontend and backend.
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Literal
from uuid import uuid4


# ============================================================================
# REQUEST MODELS
# ============================================================================

class GenerateSessionRequest(BaseModel):
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]
    exam_date: str  # ISO format (e.g., "2025-12-15")


class SubmitAnswersRequest(BaseModel):
    session_id: str
    answers: Dict[int, str]  # {question_id: selected_option (e.g., "A", "B")}


class SessionSummaryRequest(BaseModel):
    session_id: str
    original_score: str  # e.g., "1/3"
    final_mastery: str  # e.g., "3/3"
    traps_identified: List[str]
    exam_date: str


# ============================================================================
# RESPONSE MODELS
# ============================================================================

class Passage(BaseModel):
    title: str
    text: str


class Question(BaseModel):
    id: int
    text: str
    options: Dict[str, str]  # {"A": "option text", "B": "...", ...}
    correct_option: str  # "A", "B", "C", "D", or "E"


class GenerateSessionResponse(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid4()))
    passage: Passage
    questions: List[Question]


class MistakeDiagnosis(BaseModel):
    trap_type: str  # e.g., "Out of Scope", "Distortion", "Extreme Language"
    hint_for_retry: str  # Spoiler-free logic attack
    full_explanation: str  # Answer reveal (shown only after 2nd wrong attempt)


class AnalyzeMistakeResponse(BaseModel):
    question_id: int
    user_mistake_diagnosis: MistakeDiagnosis


class CoachMessage(BaseModel):
    headline: str
    body: str


class SessionSummaryResponse(BaseModel):
    original_score: str
    final_mastery: str
    traps_identified: List[str]
    coach_message: CoachMessage


# ============================================================================
# INTERNAL DATA STRUCTURES (Not exposed via API)
# ============================================================================

class SessionData(BaseModel):
    """In-memory storage for session state (MVP only)."""
    session_id: str
    passage: Passage
    questions: List[Question]
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]
    exam_date: str
