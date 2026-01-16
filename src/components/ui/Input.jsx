import React, { forwardRef } from 'react';
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Input = forwardRef(({ className, error, ...props }, ref) => {
    return (
        <div className="relative group">
            <motion.input
                ref={ref}
                layout
                className={cn(
                    "w-full bg-gemini-surface/30 backdrop-blur-md border-2 border-white/5 rounded-2xl px-6 py-5 text-xl font-medium outline-none transition-all duration-300 placeholder:text-slate-600 focus:bg-gemini-surface/50 focus:border-gemini-cyan/50 focus:shadow-glow text-white",
                    error && "border-rose-500/50 bg-rose-950/10 text-rose-200 focus:border-rose-500 focus:shadow-none",
                    className
                )}
                {...props}
            />
            {/* Animated border glow effect */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-focus-within:opacity-100 shadow-[0_0_20px_rgba(6,182,212,0.15)]" />
        </div>
    );
});

Input.displayName = 'Input';
