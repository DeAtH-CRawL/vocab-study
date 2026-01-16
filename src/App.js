import React, { useState } from 'react';
import { VocabularyProvider } from './contexts/VocabularyContext';
import { MainLayout } from './layouts/MainLayout';
import Dashboard from './components/views/Dashboard';
import QuizArena from './components/views/QuizArena';
import TheLedger from './components/views/TheLedger';
import ErrorBoundary from './components/ui/ErrorBoundary';

export default function App() {
  const [currentView, setCurrentView] = useState('menu');
  const [quizMode, setQuizMode] = useState(null);

  const handleStartQuiz = (mode) => {
    setQuizMode(mode);
    setCurrentView('test');
  };

  const renderView = () => {
    switch (currentView) {
      case 'menu':
        return <Dashboard onStartQuiz={handleStartQuiz} />;
      case 'test':
        return (
          <QuizArena
            quizMode={quizMode}
            onExit={() => setCurrentView('menu')}
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
    </ErrorBoundary>
  );
}
