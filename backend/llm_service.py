"""
Mock LLM Service for MVP.
These functions simulate async LLM calls with hardcoded responses.
Later, we'll replace these with real OpenAI/Anthropic API calls.
"""

import asyncio
from typing import Literal
from models import Passage, Question, MistakeDiagnosis, CoachMessage


# ============================================================================
# MOCK LLM FUNCTIONS
# ============================================================================

async def generate_passage_and_questions(
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]
) -> tuple[Passage, list[Question]]:
    """
    Role: The Content Generator
    Simulates LLM call to create a GRE passage + 3 questions.
    """
    # Simulate API latency
    await asyncio.sleep(1)

    # Mock data based on difficulty
    if difficulty == "Beginner":
        passage = Passage(
            title="The History of Urban Planning",
            text=(
                "Urban planning emerged in the 19th century as cities grew rapidly due to industrialization. "
                "Planners sought to address overcrowding, sanitation issues, and traffic congestion. "
                "Early approaches emphasized functional zoning—separating residential, commercial, and industrial areas. "
                "Critics argue this model created car-dependent sprawl. Modern urban planning now prioritizes mixed-use "
                "developments and public transportation to foster walkable, sustainable communities."
            )
        )
    elif difficulty == "Intermediate":
        passage = Passage(
            title="The Thermodynamics of Biological Systems",
            text=(
                "Living organisms appear to defy the second law of thermodynamics, which states that entropy—disorder—"
                "always increases in a closed system. Yet cells create highly ordered structures from simple molecules. "
                "This paradox resolves when we consider that organisms are open systems: they consume energy from their "
                "environment (food, sunlight) and export entropy as waste heat. The local decrease in entropy within a "
                "cell is more than compensated by the entropy increase in the surroundings, ensuring compliance with "
                "thermodynamic law."
            )
        )
    else:  # Advanced
        passage = Passage(
            title="Epistemological Limits of Quantum Measurement",
            text=(
                "The Copenhagen interpretation posits that quantum systems exist in superposition until measurement "
                "collapses the wavefunction into a definite state. This raises profound questions: does observation "
                "create reality, or merely reveal pre-existing properties? Bohr argued the former, suggesting that "
                "the act of measurement is fundamentally invasive, precluding simultaneous knowledge of conjugate "
                "variables like position and momentum. However, recent decoherence theories propose that interaction "
                "with the environment—not conscious observation—drives wavefunction collapse, sidestepping anthropocentric "
                "interpretations while preserving predictive accuracy."
            )
        )

    questions = [
        Question(
            id=101,
            text="The primary purpose of the passage is to",
            options={
                "A": "Refute a commonly held misconception",
                "B": "Describe the historical development of a scientific field",
                "C": "Argue for the superiority of one theoretical model over another",
                "D": "Reconcile an apparent contradiction in a scientific principle",
                "E": "Compare two competing approaches to a problem"
            },
            correct_option="D"
        ),
        Question(
            id=102,
            text="According to the passage, which of the following is true?",
            options={
                "A": "Organisms create order by violating thermodynamic laws" if difficulty != "Beginner" else "Urban planning solved all issues of industrialization",
                "B": "Local entropy decrease requires environmental entropy increase" if difficulty != "Beginner" else "Functional zoning eliminated car dependency",
                "C": "Closed systems can sustain life indefinitely" if difficulty != "Beginner" else "Modern planning prioritizes mixed-use development",
                "D": "Entropy always decreases in biological systems" if difficulty != "Beginner" else "Early planners ignored traffic congestion",
                "E": "Thermodynamic laws do not apply to open systems" if difficulty != "Beginner" else "Industrial areas were never separated from residential zones"
            },
            correct_option="B" if difficulty != "Beginner" else "C"
        ),
        Question(
            id=103,
            text="The author mentions [specific detail] in order to",
            options={
                "A": "Provide evidence for a claim",
                "B": "Introduce a counterargument",
                "C": "Illustrate a concept with an example",
                "D": "Challenge an assumption",
                "E": "Clarify a technical term"
            },
            correct_option="A"
        )
    ]

    return passage, questions


async def analyze_mistake(
    passage: Passage,
    question: Question,
    user_wrong_answer: str,
    correct_answer: str
) -> MistakeDiagnosis:
    """
    Role: The Logic Surgeon
    Simulates LLM call to diagnose why the user got the question wrong.
    CRITICAL: hint_for_retry must NOT reveal the correct answer.
    """
    # Simulate API latency
    await asyncio.sleep(0.5)

    # Mock diagnosis (in production, this would be LLM-generated)
    trap_types = ["Out of Scope", "Distortion", "Extreme Language", "Reversal"]

    return MistakeDiagnosis(
        trap_type=trap_types[question.id % len(trap_types)],
        hint_for_retry=(
            f"You chose {user_wrong_answer}. Look carefully at the passage. "
            f"Does the text actually support the claim in option {user_wrong_answer}? "
            f"Check for words like 'always', 'never', or 'only'—these are often traps. "
            f"Re-read the relevant section and ask: is this stated explicitly, or am I inferring too much?"
        ),
        full_explanation=(
            f"The correct answer is {correct_answer}. "
            f"Option {user_wrong_answer} is incorrect because it [specific flaw, e.g., distorts the author's claim]. "
            f"Option {correct_answer} is correct because [evidence from text, e.g., lines 3-4 directly state this]."
        )
    )


async def generate_summary(
    original_score: str,
    final_mastery: str,
    traps_identified: list[str],
    exam_date: str
) -> CoachMessage:
    """
    Role: The Hype Man
    Simulates LLM call to generate a motivational summary.
    """
    # Simulate API latency
    await asyncio.sleep(0.5)

    # Mock motivational message
    return CoachMessage(
        headline="Solid recovery.",
        body=(
            f"You started {original_score}, ended {final_mastery}. "
            f"You fell for {', '.join(traps_identified)} traps—classic mistakes. "
            f"But you fixed them. That's the skill. "
            f"Exam date: {exam_date}. Show up tomorrow. Consistency > intensity."
        )
    )
