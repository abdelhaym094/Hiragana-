import React, { useState } from 'react';
import { X, Volume2, VolumeX, RotateCcw, AlertTriangle, Check, Shield } from 'lucide-react';
import { UserProgress } from '../types';
import { sfx } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onToggleSound: () => void;
  onToggleSpeech: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  progress,
  onToggleSound,
  onToggleSpeech,
  onResetProgress
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handlePerformReset = () => {
    sfx.wrong(progress.settings.soundEffects);
    onResetProgress();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-[#14171C] border border-[#1B2027] p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1B2027]">
          <h3 className="text-base font-bold text-[#F7F7F5]">
            Settings & Preferences
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#0B0D10] text-[#9AA1AA] hover:text-[#F7F7F5] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B0D10]/50 border border-[#1B2027]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1B2027] flex items-center justify-center text-[#FFD166]">
                {progress.settings.soundEffects ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </div>
              <div>
                <span className="text-xs font-semibold text-[#F7F7F5] block">
                  Game Sound Effects
                </span>
                <span className="text-[11px] text-[#9AA1AA]">
                  Chimes, timers & clicks
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                progress.settings.soundEffects ? 'bg-[#FF5C7A]' : 'bg-[#1B2027]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  progress.settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Pronunciation Voice Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B0D10]/50 border border-[#1B2027]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1B2027] flex items-center justify-center text-[#42E6A4]">
                <Volume2 size={18} />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#F7F7F5] block">
                  Japanese Pronunciation
                </span>
                <span className="text-[11px] text-[#9AA1AA]">
                  ja-JP speech synthesis
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleSpeech}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                progress.settings.speechAudio ? 'bg-[#42E6A4]' : 'bg-[#1B2027]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  progress.settings.speechAudio ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Quick Learning Stats */}
          <div className="p-3 rounded-2xl bg-[#0B0D10]/30 border border-[#1B2027] text-xs text-[#9AA1AA] space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>Best Streak:</span>
              <span className="text-[#FFD166] font-bold">{progress.bestStreak} Days</span>
            </div>
            <div className="flex justify-between">
              <span>Current Streak:</span>
              <span className="text-[#F7F7F5] font-bold">{progress.streak} Days</span>
            </div>
            <div className="flex justify-between">
              <span>Total XP:</span>
              <span className="text-[#F7F7F5] font-bold">{progress.totalXp} XP</span>
            </div>
          </div>

          {/* Reset Progress Danger Zone */}
          <div className="pt-2">
            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-3 rounded-2xl bg-[#FF5C7A]/10 hover:bg-[#FF5C7A]/20 border border-[#FF5C7A]/30 text-xs font-bold text-[#FF5C7A] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw size={14} />
                <span>Reset All Progress</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#FF5C7A]/15 border border-[#FF5C7A] text-center space-y-2.5">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#FF5C7A]">
                  <AlertTriangle size={15} />
                  <span>Are you sure?</span>
                </div>
                <p className="text-[11px] text-[#F7F7F5]">
                  This will reset all streaks, XP, and character masteries back to Day 1.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-2 rounded-xl bg-[#14171C] border border-[#1B2027] text-xs font-semibold text-[#9AA1AA] hover:text-[#F7F7F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePerformReset}
                    className="flex-1 py-2 rounded-xl bg-[#FF5C7A] text-xs font-extrabold text-[#0B0D10] cursor-pointer hover:bg-[#ff4366]"
                  >
                    Yes, Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
