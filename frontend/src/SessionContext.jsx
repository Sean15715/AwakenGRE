/**
 * SessionContext - Global state management for GRE Drill Sergeant
 * Manages the flow: SETUP → EXAM → ANALYZING → REDEMPTION → SUMMARY
 */

import { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const PHASES = {
  HOME: 'HOME',
  SETUP: 'SETUP',
  GENERATING: 'GENERATING',
  EXAM: 'EXAM',
  ANALYZING: 'ANALYZING',
  REDEMPTION: 'REDEMPTION',
  SUMMARY: 'SUMMARY'
};

export function SessionProvider({ children }) {
  // Phase management
  const [phase, setPhase] = useState(PHASES.SETUP);

  // Session data
  const [sessionId, setSessionId] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [examDate, setExamDate] = useState(null);
  const [passage, setPassage] = useState(null);
  const [questions, setQuestions] = useState([]);

  // User answers
  const [examAnswers, setExamAnswers] = useState({}); // { questionId: selectedOption }
  const [redemptionAnswers, setRedemptionAnswers] = useState({}); // { questionId: selectedOption }

  // Mistake tracking
  const [mistakes, setMistakes] = useState([]); // Array of mistake diagnoses from backend
  const [currentMistakeIndex, setCurrentMistakeIndex] = useState(0);

  // Summary data
  const [originalScore, setOriginalScore] = useState(null);
  const [finalMastery, setFinalMastery] = useState(null);
  const [trapsIdentified, setTrapsIdentified] = useState([]);

  // Streak tracking (localStorage)
  const [streak, setStreak] = useState(0);
  const [lastSessionDate, setLastSessionDate] = useState(null);

  // User preferences (persisted)
  const [hasConfigured, setHasConfigured] = useState(false);
  const [savedDifficulty, setSavedDifficulty] = useState(null);
  const [savedExamDate, setSavedExamDate] = useState(null);

  // Load streak and preferences from localStorage on mount
  useEffect(() => {
    const savedStreak = parseInt(localStorage.getItem('gre_streak') || '0', 10);
    const savedDate = localStorage.getItem('gre_last_session_date');
    const configured = localStorage.getItem('gre_configured') === 'true';
    const difficulty = localStorage.getItem('gre_difficulty');
    const examDate = localStorage.getItem('gre_exam_date');

    setStreak(savedStreak);
    setLastSessionDate(savedDate);
    setHasConfigured(configured);
    setSavedDifficulty(difficulty);
    setSavedExamDate(examDate);
  }, []);

  // Save streak to localStorage
  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = streak;

    if (lastSessionDate === today) {
      // Same day, no change
      return;
    } else if (lastSessionDate === yesterday) {
      // Consecutive day
      newStreak = streak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }

    setStreak(newStreak);
    setLastSessionDate(today);
    localStorage.setItem('gre_streak', newStreak.toString());
    localStorage.setItem('gre_last_session_date', today);
  };

  // Helper: Calculate scores
  const calculateScores = () => {
    const totalQuestions = questions.length;
    const correctInExam = questions.filter(
      (q) => examAnswers[q.id] === q.correct_option
    ).length;

    // Calculate final mastery (includes redemption fixes)
    let finalCorrect = correctInExam;
    mistakes.forEach((mistake, index) => {
      const redemptionAnswer = redemptionAnswers[mistake.question_id];
      const correctAnswer = questions.find((q) => q.id === mistake.question_id)?.correct_option;
      if (redemptionAnswer === correctAnswer) {
        finalCorrect++;
      }
    });

    return {
      original: `${correctInExam}/${totalQuestions}`,
      final: `${finalCorrect}/${totalQuestions}`
    };
  };

  // Save user configuration
  const saveConfiguration = (difficulty, examDate) => {
    localStorage.setItem('gre_configured', 'true');
    localStorage.setItem('gre_difficulty', difficulty);
    localStorage.setItem('gre_exam_date', examDate);
    setHasConfigured(true);
    setSavedDifficulty(difficulty);
    setSavedExamDate(examDate);
  };

  // Reset session (for new session) - keeps user config
  const resetSession = () => {
    // Go to HOME if configured, otherwise SETUP
    setPhase(hasConfigured ? PHASES.HOME : PHASES.SETUP);
    setSessionId(null);
    setPassage(null);
    setQuestions([]);
    setExamAnswers({});
    setRedemptionAnswers({});
    setMistakes([]);
    setCurrentMistakeIndex(0);
    setOriginalScore(null);
    setFinalMastery(null);
    setTrapsIdentified([]);

    // Preserve difficulty and exam date for home screen display
    if (hasConfigured && savedDifficulty && savedExamDate) {
      setDifficulty(savedDifficulty);
      setExamDate(savedExamDate);
    }
  };

  const value = {
    // Phase
    phase,
    setPhase,

    // Session data
    sessionId,
    setSessionId,
    difficulty,
    setDifficulty,
    examDate,
    setExamDate,
    passage,
    setPassage,
    questions,
    setQuestions,

    // Answers
    examAnswers,
    setExamAnswers,
    redemptionAnswers,
    setRedemptionAnswers,

    // Mistakes
    mistakes,
    setMistakes,
    currentMistakeIndex,
    setCurrentMistakeIndex,

    // Summary
    originalScore,
    setOriginalScore,
    finalMastery,
    setFinalMastery,
    trapsIdentified,
    setTrapsIdentified,

    // Streak
    streak,
    updateStreak,

    // User preferences
    hasConfigured,
    savedDifficulty,
    savedExamDate,
    saveConfiguration,

    // Helpers
    calculateScores,
    resetSession
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
