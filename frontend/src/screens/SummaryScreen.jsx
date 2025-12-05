/**
 * SummaryScreen - Victory lap / session summary
 * Shows original score, final mastery, traps identified, and coach message
 */

import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, AlertTriangle, RotateCcw, Settings, CheckCircle } from 'lucide-react';
import { useSession, PHASES } from '../SessionContext';
import { getSessionSummary } from '../api';
import SettingsScreen from './SettingsScreen';

export default function SummaryScreen() {
  const {
    sessionId,
    originalScore,
    trapsIdentified,
    examDate,
    calculateScores,
    resetSession,
    updateStreak,
    streak,
    setPhase
  } = useSession();

  const [coachMessage, setCoachMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);


  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const scores = calculateScores();

        // Call backend to get coach message
        const summaryData = await getSessionSummary({
          session_id: sessionId,
          original_score: scores.original,
          final_mastery: scores.final,
          traps_identified: trapsIdentified,
          exam_date: examDate
        });

        setCoachMessage(summaryData.coach_message);

        // Update streak
        updateStreak();
      } catch (err) {
        console.error('Failed to get summary:', err);
        // Fallback message
        setCoachMessage({
          headline: 'Session Complete',
          body: 'Good work. Come back tomorrow.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--accent-secondary)] mx-auto mb-4"></div>
          <p className="text-xl text-[var(--text-secondary)]">Generating Summary...</p>
        </div>
      </div>
    );
  }

  const scores = calculateScores();
  const [originalCorrect, originalTotal] = scores.original.split('/').map(Number);
  const [finalCorrect, finalTotal] = scores.final.split('/').map(Number);
  const improvement = finalCorrect - originalCorrect;

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <Trophy className="w-20 h-20 text-[var(--accent-secondary)] mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">{coachMessage?.headline}</h1>
          <p className="text-lg text-[var(--text-secondary)]">{coachMessage?.body}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Original Score */}
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold mb-2">{scores.original}</div>
            <div className="text-sm text-[var(--text-secondary)]">Original Score</div>
          </div>

          {/* Final Mastery */}
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg text-center border-2 border-[var(--accent-green)]">
            <div className="text-3xl font-bold mb-2 text-[var(--accent-green)]">
              {scores.final}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Final Mastery</div>
            {improvement > 0 && (
              <div className="flex items-center justify-center gap-1 mt-2 text-[var(--accent-green)]">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold">+{improvement} fixed</span>
              </div>
            )}
          </div>

          {/* Streak */}
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold mb-2">{streak}</div>
            <div className="text-sm text-[var(--text-secondary)]">Day Streak</div>
          </div>
        </div>

        {/* Traps Identified */}
        {trapsIdentified.length > 0 && (
          <div className="bg-[var(--accent-secondary)]/10 border-2 border-[var(--accent-secondary)] p-6 rounded-lg mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[var(--accent-secondary)] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">TRAPS YOU FELL FOR</h3>
                <div className="flex flex-wrap gap-2">
                  {trapsIdentified.map((trap, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[var(--bg-secondary)] rounded-full text-sm font-semibold"
                    >
                      {trap}
                    </span>
                  ))}
                </div>
                <p className="text-sm mt-3 text-[var(--text-secondary)]">
                  Classic GRE traps. You identified and fixed them. That's progress.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={resetSession}
            className="w-full py-5 bg-[var(--accent-green)] text-white font-bold text-lg rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-6 h-6" />
            DONE FOR TODAY
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="w-full py-3 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold rounded-lg hover:bg-[var(--bg-secondary)] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-[var(--text-secondary)]">
          Exam Date: {examDate} · Consistency beats intensity.
        </p>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
    </div>
  );
}
