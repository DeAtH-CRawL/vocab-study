import React from 'react';
import { motion } from 'framer-motion';
import { Star, Hash } from 'lucide-react';
import { useVocabulary } from '../../contexts/VocabularyContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

export default function TheLedger() {
    const { vocabulary, toggleStar, isStarred, allWords } = useVocabulary();

    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Badge variant="primary" className="mb-2">Knowledge Base</Badge>
                    <h2 className="text-4xl font-bold text-white tracking-tight">The Ledger</h2>
                    <p className="text-slate-400 mt-1">Full archive of {Object.keys(vocabulary).length} daily collections</p>
                </div>
                <div className="bg-gemini-surface/50 border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <Hash className="text-gemini-cyan" size={20} />
                    <span className="text-2xl font-bold text-white">{allWords.length}</span>
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Total Terms</span>
                </div>
            </div>

            <div className="space-y-12 pb-12">
                {Object.keys(vocabulary).map((day, idx) => (
                    <motion.div
                        key={day}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-slate-800 flex-1" />
                            <span className="bg-slate-900 border border-slate-800 px-4 py-1 rounded-full text-slate-400 text-sm font-bold">{day}</span>
                            <div className="h-px bg-slate-800 flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vocabulary[day].map((item, i) => (
                                <Card key={i} className="group hover:border-slate-600 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-slate-200 group-hover:text-gemini-cyan transition-colors">{item.term}</h3>
                                        <button
                                            onClick={() => toggleStar(item.term)}
                                            className={cn(
                                                "p-2 rounded-lg transition-all",
                                                isStarred(item.term) ? "text-amber-400 bg-amber-400/10" : "text-slate-600 hover:text-slate-300 bg-transparent"
                                            )}
                                        >
                                            <Star size={16} fill={isStarred(item.term) ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{item.definition}</p>
                                    <Badge variant="default" className="bg-slate-800/50">{item.type}</Badge>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
