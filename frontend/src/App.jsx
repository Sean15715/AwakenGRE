/**
 * App - Main component that routes between phases
 */

import { SessionProvider, useSession, PHASES } from './SessionContext';
import HomeScreen from './screens/HomeScreen';
import SetupScreen from './screens/SetupScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ExamScreen from './screens/ExamScreen';
import RedemptionScreen from './screens/RedemptionScreen';
import SummaryScreen from './screens/SummaryScreen';

function AppContent() {
  const { phase } = useSession();

  switch (phase) {
    case PHASES.REGISTER:
      return <RegisterScreen />;
    case PHASES.LOGIN:
      return <LoginScreen />;
    case PHASES.HOME:
      return <HomeScreen />;
    case PHASES.SETUP:
    case PHASES.GENERATING:
      return <SetupScreen />;
    case PHASES.EXAM:
    case PHASES.ANALYZING:
      return <ExamScreen />;
    case PHASES.REDEMPTION:
      return <RedemptionScreen />;
    case PHASES.SUMMARY:
      return <SummaryScreen />;
    default:
      return <SetupScreen />;
  }
}

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

export default App;
