/**
 * ExamScreen - Silent exam mode with split view (passage left, questions right)
 * NO feedback during exam. Pure testing environment.
 */

import { useState } from 'react';
import { useSession, PHASES } from '../SessionContext';
import { analyzeMistakes } from '../api';

export default function ExamScreen() {
  const {
    passage,
    questions,
    examAnswers,
    setExamAnswers,
    setPhase,
    setMistakes,
    setOriginalScore,
    setTrapsIdentified,
    calculateScores,
    sessionId
  } = useSession();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (option) => {
    setExamAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = questions.filter((q) => !examAnswers[q.id]).length;
    if (unansweredCount > 0) {
      if (!confirm(`You have ${unansweredCount} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      setPhase(PHASES.ANALYZING);

      // Call backend to analyze mistakes
      const mistakesData = await analyzeMistakes({
        session_id: sessionId,
        answers: examAnswers
      });

      // Calculate scores
      const scores = calculateScores();
      setOriginalScore(scores.original);

      // If no mistakes, skip redemption and go straight to summary
      if (mistakesData.length === 0) {
        setMistakes([]);
        setTrapsIdentified([]);
        setPhase(PHASES.SUMMARY);
      } else {
        // Set mistakes and move to redemption phase
        setMistakes(mistakesData);
        const traps = mistakesData.map((m) => m.user_mistake_diagnosis.trap_type);
        setTrapsIdentified(traps);
        setPhase(PHASES.REDEMPTION);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
      setPhase(PHASES.EXAM);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--accent-secondary)] mx-auto mb-4"></div>
          <p className="text-xl text-[var(--text-secondary)]">Analyzing Answers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-[var(--bg-tertiary)]">
          <h2 className="text-2xl font-bold">EXAM MODE</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Silent testing. No feedback until you submit.
          </p>
        </div>

        {/* Split View: Passage Left, Question Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          {/* LEFT: Passage */}
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg overflow-y-auto max-h-[70vh]">
            <h3 className="text-xl font-bold mb-4 text-[var(--accent-secondary)]">
              {passage.title}
            </h3>
            <div className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {passage.text}
            </div>
          </div>

          {/* RIGHT: Question */}
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
            {/* Question Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-[var(--text-secondary)]">
                  QUESTION {currentQuestionIndex + 1} OF {questions.length}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">
                  {Object.keys(examAnswers).length}/{questions.length} answered
                </span>
              </div>
              <div className="w-full bg-[var(--bg-tertiary)] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-secondary)] transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <p className="text-lg text-[var(--text-primary)] leading-relaxed">
                {currentQuestion.text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleSelectAnswer(key)}
                  className={`
                    w-full text-left p-4 rounded-lg border-2 transition-all
                    ${examAnswers[currentQuestion.id] === key
                      ? 'border-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10'
                      : 'border-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'
                    }
                  `}
                >
                  <span className="font-bold mr-3">{key}.</span>
                  <span>{value}</span>
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex-1 py-3 bg-[var(--bg-tertiary)] text-white font-semibold rounded-lg hover:bg-[var(--bg-tertiary)]/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-[var(--bg-tertiary)] text-white font-semibold rounded-lg hover:bg-[var(--bg-tertiary)]/80 transition-all"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-[var(--accent-secondary)] text-white font-bold rounded-lg hover:bg-purple-700 transition-all"
                >
                  SUBMIT
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
