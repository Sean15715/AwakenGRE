import json
from typing import Tuple, List, Dict
from openai import AsyncOpenAI
from schemas import (
    Passage,
    Question,
    MistakeDiagnosis,
    CoachMessage
)

# Initialize DeepSeek Client (using your provided key and endpoint)
client = AsyncOpenAI(
    api_key="sk-2bf277804f9d4da39cf36d7b05d8dbac", 
    base_url="https://api.deepseek.com"
)

    async def generate_passage_and_questions(difficulty: str) -> Tuple[Passage, List[Question]]:
    """
    Generates a GRE Reading Comprehension passage and varying number of questions (2-4) using DeepSeek.
    """
    prompt = f"""
    Generate a GRE Reading Comprehension passage and 2-4 questions (randomly decide number).
    Difficulty: {difficulty}
    
    Return ONLY a JSON object with the following structure (no markdown, no extra text):
    {{
        "title": "Passage Title",
        "text": "The full text of the academic passage...",
        "questions": [
            {{
                "id": 1,
                "text": "Question stem...",
                "options": {{
                    "A": "Option A text",
                    "B": "Option B text",
                    "C": "Option C text",
                    "D": "Option D text",
                    "E": "Option E text"
                }},
                "correct_option": "A"
            }}
        ]
    }}
    """

    try:
        response = await client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a GRE exam content generator. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            stream=False,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        
        passage = Passage(title=data["title"], text=data["text"])
        questions = [
            Question(
                id=q["id"], 
                text=q["text"], 
                options=q["options"], 
                correct_option=q["correct_option"]
            ) for q in data["questions"]
        ]
        
        return passage, questions

    except Exception as e:
        print(f"LLM Error: {e}")
        # Fallback data for dev/testing if LLM fails
        return (
            Passage(title="Error Fallback", text="LLM generation failed. Please try again."),
            []
        )

async def analyze_mistake(
    passage: Passage, 
    question: Question, 
    user_wrong_answer: str, 
    correct_answer: str
) -> MistakeDiagnosis:
    """
    Analyzes why the user might have chosen the wrong answer.
    """
    prompt = f"""
    The user made a mistake on a GRE Reading Comprehension question.
    
    Passage: {passage.text[:500]}...
    Question: {question.text}
    User Answer: {user_wrong_answer} (Incorrect)
    Correct Answer: {correct_answer}
    
    Analyze the mistake. Return ONLY a JSON object:
    {{
        "trap_type": "One of: Out of Scope, Distortion, Extreme Language, True but Irrelevant, Opposite",
        "hint_for_retry": "A short hint to help them find the right answer without giving it away.",
        "full_explanation": "A detailed explanation of why the user's answer is wrong and why the correct answer is right."
    }}
    """
    
    try:
        response = await client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a GRE tutor. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            stream=False,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        
        return MistakeDiagnosis(
            trap_type=data["trap_type"],
            hint_for_retry=data["hint_for_retry"],
            full_explanation=data["full_explanation"]
        )
        
    except Exception as e:
        print(f"LLM Error in analyze: {e}")
        return MistakeDiagnosis(
            trap_type="Unknown",
            hint_for_retry="Check the text again.",
            full_explanation="Error generating explanation."
        )

async def generate_summary(
    original_score: int, 
    final_mastery: float, 
    traps_identified: List[str], 
    exam_date: str
) -> CoachMessage:
    """
    Generates a motivational summary.
    """
    prompt = f"""
    Generate a short, tough-love coach summary for a student.
    Score: {original_score}
    Exam Date: {exam_date}
    Traps fell into: {", ".join(traps_identified)}
    
    Return ONLY a JSON object:
    {{
        "headline": "Short punchy headline",
        "body": "2-3 sentences of feedback."
    }}
    """
    
    try:
        response = await client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a tough GRE drill sergeant. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            stream=False,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        
        return CoachMessage(
            headline=data["headline"],
            body=data["body"]
        )
        
    except Exception as e:
        return CoachMessage(
            headline="Session Complete",
            body="Good job completing the drill."
        )

