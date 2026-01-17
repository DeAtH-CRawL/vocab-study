import React, { useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, Layers } from 'lucide-react';
import { useVocabulary } from '../../contexts/VocabularyContext';
import { useQuiz } from '../../hooks/useQuiz';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import canvasConfetti from 'canvas-confetti';
import { QuizHeader } from './QuizHeader';
import { QuestionCard } from './QuestionCard';

export default function QuizArena({ quizMode, onExit, onRestart }) {
    const { vocabulary, allWords, getStarredWords } = useVocabulary();

    // Fixed quiz length for "Random Test" mode
    const RANDOM_TEST_LENGTH = 30;

    // Memoize getWordList to avoid recreation on every render
    const getWordList = useCallback(() => {
        if (!quizMode) return [];
        if (Array.isArray(quizMode)) return quizMode.filter(Boolean);
        if (quizMode === 'all') return Array.isArray(allWords) ? allWords : [];
        if (quizMode === 'random30') {
            if (!Array.isArray(allWords) || allWords.length === 0) return [];
            const shuffled = [...allWords].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, Math.min(RANDOM_TEST_LENGTH, shuffled.length));
        }
        if (quizMode === 'starred') {
            const starred = getStarredWords();
            return Array.isArray(starred) ? starred : [];
        }
        const dayWords = vocabulary?.[quizMode];
        return Array.isArray(dayWords) ? dayWords : [];
    }, [quizMode, allWords, vocabulary, getStarredWords]);

    const {
        quizList,
        currentIndex,
        currentWord,
        userInput,
        setUserInput,
        feedback,
        results,
        streak,
        isFinished,
        startQuiz,
        submitAnswer,
        revealAnswer,
        nextQuestion,
        provideHint
    } = useQuiz();

    // Initialize quiz on mount
    useEffect(() => {
        const list = getWordList();
        if (list && Array.isArray(list) && list.length > 0) {
            startQuiz(list);
        } else {
            console.warn('QuizArena: No valid words to start quiz');
        }
    }, [getWordList, startQuiz]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isFinished) return;

            // Allow Enter to advance
            if (e.key === 'Enter' && feedback) {
                e.preventDefault();
                nextQuestion();
                return;
            }

            // Skip other shortcuts if user is typing
            if (e.target.tagName === 'INPUT') return;

            if (e.key.toLowerCase() === 'h') {
                e.preventDefault();
                provideHint();
            }
            if (e.key.toLowerCase() === 'r') {
                e.preventDefault();
                revealAnswer();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFinished, feedback, nextQuestion, provideHint, revealAnswer]);

    // Helper for normalization
    const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || '';

    // Submit handler
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (e.target.disabled) return;

        if (feedback) {
            nextQuestion();
        } else {
            submitAnswer();
            // Check success for confetti immediately after submit logic would update state (conceptually)
            // Note: Since state doesn't update immediately, we check against current values manually for the effect
            // However, submitAnswer updates state. We might need to trigger confetti in useEffect or derived logic.
            // For now, let's keep the impure check for immediate gratification, but safer.
            if (normalize(userInput) === normalize(currentWord.term)) {
                triggerConfetti();
            }
        }
    }, [feedback, nextQuestion, submitAnswer, userInput, currentWord]);

    const triggerConfetti = () => {
        canvasConfetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#7c3aed', '#ec4899']
        });
    };

    if (!quizList.length) return <div className="p-10 text-center text-slate-400">Loading Arena...</div>;

    if (isFinished) {
        const correctCount = results.filter(r => r.correct).length;
        const wrongItems = results.filter(r => !r.correct).map(r => r.item);

        return (
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
                <Card className="p-12 border-gemini-cyan/20 bg-gradient-to-b from-gemini-surface/80 to-slate-900/90 backdrop-blur-xl shadow-glow-lg">
                    <Badge variant="success" className="mb-6 scale-125 shadow-glow-lg">Mission Complete</Badge>
                    <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-2">{Math.round((correctCount / results.length) * 100)}%</h2>
                    <p className="text-slate-400 mb-8 font-medium tracking-wide">ACCURACY RATING</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            <div className="text-3xl font-bold text-emerald-400 mb-1">{correctCount}</div>
                            <div className="text-[10px] uppercase text-emerald-500 font-black tracking-widest">Correct</div>
                        </div>
                        <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                            <div className="text-3xl font-bold text-rose-400 mb-1">{results.length - correctCount}</div>
                            <div className="text-[10px] uppercase text-rose-500 font-black tracking-widest">Mistakes</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button variant="primary" className="w-full shadow-glow font-bold tracking-wider" onClick={() => onRestart(quizMode)}>
                            <RotateCcw className="mr-2" size={18} /> RESTART SESSION
                        </Button>

                        {wrongItems.length > 0 && (
                            <Button variant="gradient" className="w-full font-bold tracking-wider" onClick={() => onRestart(wrongItems)}>
                                <Layers className="mr-2" size={18} /> RETRY ERRORS ({wrongItems.length})
                            </Button>
                        )}

                        <Button variant="ghost" className="w-full hover:bg-white/5" onClick={onExit}>RETURN TO BASE</Button>
                    </div>
                </Card>
            </div>
        );
    }

    const progress = ((currentIndex) / quizList.length) * 100;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <QuizHeader
                onExit={onExit}
                streak={streak}
                currentIndex={currentIndex}
                totalLetters={quizList.length}
                progress={progress}
            />

            <QuestionCard
                currentWord={currentWord}
                userInput={userInput}
                setUserInput={setUserInput}
                feedback={feedback}
                onSubmit={handleSubmit}
                provideHint={provideHint}
                revealAnswer={revealAnswer}
                isFinished={isFinished}
            />
        </div>
    );
}
