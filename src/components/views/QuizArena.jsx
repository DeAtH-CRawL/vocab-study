import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, Lightbulb, Eye, RotateCcw, Layers } from 'lucide-react';
import { useVocabulary } from '../../contexts/VocabularyContext';
import { useQuiz } from '../../hooks/useQuiz';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import canvasConfetti from 'canvas-confetti';

export default function QuizArena({ quizMode, onExit, onRestart }) {
    const { vocabulary, allWords, getStarredWords, toggleStar, isStarred } = useVocabulary();

    // Decide which list to use
    const getWordList = () => {
        if (Array.isArray(quizMode)) return quizMode; // Custom list (retry)
        if (quizMode === 'all') return allWords;
        if (quizMode === 'starred') return getStarredWords();
        return vocabulary[quizMode] || [];
    };

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
        if (list.length > 0) startQuiz(list);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isFinished) return;
            if (e.target.tagName === 'INPUT') return; // Don't trigger if typing

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
    }, [isFinished, provideHint, revealAnswer]);

    // Submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        if (feedback) {
            nextQuestion();
        } else {
            submitAnswer();
            if (!feedback && normalize(userInput) === normalize(currentWord.term)) {
                triggerConfetti();
            }
        }
    };

    const triggerConfetti = () => {
        canvasConfetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#7c3aed', '#ec4899']
        });
    };

    // Helper for normalization to check confetti condition
    const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || '';


    if (!quizList.length) return <div className="p-10 text-center text-slate-400">Loading Arena...</div>;

    if (isFinished) {
        const correctCount = results.filter(r => r.correct).length;
        const wrongItems = results.filter(r => !r.correct).map(r => r.item);

        return (
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
                <Card className="p-12 border-gemini-cyan/20 bg-gradient-to-b from-gemini-surface to-slate-900">
                    <Badge variant="success" className="mb-6 scale-125">Mission Complete</Badge>
                    <h2 className="text-6xl font-black text-white mb-2">{Math.round((correctCount / results.length) * 100)}%</h2>
                    <p className="text-slate-400 mb-8">Accuracy Rating</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <div className="text-2xl font-bold text-emerald-400">{correctCount}</div>
                            <div className="text-xs uppercase text-emerald-600 font-bold">Correct</div>
                        </div>
                        <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                            <div className="text-2xl font-bold text-rose-400">{results.length - correctCount}</div>
                            <div className="text-xs uppercase text-rose-600 font-bold">Needs Work</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button variant="primary" className="w-full" onClick={() => onRestart(quizMode)}>
                            <RotateCcw className="mr-2" size={18} /> Restart Session
                        </Button>

                        {wrongItems.length > 0 && (
                            <Button variant="gradient" className="w-full" onClick={() => onRestart(wrongItems)}>
                                <Layers className="mr-2" size={18} /> Retry Errors ({wrongItems.length})
                            </Button>
                        )}

                        <Button variant="ghost" className="w-full" onClick={onExit}>Exit Arena</Button>
                    </div>
                </Card>
            </div>
        );
    }

    const progress = ((currentIndex) / quizList.length) * 100;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onExit} className="gap-2 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft size={16} /> Retreat
                </Button>
                <div className="flex items-center gap-4">
                    {streak > 1 && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="flex items-center gap-1 text-amber-500 font-bold px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20"
                        >
                            <Flame size={14} fill="currentColor" /> {streak} Streak
                        </motion.div>
                    )}
                    <span className="text-xs font-black text-slate-500 tracking-[0.2em]">{currentIndex + 1} / {quizList.length}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gemini-cyan"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Main Card */}
            <Card className="min-h-[400px] flex flex-col justify-between p-8 md:p-12 relative">
                <button
                    onClick={() => toggleStar(currentWord.term)}
                    className={cn("absolute top-8 right-8 transition-colors", isStarred(currentWord.term) ? "text-amber-400" : "text-slate-600 hover:text-slate-400")}
                >
                    <Star size={24} fill={isStarred(currentWord.term) ? "currentColor" : "none"} />
                </button>

                <div className="space-y-6">
                    <Badge>{currentWord.type}</Badge>
                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={currentWord.term}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-3xl md:text-4xl font-medium text-slate-100 leading-tight"
                        >
                            {currentWord.definition}
                        </motion.h2>
                    </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} className="mt-12 space-y-6">
                    <div className="relative">
                        <Input
                            autoFocus
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type the term..."
                            disabled={!!feedback}
                            className={cn(
                                "pr-24 font-bold text-2xl tracking-tight",
                                feedback?.status === 'correct' && "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
                                feedback?.status === 'wrong' && "border-rose-500/50 text-rose-400 bg-rose-500/10",
                                feedback?.status === 'close' && "border-amber-500/50 text-amber-400 bg-amber-500/10"
                            )}
                        />

                        {!feedback && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                                <Button type="button" variant="ghost" size="icon" onClick={() => provideHint()} title="Hint (H)">
                                    <Lightbulb size={20} />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" onClick={() => revealAnswer()} title="Reveal (R)">
                                    <Eye size={20} />
                                </Button>
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {feedback ? (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className={cn(
                                    "p-4 rounded-2xl flex items-center justify-between",
                                    feedback.status === 'wrong' ? "bg-rose-500/10 text-rose-300" : "bg-emerald-500/10 text-emerald-300"
                                )}
                            >
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{feedback.msg}</p>
                                    <p className="text-xl font-bold">{currentWord.term}</p>
                                </div>
                                <Button type="submit" variant="secondary" className="shrink-0">Next</Button>
                            </motion.div>
                        ) : (
                            <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-widest">
                                <span>Press Enter to Submit</span>
                                <span className="md:hidden">Skip</span>
                            </div>
                        )}
                    </AnimatePresence>
                    <button type="submit" className="hidden" />
                </form>
            </Card>
        </div>
    );
}
