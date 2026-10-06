import React, { useState } from 'react';
import { useProgress } from './hooks/useProgress';
import { ViewMode } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FloatingXP } from './components/FloatingXP';
import { HomeView } from './components/HomeView';
import { LessonIntro } from './components/LessonIntro';
import { MultipleChoiceGame } from './components/MultipleChoiceGame';
import { SoundToCharGame } from './components/SoundToCharGame';
import { MatchingGame } from './components/MatchingGame';
import { SpeedRoundGame } from './components/SpeedRoundGame';
import { BossGame } from './components/BossGame';
import { FinalChallengeGame } from './components/FinalChallengeGame';
import { WeakReviewGame } from './components/WeakReviewGame';
import { KanaChartView } from './components/KanaChartView';
import { ArcadeView } from './components/ArcadeView';
import { MemoryChallengeGame } from './components/MemoryChallengeGame';
import { CognitiveSessionGame } from './components/CognitiveSessionGame';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { AdaptiveSessionPlan } from './engine';
import { HiraganaCharacter } from './types';

export default function App() {
  const {
    progress,
    floatingXp,
    setFloatingXp,
    addXp,
    recordAnswer,
    recordMemoryAnswer,
    recordCognitiveAnswer,
    markNewCharsLearned,
    incrementMiniGames,
    recordBossBeaten,
    recordFinalChallengeComplete,
    setCurrentDay,
    toggleSoundEffects,
    toggleSpeechAudio,
    handleReset,
    unlockedCharacters,
    currentDayCharacters,
    masteredCount,
    weakCharacters,
    practiceRecommendation,
    generateSession
  } = useProgress();

  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeSessionPlan, setActiveSessionPlan] = useState<AdaptiveSessionPlan | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleStartAdaptiveSession = (options?: { forcedChar?: HiraganaCharacter }) => {
    const session = generateSession({ totalQuestions: 8, forcedChar: options?.forcedChar });
    setActiveSessionPlan(session);
    setCurrentView('cognitive-session');
  };

  // Quick navigation handlers
  const handleStartQuest = (day: number) => {
    setCurrentDay(day);
    setCurrentView('lesson-intro');
  };

  const handleCompleteIntro = () => {
    markNewCharsLearned(progress.currentDay);
    addXp(20);
    // Move smoothly to first mini game
    setCurrentView('mini-game-mc');
  };

  const handleMiniGameComplete = () => {
    incrementMiniGames(progress.currentDay);
  };

  const isFullscreenGame = [
    'lesson-intro',
    'mini-game-mc',
    'mini-game-sound',
    'mini-game-matching',
    'mini-game-speed',
    'boss',
    'final-challenge',
    'memory-test',
    'cognitive-session'
  ].includes(currentView);

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F7F7F5] flex flex-col font-sans selection:bg-[#FF5C7A] selection:text-white">
      {/* Floating XP upward notifications */}
      <FloatingXP
        amount={floatingXp?.amount || null}
        onComplete={() => setFloatingXp(null)}
      />

      {/* Top Header */}
      <Header
        progress={progress}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onToggleSound={toggleSoundEffects}
        onHomeClick={() => setCurrentView('home')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-3 flex flex-col">
        {currentView === 'home' && (
          <HomeView
            progress={progress}
            onStartQuest={handleStartQuest}
            onNavigate={(view) => setCurrentView(view)}
            weakCount={weakCharacters.length}
            masteredCount={masteredCount}
            practiceRecommendation={practiceRecommendation}
            onStartAdaptiveSession={handleStartAdaptiveSession}
          />
        )}

        {currentView === 'lesson-intro' && (
          <LessonIntro
            characters={currentDayCharacters}
            allUnlocked={unlockedCharacters}
            day={progress.currentDay}
            soundEnabled={progress.settings.soundEffects}
            speechEnabled={progress.settings.speechAudio}
            masteryMap={progress.characters}
            onRecordAnswer={recordAnswer}
            onRecordMemoryAnswer={recordMemoryAnswer}
            onAddXp={addXp}
            onComplete={handleCompleteIntro}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'arcade' && (
          <ArcadeView
            onSelectGame={(view) => {
              if (view === 'cognitive-session') {
                handleStartAdaptiveSession();
              } else {
                setCurrentView(view);
              }
            }}
            soundEnabled={progress.settings.soundEffects}
            currentDay={progress.currentDay}
            unlockedDay={progress.unlockedDay}
            completedDays={progress.completedDays}
          />
        )}

        {currentView === 'cognitive-session' && activeSessionPlan && (
          <CognitiveSessionGame
            questions={activeSessionPlan.questions}
            unlockedPool={unlockedCharacters}
            masteryMap={progress.characters}
            soundEnabled={progress.settings.soundEffects}
            speechEnabled={progress.settings.speechAudio}
            onRecordCognitiveAnswer={recordCognitiveAnswer}
            onAddXp={addXp}
            onCompleteSession={() => {
              incrementMiniGames(progress.currentDay);
            }}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'memory-test' && (
          <MemoryChallengeGame
            charactersPool={unlockedCharacters}
            masteryMap={progress.characters}
            soundEnabled={progress.settings.soundEffects}
            speechEnabled={progress.settings.speechAudio}
            onRecordAnswer={recordAnswer}
            onRecordMemoryAnswer={recordMemoryAnswer}
            onAddXp={addXp}
            onCompleteGame={handleMiniGameComplete}
            onBack={() => setCurrentView('arcade')}
          />
        )}

        {currentView === 'mini-game-mc' && (
          <MultipleChoiceGame
            charactersPool={unlockedCharacters}
            masteryMap={progress.characters}
            soundEnabled={progress.settings.soundEffects}
            speechEnabled={progress.settings.speechAudio}
            onRecordAnswer={recordAnswer}
            onAddXp={addXp}
            onCompleteGame={handleMiniGameComplete}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'mini-game-sound' && (
          <SoundToCharGame
            charactersPool={unlockedCharacters}
            masteryMap={progress.characters}
            soundEnabled={progress.settings.soundEffects}
            speechEnabled={progress.settings.speechAudio}
            onRecordAnswer={recordAnswer}
            onAddXp={addXp}
            onCompleteGame={handleMiniGameComplete}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'mini-game-matching' && (
          <MatchingGame
            charactersPool={unlockedCharacters}
            soundEnabled={progress.settings.soundEffects}
            speechEnabled={progress.settings.speechAudio}
            onRecordAnswer={recordAnswer}
            onAddXp={addXp}
            onCompleteGame={handleMiniGameComplete}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'mini-game-speed' && (
          <SpeedRoundGame
            charactersPool={unlockedCharacters}
            masteryMap={progress.characters}
            soundEnabled={progress.settings.soundEffects}
            speechEnabled={progress.settings.speechAudio}
            onRecordAnswer={recordAnswer}
            onAddXp={addXp}
            onCompleteGame={handleMiniGameComplete}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'boss' && (
          <BossGame
            day={progress.currentDay}
            charactersPool={unlockedCharacters}
            masteryMap={progress.characters}
            soundEnabled={progress.settings.soundEffects}
            speechEnabled={progress.settings.speechAudio}
            onRecordAnswer={recordAnswer}
            onRecordMemoryAnswer={recordMemoryAnswer}
            onAddXp={addXp}
            onBossDefeated={recordBossBeaten}
            onBack={() => setCurrentView('home')}
            weakCharacters={weakCharacters}
          />
        )}

        {currentView === 'final-challenge' && (
          <FinalChallengeGame
            masteryMap={progress.characters}
            soundEnabled={progress.settings.soundEffects}
            speechEnabled={progress.settings.speechAudio}
            totalXp={progress.totalXp}
            onRecordAnswer={recordAnswer}
            onAddXp={addXp}
            onChallengeComplete={recordFinalChallengeComplete}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'review-weak' && (
          <WeakReviewGame
            weakList={weakCharacters}
            allUnlocked={unlockedCharacters}
            masteryMap={progress.characters}
            soundEnabled={progress.settings.soundEffects}
            speechEnabled={progress.settings.speechAudio}
            onRecordAnswer={recordAnswer}
            onRecordMemoryAnswer={recordMemoryAnswer}
            onRecordCognitiveAnswer={recordCognitiveAnswer}
            onAddXp={addXp}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'kana-chart' && (
          <KanaChartView
            unlockedDay={progress.unlockedDay}
            masteryMap={progress.characters}
            soundEnabled={progress.settings.soundEffects}
            speechEnabled={progress.settings.speechAudio}
            onBack={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Bottom Navigation (visible unless in focused quiz session) */}
      {!isFullscreenGame && (
        <BottomNav
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          weakCount={weakCharacters.length}
        />
      )}

      {/* Settings & Reset Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        progress={progress}
        onToggleSound={toggleSoundEffects}
        onToggleSpeech={toggleSpeechAudio}
        onResetProgress={handleReset}
      />

      {/* Profile & Achievements Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        progress={progress}
      />
    </div>
  );
}
