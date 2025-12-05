"""
FastAPI Backend for GRE Drill Sergeant MVP.
Handles session generation, mistake analysis, and summary generation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from typing import Dict

from models import (
    GenerateSessionRequest,
    GenerateSessionResponse,
    SubmitAnswersRequest,
    AnalyzeMistakeResponse,
    SessionSummaryRequest,
    SessionSummaryResponse,
    SessionData,
    Question
)
from llm_service import (
    generate_passage_and_questions,
    analyze_mistake,
    generate_summary
)


# ============================================================================
# APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="GRE Drill Sergeant API",
    description="High-intensity GRE Reading Comprehension drill backend",
    version="1.0.0"
)

# CORS middleware (allow frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# IN-MEMORY SESSION STORAGE (MVP ONLY)
# ============================================================================

sessions: Dict[str, SessionData] = {}


# ============================================================================
# ROUTES
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "alive", "service": "GRE Drill Sergeant API"}


@app.post("/generate-session", response_model=GenerateSessionResponse)
async def generate_session(request: GenerateSessionRequest):
    """
    Generate a new GRE session with a passage and 3 questions.
    This is an async operation that calls the LLM to create custom content.
    """
    try:
        # Call LLM to generate content
        passage, questions = await generate_passage_and_questions(request.difficulty)

        # Create response
        response = GenerateSessionResponse(
            passage=passage,
            questions=questions
        )

        # Store session data in memory
        sessions[response.session_id] = SessionData(
            session_id=response.session_id,
            passage=passage,
            questions=questions,
            difficulty=request.difficulty,
            exam_date=request.exam_date
        )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate session: {str(e)}")


@app.post("/analyze-mistakes", response_model=list[AnalyzeMistakeResponse])
async def analyze_mistakes(request: SubmitAnswersRequest):
    """
    Analyze mistakes in submitted answers.
    Spawns PARALLEL LLM calls (one per wrong answer) for efficiency.
    """
    try:
        # Retrieve session data
        session = sessions.get(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Identify wrong answers
        mistakes = []
        for question in session.questions:
            user_answer = request.answers.get(question.id)
            if user_answer and user_answer != question.correct_option:
                mistakes.append({
                    "question": question,
                    "user_answer": user_answer,
                    "correct_answer": question.correct_option
                })

        # If no mistakes, return empty list
        if not mistakes:
            return []

        # Spawn PARALLEL LLM calls (one per mistake)
        analysis_tasks = [
            analyze_mistake(
                passage=session.passage,
                question=mistake["question"],
                user_wrong_answer=mistake["user_answer"],
                correct_answer=mistake["correct_answer"]
            )
            for mistake in mistakes
        ]

        # Wait for all analyses to complete
        diagnoses = await asyncio.gather(*analysis_tasks)

        # Build responses
        responses = [
            AnalyzeMistakeResponse(
                question_id=mistakes[i]["question"].id,
                user_mistake_diagnosis=diagnoses[i]
            )
            for i in range(len(mistakes))
        ]

        return responses

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze mistakes: {str(e)}")


@app.post("/session-summary", response_model=SessionSummaryResponse)
async def session_summary(request: SessionSummaryRequest):
    """
    Generate a motivational summary for the completed session.
    """
    try:
        # Call LLM to generate summary
        coach_message = await generate_summary(
            original_score=request.original_score,
            final_mastery=request.final_mastery,
            traps_identified=request.traps_identified,
            exam_date=request.exam_date
        )

        return SessionSummaryResponse(
            original_score=request.original_score,
            final_mastery=request.final_mastery,
            traps_identified=request.traps_identified,
            coach_message=coach_message
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")


# ============================================================================
# RUN SERVER (for local development)
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
