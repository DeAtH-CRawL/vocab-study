import React, { Suspense, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CreatorSignature } from '../components/ui/CreatorSignature';

import { AmbientBackground } from '../components/background/AmbientBackground';

const StarryBackground = memo(() => (
    <AmbientBackground />
));

export const MainLayout = ({ children, currentView, onViewChange }) => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
    const containerRef = React.useRef(null);

    const handleMouseMove = React.useCallback((e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
    }, []);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="min-h-screen font-sans text-slate-100 selection:bg-cyan-500/30 relative overflow-hidden group/spotlight"
            style={{
                '--mouse-x': `${mousePosition.x}px`,
                '--mouse-y': `${mousePosition.y}px`
            }}
        >
            <StarryBackground />

            {/* Global Spotlight Effect */}
            <div
                className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-0 group-hover/spotlight:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(6, 182, 212, 0.06), transparent 40%)`
                }}
            />

            {/* Header */}
            <header className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-gemini-bg/80 backdrop-blur-md border-b border-white/5">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onViewChange('menu')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onViewChange('menu')}
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

            <CreatorSignature />
        </div>
    );
};
