import React from 'react';
import { motion } from 'framer-motion';

export const AmbientBackground = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-slate-950">
            {/* Base Gradient Layer - Deep Aurora */}
            <div
                className="absolute inset-0 opacity-80"
                style={{
                    background: `
            radial-gradient(circle at 15% 50%, rgba(76, 29, 149, 0.15), transparent 25%),
            radial-gradient(circle at 85% 30%, rgba(14, 165, 233, 0.15), transparent 25%)
          `
                }}
            />

            {/* Animated Elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[100px]"
            />

            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [-20, 20, -20]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-900/20 blur-[120px]"
            />

            {/* Noise Texture Overlay for "Film Grain" feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'url("/noise.png")' }}></div>

            {/* Glassmorphism Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />
        </div>
    );
};
