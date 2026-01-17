import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame } from 'lucide-react';
import { Button } from '../ui/Button';

export const QuizHeader = React.memo(({ onExit, streak, currentIndex, totalLetters, progress }) => {
    return (
        <React.Fragment>
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onExit} className="gap-2 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft size={16} /> Retreat
                </Button>
                <div className="flex items-center gap-4">
                    {streak > 1 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            key={streak}
                            className="flex items-center gap-1 text-amber-500 font-bold px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20"
                        >
                            <Flame size={14} fill="currentColor" /> {streak} Streak
                        </motion.div>
                    )}
                    <span className="text-xs font-black text-slate-500 tracking-[0.2em]">
                        {currentIndex + 1} / {totalLetters}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                <motion.div
                    className="h-full bg-gradient-to-r from-gemini-cyan to-gemini-purple shadow-glow"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "spring" }}
                />
            </div>
        </React.Fragment>
    );
});
