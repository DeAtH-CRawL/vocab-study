import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Settings } from 'lucide-react';
import { Button } from '../components/ui/Button';

const StarryBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gemini-purple/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-gemini-cyan/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-gemini-pink/5 rounded-full blur-[80px]" />
    </div>
);

export const MainLayout = ({ children, currentView, onViewChange }) => {
    return (
        <div className="min-h-screen font-sans text-slate-100 selection:bg-cyan-500/30">
            <StarryBackground />

            {/* Header */}
            <header className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-gemini-bg/80 backdrop-blur-md border-b border-white/5">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onViewChange('menu')}
                >
                    <div className="p-2 bg-gradient-to-br from-gemini-purple to-gemini-cyan rounded-xl shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={24} className="text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        VOCAB<span className="font-light text-gemini-cyan">MASTER</span>
                    </span>
                </div>

                <nav className="flex items-center gap-2">
                    <Button
                        variant={currentView === 'menu' ? 'glass' : 'ghost'}
                        size="sm"
                        onClick={() => onViewChange('menu')}
                    >
                        Arena
                    </Button>
                    <Button
                        variant={currentView === 'vault' ? 'glass' : 'ghost'}
                        size="sm"
                        onClick={() => onViewChange('vault')}
                    >
                        The Ledger
                    </Button>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 pt-24 px-4 pb-12 max-w-7xl mx-auto min-h-screen flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex-1"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};
