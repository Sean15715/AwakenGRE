from typing import Dict, List, Optional
import asyncio
from schemas import (
    GenerateSessionResponse,
    AnalyzeMistakeResponse,
    SessionSummaryResponse,
    SessionData,
    Question
)
from services.llm_service import (
    generate_passage_and_questions,
    analyze_mistake,
    generate_summary
)

class SessionService:
    def __init__(self):
        # In-memory storage
        self.sessions: Dict[str, SessionData] = {}

    async def create_session(self, difficulty: str, exam_date: str) -> GenerateSessionResponse:
        """
        Generate a new session calling the LLM service.
        """
        # Call LLM to generate content
        passage, questions = await generate_passage_and_questions(difficulty)

        # Create response object (which generates session_id)
        response = GenerateSessionResponse(
            passage=passage,
            questions=questions
        )

        # Store session data in memory
        self.sessions[response.session_id] = SessionData(
            session_id=response.session_id,
            passage=passage,
            questions=questions,
            difficulty=difficulty,
            exam_date=exam_date
        )

        return response

    async def get_session(self, session_id: str) -> Optional[SessionData]:
        return self.sessions.get(session_id)

    async def analyze_mistakes(self, session_id: str, answers: Dict[str, str]) -> List[AnalyzeMistakeResponse]:
        """
        Analyze mistakes for a given session.
        """
        session = self.sessions.get(session_id)
        if not session:
            return None

        # Identify wrong answers
        mistakes = []
        for question in session.questions:
            user_answer = answers.get(question.id)
            if user_answer and user_answer != question.correct_option:
                mistakes.append({
                    "question": question,
                    "user_answer": user_answer,
                    "correct_answer": question.correct_option
                })

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

    async def generate_session_summary(self, original_score: int, final_mastery: float, 
                                     traps_identified: List[str], exam_date: str) -> SessionSummaryResponse:
        """
        Generate a motivational summary.
        """
        coach_message = await generate_summary(
            original_score=original_score,
            final_mastery=final_mastery,
            traps_identified=traps_identified,
            exam_date=exam_date
        )

        return SessionSummaryResponse(
            original_score=original_score,
            final_mastery=final_mastery,
            traps_identified=traps_identified,
            coach_message=coach_message
        )

# Singleton instance
session_service = SessionService()

