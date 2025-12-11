/**
 * RedemptionScreen - The core "fix your mistakes" loop
 * Shows passage + question + coach hint
 * User retries with hint. If wrong again, show full explanation.
 */

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RotateCcw, Eye } from 'lucide-react';
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

  // Phases within the redemption of a single question
  // 'VIEW_HINT' -> 'RETRYING' -> 'FEEDBACK' (Correct/Wrong) -> 'REVEALED'
  const [step, setStep] = useState('VIEW_HINT'); 
  const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'
  
  const currentMistake = mistakes[currentMistakeIndex];
  const question = questions.find((q) => q.id === currentMistake.question_id);
  const userWrongAnswer = examAnswers[question.id];

  // Reset state when moving to next mistake
  useEffect(() => {
    setStep('VIEW_HINT');
    setFeedback(null);
  }, [currentMistakeIndex]);

  const handleRetryStart = () => {
    setStep('RETRYING');
  };

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
      setStep('FEEDBACK');
      // Wait for user to click "Next Mistake"
    } else {
      // Wrong again!
      setFeedback('wrong');
      setStep('FEEDBACK');
      // Unlike correct, we don't auto-advance. We wait for user to "Show Answer".
    }
  };

  const handleShowAnswer = () => {
    setStep('REVEALED');
  };

  const handleNextMistake = () => {
    if (currentMistakeIndex < mistakes.length - 1) {
      setCurrentMistakeIndex(currentMistakeIndex + 1);
    } else {
      // All mistakes fixed, go to summary
      setPhase(PHASES.SUMMARY);
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
                  const isCorrect = key === question.correct_option && step === 'REVEALED';
                  const isDisabled = step === 'VIEW_HINT' || step === 'FEEDBACK' || step === 'REVEALED';

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectAnswer(key)}
                      disabled={isDisabled || isWrongAnswer}
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
                                  : isDisabled
                                    ? 'border-[var(--bg-tertiary)] opacity-50 cursor-not-allowed'
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

            {/* Coach Box & Controls */}
            <div className="space-y-4">
              {/* 1. Coach Hint (Always shown initially) */}
              {(step === 'VIEW_HINT' || step === 'RETRYING') && (
                <div className="p-6 rounded-lg border-2 bg-[var(--accent-secondary)]/10 border-[var(--accent-secondary)]">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1 text-[var(--accent-secondary)]" />
                    <div>
                      <h4 className="font-bold mb-2">COACH HINT</h4>
                      <p className="text-sm leading-relaxed">
                        {currentMistake.user_mistake_diagnosis.hint_for_retry}
                      </p>
                      <p className="text-xs mt-3 text-[var(--text-secondary)]">
                        Trap Type: {currentMistake.user_mistake_diagnosis.trap_type}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Retry Button */}
              {step === 'VIEW_HINT' && (
                <button
                  onClick={handleRetryStart}
                  className="w-full py-4 bg-[var(--accent-secondary)] text-white font-bold rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  RETRY QUESTION
                </button>
              )}

              {/* 3. Feedback: Wrong Again */}
              {step === 'FEEDBACK' && feedback === 'wrong' && (
                <div className="p-6 rounded-lg border-2 bg-[var(--accent-red)]/10 border-[var(--accent-red)]">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 flex-shrink-0 mt-1 text-[var(--accent-red)]" />
                    <div>
                      <h4 className="font-bold mb-2">STILL INCORRECT</h4>
                      <p className="text-sm leading-relaxed mb-4">
                        That wasn't quite it. You cannot retry again, but you can view the solution.
                      </p>
                      <button
                        onClick={handleShowAnswer}
                        className="py-2 px-4 bg-[var(--accent-red)] text-white font-semibold rounded hover:bg-red-700 transition-all flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Show Answer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Feedback: Correct */}
              {step === 'FEEDBACK' && feedback === 'correct' && (
                <div className="space-y-4">
                  <div className="p-6 rounded-lg border-2 bg-[var(--accent-green)]/10 border-[var(--accent-green)]">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1 text-[var(--accent-green)]" />
                      <div>
                        <h4 className="font-bold mb-2">NAILED IT</h4>
                        <p className="text-sm leading-relaxed">
                          Good recovery. That's the logic. Moving to next mistake...
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNextMistake}
                    className="w-full py-4 bg-[var(--bg-tertiary)] text-white font-bold rounded-lg hover:bg-[var(--bg-tertiary)]/80 transition-all"
                  >
                    NEXT MISTAKE →
                  </button>
                </div>
              )}

              {/* 5. Answer Reveal (Full Explanation) */}
              {step === 'REVEALED' && (
                <div className="space-y-4">
                  <div className="p-6 rounded-lg border-2 bg-[var(--accent-green)]/10 border-[var(--accent-green)]">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1 text-[var(--accent-green)]" />
                      <div>
                        <h4 className="font-bold mb-2">ANSWER REVEAL</h4>
                        <p className="text-sm leading-relaxed">
                          {currentMistake.user_mistake_diagnosis.full_explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNextMistake}
                    className="w-full py-4 bg-[var(--bg-tertiary)] text-white font-bold rounded-lg hover:bg-[var(--bg-tertiary)]/80 transition-all"
                  >
                    NEXT MISTAKE →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
