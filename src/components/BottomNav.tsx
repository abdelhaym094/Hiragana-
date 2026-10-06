import React from 'react';
import { Compass, BookOpen, Gamepad2, Brain, Grid3X3 } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomNavProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  weakCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  weakCount
}) => {
  const tabs = [
    {
      id: 'home' as ViewMode,
      label: 'Quest',
      icon: Compass
    },
    {
      id: 'lesson-intro' as ViewMode,
      label: 'Learn',
      icon: BookOpen
    },
    {
      id: 'arcade' as ViewMode,
      label: 'Arcade',
      icon: Gamepad2
    },
    {
      id: 'review-weak' as ViewMode,
      label: 'Train',
      icon: Brain,
      badge: weakCount > 0 ? weakCount : undefined
    },
    {
      id: 'kana-chart' as ViewMode,
      label: 'Collection',
      icon: Grid3X3
    }
  ];

  const getIsActive = (tabId: ViewMode) => {
    if (tabId === 'home') return currentView === 'home';
    if (tabId === 'lesson-intro') return currentView === 'lesson-intro';
    if (tabId === 'arcade') {
      return [
        'arcade',
        'mini-game-mc',
        'mini-game-sound',
        'mini-game-matching',
        'mini-game-speed',
        'boss',
        'final-challenge',
        'memory-test'
      ].includes(currentView);
    }
    if (tabId === 'review-weak') return currentView === 'review-weak';
    if (tabId === 'kana-chart') return currentView === 'kana-chart';
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#080A0D]/95 backdrop-blur-md border-t border-[#282F38] px-2 py-1.5 max-w-xl mx-auto shadow-2xl">
      <div className="grid grid-cols-5 items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = getIsActive(tab.id);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer relative min-h-[50px] ${
                isActive
                  ? 'text-[#FF5C7A]'
                  : 'text-[#8B949E] hover:text-[#F5F7FA] hover:bg-[#11151A]/50'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-150 ${
                    isActive ? 'scale-115 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#FF5C7A] text-[9px] font-extrabold text-white flex items-center justify-center tabular-nums shadow-md shadow-[#FF5C7A]/30">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-tight mt-1 whitespace-nowrap ${
                  isActive ? 'text-[#FF5C7A] font-bold' : 'text-[#8B949E]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C7A] mt-0.5 shadow-sm shadow-[#FF5C7A]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
