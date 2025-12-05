/**
 * SettingsScreen - Reset all data and start fresh
 */

import { useState } from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { useSession, PHASES } from '../SessionContext';

export default function SettingsScreen({ onClose }) {
  const { resetSession } = useSession();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    // Clear ALL localStorage data
    localStorage.clear();

    // Reset session state
    resetSession();

    // Refresh page to reload everything
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--bg-secondary)] rounded-lg max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Manage your app data and preferences
        </p>

        {/* Reset Section */}
        <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg mb-4">
          <div className="flex items-start gap-3 mb-4">
            <RotateCcw className="w-5 h-5 text-[var(--accent-yellow)] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Reset All Data</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                This will clear your streak, difficulty preference, exam date, and return you to a clean slate.
              </p>
            </div>
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-3 bg-[var(--accent-red)] text-white font-semibold rounded-lg hover:bg-red-600 transition-all"
            >
              Reset Everything
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-[var(--accent-red)] rounded-lg">
                <AlertTriangle className="w-5 h-5 text-[var(--accent-red)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--accent-red)]">
                  Are you sure? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-[var(--bg-secondary)] text-white font-semibold rounded-lg hover:bg-[var(--bg-tertiary)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-[var(--accent-red)] text-white font-semibold rounded-lg hover:bg-red-600 transition-all"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-[var(--text-secondary)] text-center">
          Your data is stored locally in your browser. No account needed.
        </p>
      </div>
    </div>
  );
}
