/**
 * SettingsScreen - Manage app settings and preferences
 */

import { useState } from 'react';
import { X, Calendar, Save, LogOut } from 'lucide-react';
import { useSession } from '../SessionContext';

export default function SettingsScreen({ onClose }) {
  const { user, updateUserProfile, savedExamDate, logout } = useSession();
  const [examDate, setExamDate] = useState(savedExamDate || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const handleSaveDate = async () => {
    if (!user) return; // Should allow guest to save locally? Currently context handles local save via saveConfiguration.
                       // But here we are specifically targeting user profile update.
    
    setIsSaving(true);
    setSaveMessage(null);
    try {
        await updateUserProfile({ exam_date: examDate });
        setSaveMessage('Date saved!');
        setTimeout(() => setSaveMessage(null), 2000);
    } catch (e) {
        setSaveMessage('Failed to save.');
    } finally {
        setIsSaving(false);
    }
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

        {/* Exam Date Section (Only if logged in for now, to sync with backend) */}
        {user && (
        <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg mb-4">
            <div className="flex items-start gap-3 mb-4">
                <Calendar className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-semibold mb-1">Exam Date</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                        Update your target exam date.
                    </p>
                    <div className="flex gap-2">
                        <input 
                            type="date" 
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] rounded border border-gray-700 text-white focus:outline-none focus:border-[var(--accent-primary)]"
                        />
                        <button 
                            onClick={handleSaveDate}
                            disabled={isSaving}
                            className="px-3 py-2 bg-[var(--accent-primary)] rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? '...' : <Save className="w-4 h-4" />}
                        </button>
                    </div>
                    {saveMessage && (
                        <p className={`text-xs mt-2 ${saveMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                            {saveMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
        )}

        {/* Logout Section (Only if logged in) */}
        {user && (
          <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg mb-4">
            <div className="flex items-start gap-3 mb-4">
              <LogOut className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Logout</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  Sign out of your account. You can log back in anytime.
                </p>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full py-3 bg-[var(--bg-secondary)] text-white font-semibold rounded-lg hover:bg-red-500 transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-[var(--text-secondary)] text-center">
          Your data is stored locally in your browser. No account needed.
        </p>
      </div>
    </div>
  );
}
