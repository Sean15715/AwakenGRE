from typing import Dict, List, Optional
import asyncio
from schemas import (
    GenerateSessionResponse,
    AnalyzeMistakeResponse,
    SessionSummaryResponse,
    SessionData,
    Question,
    Passage
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
        Generate a new session using local file (offline mode).
        Randomly selects a passage from backend/questions/*.json
        """
        import json
        import os
        import random

        # Load from local file
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        questions_dir = os.path.join(base_path, "questions")
        
        try:
            # List all passage files
            passage_files = [f for f in os.listdir(questions_dir) if f.startswith("passage") and f.endswith(".json")]
            
            if not passage_files:
                 raise FileNotFoundError("No passage files found")

            # TEMPORARY DEBUG: Filter out files with only 1 question to test frontend rendering
            # We need to peek into files or just assume based on knowledge
            # Let's just log what we picked
            
            selected_file = random.choice(passage_files)
            file_path = os.path.join(questions_dir, selected_file)
            
            print(f"[DEBUG] Selected file: {selected_file}")

            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                passage_data = data[0]
                
            questions_count = len(passage_data["questions"])
            print(f"[DEBUG] Questions found in file: {questions_count}")
            
            passage = Passage(
                title=f"Passage {selected_file.replace('.json', '')}", # Use filename as title or extract if avail
                text=passage_data["text"]
            )
            
            questions = []
            for q in passage_data["questions"]:
                # Parse "q_001" -> 1, or "1" -> 1, or hash string
                try:
                    raw_id = str(q["id"])
                    if "_" in raw_id:
                        q_id = int(raw_id.split("_")[1])
                    else:
                        q_id = int(raw_id)
                except (IndexError, ValueError, AttributeError):
                    # Fallback if id format is different
                    q_id = abs(hash(str(q["id"]))) % 100000 
                
                questions.append(Question(
                    id=q_id,
                    text=q["question_text"],
                    options=q["options"],
                    correct_option=q["correct_option"]
                ))
                
        except Exception as e:
            print(f"Error loading local file: {e}")
            # Fallback to LLM or empty if file fails
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

