/**
 * RedemptionScreen - The core "fix your mistakes" loop
 * Shows passage + question + coach hint
 * User retries with hint. If wrong again, show full explanation.
 */

import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useSession, PHASES } from '../SessionContext';

export default function RedemptionScreen() {
  const {
    passage,
    questions,
    mistakes,
    currentMistakeIndex,
    setCurrentMistakeIndex,
    redemptionAnswers,
    setRedemptionAnswers,
    setPhase,
    examAnswers
  } = useSession();

  const [showHint, setShowHint] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'

  const currentMistake = mistakes[currentMistakeIndex];
  const question = questions.find((q) => q.id === currentMistake.question_id);
  const userWrongAnswer = examAnswers[question.id];

  const handleSelectAnswer = (option) => {
    // Don't allow re-selecting the same wrong answer from exam
    if (option === userWrongAnswer) {
      return;
    }

    setRedemptionAnswers((prev) => ({
      ...prev,
      [question.id]: option
    }));

    // Check if correct
    if (option === question.correct_option) {
      // Correct!
      setFeedback('correct');
      setShowHint(false);
      setShowExplanation(false);

      // Move to next mistake after short delay
      setTimeout(() => {
        if (currentMistakeIndex < mistakes.length - 1) {
          setCurrentMistakeIndex(currentMistakeIndex + 1);
          setFeedback(null);
          setShowHint(true);
          setShowExplanation(false);
        } else {
          // All mistakes fixed, go to summary
          setPhase(PHASES.SUMMARY);
        }
      }, 1500);
    } else {
      // Wrong again!
      setFeedback('wrong');
      setShowHint(false);
      setShowExplanation(true);

      // Move to next mistake after user sees explanation
      setTimeout(() => {
        if (currentMistakeIndex < mistakes.length - 1) {
          setCurrentMistakeIndex(currentMistakeIndex + 1);
          setFeedback(null);
          setShowHint(true);
          setShowExplanation(false);
        } else {
          // All mistakes reviewed, go to summary
          setPhase(PHASES.SUMMARY);
        }
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-[var(--bg-tertiary)]">
          <h2 className="text-2xl font-bold text-[var(--accent-secondary)]">REDEMPTION ARC</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Mistake {currentMistakeIndex + 1} of {mistakes.length} · Fix the logic
          </p>
        </div>

        {/* Split View: Passage Left, Question + Coach Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Passage */}
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg overflow-y-auto max-h-[80vh]">
            <h3 className="text-xl font-bold mb-4 text-[var(--accent-secondary)]">
              {passage.title}
            </h3>
            <div className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {passage.text}
            </div>
          </div>

          {/* RIGHT: Question + Coach Box */}
          <div className="space-y-6">
            {/* Question */}
            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
              <p className="text-lg text-[var(--text-primary)] mb-6 leading-relaxed">
                {question.text}
              </p>

              {/* Options */}
              <div className="space-y-3">
                {Object.entries(question.options).map(([key, value]) => {
                  const isWrongAnswer = key === userWrongAnswer;
                  const isSelected = redemptionAnswers[question.id] === key;
                  const isCorrect = key === question.correct_option && showExplanation;

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectAnswer(key)}
                      disabled={isWrongAnswer || feedback !== null}
                      className={`
                        w-full text-left p-4 rounded-lg border-2 transition-all relative
                        ${isWrongAnswer
                          ? 'border-[var(--accent-red)] bg-[var(--accent-red)]/10 line-through opacity-60 cursor-not-allowed'
                          : isSelected && feedback === 'correct'
                            ? 'border-[var(--accent-green)] bg-[var(--accent-green)]/10'
                            : isSelected && feedback === 'wrong'
                              ? 'border-[var(--accent-red)] bg-[var(--accent-red)]/10'
                              : isCorrect
                                ? 'border-[var(--accent-green)] bg-[var(--accent-green)]/10'
                                : isSelected
                                  ? 'border-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10'
                                  : 'border-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]'
                        }
                      `}
                    >
                      <span className="font-bold mr-3">{key}.</span>
                      <span className={isWrongAnswer ? 'text-[var(--accent-red)]' : ''}>
                        {value}
                      </span>

                      {/* Icons */}
                      {isWrongAnswer && (
                        <XCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[var(--accent-red)]" />
                      )}
                      {isSelected && feedback === 'correct' && (
                        <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[var(--accent-green)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coach Box */}
            <div className={`
              p-6 rounded-lg border-2
              ${showHint
                ? 'bg-[var(--accent-secondary)]/10 border-[var(--accent-secondary)]'
                : showExplanation
                  ? 'bg-[var(--accent-red)]/10 border-[var(--accent-red)]'
                  : 'bg-[var(--accent-green)]/10 border-[var(--accent-green)]'
              }
            `}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`
                  w-6 h-6 flex-shrink-0 mt-1
                  ${showHint ? 'text-[var(--accent-secondary)]' : showExplanation ? 'text-[var(--accent-red)]' : 'text-[var(--accent-green)]'}
                `} />
                <div>
                  <h4 className="font-bold mb-2">
                    {showHint && 'COACH HINT'}
                    {showExplanation && 'ANSWER REVEAL'}
                    {feedback === 'correct' && 'NAILED IT'}
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {showHint && currentMistake.user_mistake_diagnosis.hint_for_retry}
                    {showExplanation && currentMistake.user_mistake_diagnosis.full_explanation}
                    {feedback === 'correct' && "Good recovery. That's the logic. Moving to next mistake..."}
                  </p>
                  {showHint && (
                    <p className="text-xs mt-3 text-[var(--text-secondary)]">
                      Trap Type: {currentMistake.user_mistake_diagnosis.trap_type}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
