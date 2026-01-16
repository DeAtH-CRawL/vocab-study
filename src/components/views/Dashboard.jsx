import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Flame, ChevronRight, Zap } from 'lucide-react';
import { useVocabulary } from '../../contexts/VocabularyContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Dashboard({ onStartQuiz }) {
    const { vocabulary, getStarredWords, allWords, isLoading } = useVocabulary();
    const starredWords = getStarredWords();
    const days = Object.keys(vocabulary || {}).reverse();

    // Show loading skeleton while data fetches
    if (isLoading) {
        return (
            <div className="space-y-8">
                {/* Hero skeleton */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gemini-surface/30 border border-white/5 p-8 md:p-12 h-64">
                    <div className="space-y-4 max-w-md">
                        <div className="h-6 w-32 bg-gemini-surface/60 rounded-full animate-shimmer" />
                        <div className="h-12 w-80 bg-gemini-surface/60 rounded-2xl animate-shimmer" style={{ animationDelay: '0.1s' }} />
                        <div className="h-6 w-64 bg-gemini-surface/40 rounded-lg animate-shimmer" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gemini-purple/5 blur-[100px] rounded-full" />
                </div>

                {/* Cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full sim skeleton */}
                    <div className="md:col-span-2 h-24 bg-gemini-surface/30 rounded-2xl border border-white/5 flex items-center p-6 gap-6">
                        <div className="w-16 h-16 bg-gemini-surface/50 rounded-2xl animate-shimmer" />
                        <div className="space-y-2 flex-1">
                            <div className="h-5 w-40 bg-gemini-surface/50 rounded-lg animate-shimmer" />
                            <div className="h-4 w-60 bg-gemini-surface/30 rounded-lg animate-shimmer" style={{ animationDelay: '0.1s' }} />
                        </div>
                    </div>
                    {/* Starred skeleton */}
                    <div className="md:col-span-2 h-24 bg-gemini-surface/30 rounded-2xl border border-white/5 flex items-center p-6 gap-6">
                        <div className="w-16 h-16 bg-gemini-surface/50 rounded-2xl animate-shimmer" style={{ animationDelay: '0.2s' }} />
                        <div className="space-y-2 flex-1">
                            <div className="h-5 w-36 bg-gemini-surface/50 rounded-lg animate-shimmer" style={{ animationDelay: '0.3s' }} />
                            <div className="h-4 w-52 bg-gemini-surface/30 rounded-lg animate-shimmer" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </div>
                    {/* Day cards skeleton */}
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="h-20 bg-gemini-surface/30 rounded-2xl border border-white/5 flex items-center px-5 gap-4"
                        >
                            <div className="w-10 h-8 bg-gemini-surface/40 rounded animate-shimmer" style={{ animationDelay: `${0.1 * i}s` }} />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-20 bg-gemini-surface/50 rounded animate-shimmer" style={{ animationDelay: `${0.15 * i}s` }} />
                                <div className="h-3 w-16 bg-gemini-surface/30 rounded animate-shimmer" style={{ animationDelay: `${0.2 * i}s` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }



    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gemini-surface to-[#0f1014] border border-white/5 p-8 md:p-12">
                <div className="relative z-10 max-w-2xl">
                    <Badge variant="purple" className="mb-6">Ready for battle?</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
                        The Mastery <span className="text-transparent bg-clip-text bg-gradient-to-r from-gemini-purple to-gemini-cyan">Arena</span>
                    </h1>
                    <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
                        Engage in active recall to strengthen your neural pathways. Choose your challenge level below.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="gradient" size="lg" onClick={() => onStartQuiz('all')}>
                            <Zap className="mr-2" size={20} /> Quick Start
                        </Button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gemini-purple/10 blur-[100px] rounded-full pointer-events-none" />
                <Flame className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-12" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Sim Card */}
                <Card
                    className="md:col-span-2 flex flex-col md:flex-row items-center justify-between cursor-pointer group"
                    hover={true}
                    onClick={() => onStartQuiz('all')}
                >
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl text-amber-500">
                            <Trophy size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">Full Simulation</h3>
                            <p className="text-slate-400 text-sm mt-1">Random selection from {allWords.length} terms across all days</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 p-3 bg-white/5 rounded-full group-hover:bg-amber-500/20 transition-colors">
                        <ChevronRight className="text-slate-400 group-hover:text-amber-400" />
                    </div>
                </Card>

                {/* Starred Card */}
                <Card
                    className="md:col-span-2 flex flex-col md:flex-row items-center justify-between cursor-pointer group"
                    hover={true}
                    onClick={() => onStartQuiz('starred')}
                >
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl text-cyan-400">
                            <Star size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">Starred Archive</h3>
                            <p className="text-slate-400 text-sm mt-1">Review your {starredWords.length} saved difficult terms</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 p-3 bg-white/5 rounded-full group-hover:bg-cyan-500/20 transition-colors">
                        <ChevronRight className="text-slate-400 group-hover:text-cyan-400" />
                    </div>
                </Card>

                {/* Day Cards */}
                {days.map((day, idx) => (
                    <motion.div key={day} variants={item}>
                        <Card
                            className="h-full cursor-pointer hover:border-gemini-cyan/30 group py-5"
                            hover={true}
                            onClick={() => onStartQuiz(day)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl font-black text-white/10 group-hover:text-gemini-cyan/50 transition-colors">
                                        {(days.length - idx).toString().padStart(2, '0')}
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-slate-200 group-hover:text-white">{day}</h4>
                                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{vocabulary[day]?.length || 0} TERMS</span>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
