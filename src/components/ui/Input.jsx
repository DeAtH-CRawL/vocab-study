import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Input = ({ className, error, ...props }) => {
    return (
        <div className="relative group">
            <motion.input
                layout
                className={cn(
                    "w-full bg-gemini-surface/50 border-2 border-white/5 rounded-2xl px-6 py-5 text-xl font-medium outline-none transition-all placeholder:text-slate-600 focus:bg-gemini-surface focus:border-gemini-cyan/50 focus:shadow-glow",
                    error && "border-rose-500/50 bg-rose-950/10 text-rose-200 focus:border-rose-500",
                    className
                )}
                {...props}
            />
            {/* Animated border glow effect could go here */}
        </div>
    );
};
