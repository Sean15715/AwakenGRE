/**
 * SetupScreen - Initial screen for difficulty selection and exam date input
 */

import { useState, useEffect } from 'react';
import { Calendar, Zap, Settings } from 'lucide-react';
import { useSession, PHASES } from '../SessionContext';
import { generateSession } from '../api';
import SettingsScreen from './SettingsScreen';

export default function SetupScreen() {
  const {
    setPhase,
    setSessionId,
    setPassage,
    setQuestions,
    setDifficulty,
    setExamDate,
    streak,
    hasConfigured,
    savedDifficulty,
    savedExamDate,
    saveConfiguration
  } = useSession();
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [examDateInput, setExamDateInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-generate session if user has already configured
  useEffect(() => {
    if (hasConfigured && savedDifficulty && savedExamDate) {
      startSession(savedDifficulty, savedExamDate);
    }
  }, [hasConfigured]);

  const startSession = async (difficulty, examDate) => {
    // Internal function that takes specific params
    const finalDifficulty = difficulty || selectedDifficulty;
    const finalExamDate = examDate || examDateInput;

    if (!examDate) {
      setError('Please enter your exam date');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPhase(PHASES.GENERATING);

      // Call backend to generate session
      const data = await generateSession({
        difficulty,
        exam_date: examDate
      });

      // Update context
      setSessionId(data.session_id);
      setPassage(data.passage);
      setQuestions(data.questions);
      setDifficulty(difficulty);
      setExamDate(examDate);

      // Save configuration for future sessions
      if (!hasConfigured) {
        saveConfiguration(difficulty, examDate);
      }

      // Move to exam phase
      setPhase(PHASES.EXAM);
    } catch (err) {
      setError(err.message);
      setPhase(PHASES.SETUP);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    // Wrapper for button onClick to avoid event object issues
    startSession(selectedDifficulty, examDateInput);
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

      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">GRE Drill Sergeant</h1>
          <p className="text-xl text-[var(--text-secondary)]">
            High-intensity Reading Comprehension training
          </p>
          {streak > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] rounded-lg">
              <Zap className="w-5 h-5 text-[var(--accent-yellow)]" />
              <span className="text-lg font-semibold">{streak} day streak</span>
            </div>
          )}
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-3 text-[var(--text-secondary)]">
            DIFFICULTY
          </label>
          <div className="grid grid-cols-3 gap-4">
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(level)}
                className={`
                  py-4 px-6 rounded-lg font-semibold transition-all
                  ${selectedDifficulty === level
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Date Input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-3 text-[var(--text-secondary)]">
            EXAM DATE
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
            <input
              type="date"
              value={examDateInput}
              onChange={(e) => setExamDateInput(e.target.value)}
              className="w-full py-4 pl-12 pr-4 bg-[var(--bg-secondary)] border-2 border-transparent rounded-lg text-white focus:border-[var(--accent-primary)] outline-none transition-all"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border-2 border-[var(--accent-red)] rounded-lg text-[var(--accent-red)]">
            {error}
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-5 bg-[var(--accent-primary)] text-white font-bold text-lg rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          START SESSION
        </button>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-[var(--text-secondary)]">
          Consistency beats intensity. Show up every day.
        </p>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
    </div>
  );
}
