import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Eye, Star } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { useVocabulary } from '../../contexts/VocabularyContext';

export const QuestionCard = ({
    currentWord,
    userInput,
    setUserInput,
    feedback,
    onSubmit,
    provideHint,
    revealAnswer,
    isFinished
}) => {
    const inputRef = useRef(null);
    const { toggleStar, isStarred } = useVocabulary();

    // Auto-focus logic
    useEffect(() => {
        if (!isFinished && !feedback && inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50); // Slightly increased timeout for stability
            return () => clearTimeout(timer);
        }
    }, [currentWord, feedback, isFinished]);

    // Keyboard shortcuts handled centrally in parent, but we handle input specific logic here
    // None needed for now as parent handles H/R shortcuts when not focused or globally

    return (
        <Card className="min-h-[400px] flex flex-col justify-between p-8 md:p-12 relative overflow-visible">
            {currentWord?.term && (
                <button
                    onClick={() => toggleStar(currentWord.term)}
                    className={cn("absolute top-8 right-8 transition-colors z-20", isStarred(currentWord.term) ? "text-amber-400" : "text-slate-600 hover:text-slate-400")}
                    title={isStarred(currentWord.term) ? "Unstar" : "Star for review"}
                >
                    <Star size={24} fill={isStarred(currentWord.term) ? "currentColor" : "none"} />
                </button>
            )}

            <div className="space-y-6 relative z-10">
                {currentWord?.type && <Badge>{currentWord.type}</Badge>}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentWord?.term || 'default'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-medium text-slate-100 leading-tight">
                            {currentWord?.definition}
                        </h2>
                    </motion.div>
                </AnimatePresence>
            </div>

            <form onSubmit={onSubmit} className="mt-12 space-y-6 relative z-10">
                <div className="relative group">
                    <Input
                        ref={inputRef}
                        autoFocus
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type the term..."
                        disabled={!!feedback}
                        className={cn(
                            "pr-24 font-bold text-2xl tracking-tight transition-all duration-300",
                            feedback?.status === 'correct' && "border-emerald-500/50 text-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]",
                            feedback?.status === 'wrong' && "border-rose-500/50 text-rose-400 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.2)]",
                            feedback?.status === 'close' && "border-amber-500/50 text-amber-400 bg-amber-500/10"
                        )}
                    />

                    {!feedback && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                            <Button type="button" variant="ghost" size="icon" onClick={() => provideHint()} title="Hint (H)">
                                <Lightbulb size={20} />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => revealAnswer()} title="Reveal (R)">
                                <Eye size={20} />
                            </Button>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {feedback ? (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            className={cn(
                                "p-4 rounded-2xl flex items-center justify-between shadow-lg",
                                feedback.status === 'wrong' ? "bg-rose-500/10 text-rose-300 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            )}
                        >
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{feedback.msg}</p>
                                <p className="text-xl font-bold">{currentWord?.term || 'Unknown'}</p>
                            </div>
                            <Button type="submit" variant="secondary" className="shrink-0 group-hover:bg-white/20">
                                Next <span className="ml-2 text-xs opacity-50">↵</span>
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="instructions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-widest"
                        >
                            <span className="flex items-center gap-2">
                                Press <kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">Enter</kbd> to Submit
                            </span>
                            <span className="md:hidden">Skip</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button type="submit" className="hidden" />
            </form>
        </Card>
    );
};
