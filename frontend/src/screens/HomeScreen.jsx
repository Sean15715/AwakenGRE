/**
 * HomeScreen - Welcome back screen
 */

import { useState } from 'react';
import { Zap, Settings, Play, Calendar } from 'lucide-react';
import { useSession, PHASES } from '../SessionContext';
import { generateSession } from '../api';
import SettingsScreen from './SettingsScreen';

export default function HomeScreen() {
  const {
    setPhase,
    setSessionId,
    setPassage,
    setQuestions,
    setDifficulty,
    setExamDate,
    streak,
    savedDifficulty,
    savedExamDate
  } = useSession();

  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Calculate days remaining
  const getDaysLeft = () => {
    if (!savedExamDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(savedExamDate);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysLeft();

  const handleStartDrill = async () => {
    try {
      setLoading(true);
      setPhase(PHASES.GENERATING);

      // Call backend to generate session with saved config
      const data = await generateSession({
        difficulty: savedDifficulty,
        exam_date: savedExamDate
      });

      // Update context
      setSessionId(data.session_id);
      setPassage(data.passage);
      setQuestions(data.questions);
      setDifficulty(savedDifficulty);
      setExamDate(savedExamDate);

      // Move to exam phase
      setPhase(PHASES.EXAM);
    } catch (err) {
      alert(`Error: ${err.message}`);
      setPhase(PHASES.HOME);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
          <p className="text-xl text-[var(--text-secondary)]">Generating Custom Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Settings Button (Top Right) */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 p-3 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-all"
      >
        <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
      </button>

      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <h1 className="text-5xl font-bold mb-4">GRE Drill Sergeant</h1>
        <p className="text-xl text-[var(--text-secondary)] mb-8">
          Ready for another drill?
        </p>

        {/* Streak Display */}
        {streak > 0 && (
          <div className="mb-12 inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-secondary)] rounded-lg">
            <Zap className="w-6 h-6 text-[var(--accent-yellow)]" />
            <span className="text-2xl font-bold">{streak} day streak</span>
          </div>
        )}

        {/* Current Config Display */}
        <div className="mb-12 p-6 bg-[var(--bg-secondary)] rounded-lg">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">YOUR SETTINGS</h3>
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Countdown</p>
              <div className="flex items-center gap-2">
                <Calendar className={`w-5 h-5 ${daysLeft <= 30 ? 'text-orange-500' : 'text-[var(--text-secondary)]'}`} />
                <p className={`text-lg font-bold ${daysLeft <= 30 ? 'text-orange-500' : ''}`}>
                   {daysLeft !== null ? `${daysLeft} Days Left` : 'Set Date'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartDrill}
          disabled={loading}
          className="w-full py-6 bg-[var(--accent-primary)] text-white font-bold text-xl rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <Play className="w-7 h-7" />
          START DRILL
        </button>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-[var(--text-secondary)]">
          Consistency beats intensity. One drill at a time.
        </p>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
    </div>
  );
}
