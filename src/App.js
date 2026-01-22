import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { VocabularyProvider } from './contexts/VocabularyContext';
import { MainLayout } from './layouts/MainLayout';
import Dashboard from './components/views/Dashboard';
import QuizArena from './components/views/QuizArena';
import TheLedger from './components/views/TheLedger';
import ErrorBoundary from './components/ui/ErrorBoundary';

export default function App() {
  const [currentView, setCurrentView] = useState('menu');
  const [quizMode, setQuizMode] = useState(null);
  const [sessionKey, setSessionKey] = useState(0);

  // Memoize handlers to prevent prop drilling changes
  const handleStartQuiz = React.useCallback((mode) => {
    setQuizMode(mode);
    setCurrentView('test');
    setSessionKey(prev => prev + 1);
  }, []);

  const handleReturnToMenu = React.useCallback(() => {
    setCurrentView('menu');
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'menu':
        return <Dashboard onStartQuiz={handleStartQuiz} />;
      case 'test':
        return (
          <QuizArena
            key={sessionKey}
            quizMode={quizMode}
            onExit={handleReturnToMenu}
            onRestart={handleStartQuiz}
          />
        );
      case 'vault':
        return <TheLedger />;
      default:
        return <Dashboard onStartQuiz={handleStartQuiz} />;
    }
  };

  return (
    <ErrorBoundary>
      <VocabularyProvider>
        <MainLayout currentView={currentView} onViewChange={setCurrentView}>
          {renderView()}
        </MainLayout>
      </VocabularyProvider>
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  );
}
