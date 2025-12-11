import json
from typing import Tuple, List, Dict
from pathlib import Path
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

async def analyze_mistake(
    passage: Passage, 
    question: Question, 
    user_wrong_answer: str, 
    correct_answer: str
) -> MistakeDiagnosis:
    """
    Analyzes why the user might have chosen the wrong answer.
    """
    
    # Resolve option text from keys (e.g., "A" -> "The author implies...")
    # user_wrong_answer and correct_answer might be keys (A, B) or values.
    # The dictionary lookups handle keys. If they are already values or keys not in dict, use as is.
    user_wrong_answer_text = question.options.get(user_wrong_answer, user_wrong_answer)
    correct_answer_text = question.options.get(correct_answer, correct_answer)

    # Load prompt template
    try:
        # Resolves to backend/prompts/mistake_analyse.txt
        prompt_path = Path(__file__).parent.parent / "prompts" / "mistake_analyse.txt"
        with open(prompt_path, "r", encoding="utf-8") as f:
            prompt_template = f.read()
            
        prompt = prompt_template.format(
            name="Student",
            passage=passage.text,
            question=question.text,
            picked_wrong_answer_text=user_wrong_answer_text,
            correct_answer_text=correct_answer_text
        )
    except Exception as e:
        print(f"Error preparing prompt: {e}")
        return MistakeDiagnosis(
            trap_type="System Error",
            hint_for_retry="Could not generate analysis.",
            full_explanation="Error loading analysis prompt."
        )
    
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
            trap_type=data.get("trap_type", "Unknown"),
            hint_for_retry=data.get("hint_for_retry", "Review the passage carefully."),
            full_explanation=data.get("full_explanation", "No explanation provided.")
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
    
    # Load prompt template
    try:
        # Resolves to backend/prompts/summarise.txt
        prompt_path = Path(__file__).parent.parent / "prompts" / "summarise.txt"
        with open(prompt_path, "r", encoding="utf-8") as f:
            prompt_template = f.read()
            
        prompt = prompt_template.format(
            name="Student",
            original_score=original_score,
            final_mastery=final_mastery,
            traps_identified=", ".join(traps_identified) if traps_identified else "None",
            exam_date=exam_date
        )
    except Exception as e:
        print(f"Error preparing summary prompt: {e}")
        return CoachMessage(
            headline="Session Complete",
            body="Good job completing the drill."
        )
    
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
            headline=data.get("headline", "Session Summary"),
            body=data.get("body", "Keep practicing.")
        )
        
    except Exception as e:
        print(f"LLM Error in summary: {e}")
        return CoachMessage(
            headline="Session Complete",
            body="Good job completing the drill."
        )
