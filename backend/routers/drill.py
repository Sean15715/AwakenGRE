from fastapi import APIRouter, HTTPException
from typing import List

from schemas import (
    GenerateSessionRequest,
    GenerateSessionResponse,
    SubmitAnswersRequest,
    AnalyzeMistakeResponse,
    SessionSummaryRequest,
    SessionSummaryResponse
)
from services.session_service import session_service

router = APIRouter()

@router.post("/generate-session", response_model=GenerateSessionResponse)
async def generate_session(request: GenerateSessionRequest):
    """
    Generate a new GRE session with a passage and 3 questions.
    """
    try:
        return await session_service.create_session(request.difficulty, request.exam_date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate session: {str(e)}")


@router.post("/analyze-mistakes", response_model=List[AnalyzeMistakeResponse])
async def analyze_mistakes(request: SubmitAnswersRequest):
    """
    Analyze mistakes in submitted answers.
    """
    try:
        # Check if session exists first (service returns None if not found)
        # Note: logic slightly changed from main.py which checked explicitly.
        # But service.analyze_mistakes returns None if session not found?
        # Let's check service implementation.
        # It does: session = self.sessions.get(session_id); if not session: return None
        
        result = await session_service.analyze_mistakes(request.session_id, request.answers)
        
        if result is None:
             raise HTTPException(status_code=404, detail="Session not found")
             
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze mistakes: {str(e)}")


@router.post("/session-summary", response_model=SessionSummaryResponse)
async def session_summary(request: SessionSummaryRequest):
    """
    Generate a motivational summary for the completed session.
    """
    try:
        return await session_service.generate_session_summary(
            request.original_score,
            request.final_mastery,
            request.traps_identified,
            request.exam_date
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

