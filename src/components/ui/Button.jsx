import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    isLoading,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none active:scale-95";

    const variants = {
        primary: "bg-gemini-cyan text-gemini-bg hover:bg-cyan-400 hover:shadow-glow shadow-md",
        secondary: "bg-gemini-surface text-slate-200 hover:bg-gemini-highlight border border-white/5",
        ghost: "text-slate-400 hover:text-white hover:bg-white/5",
        danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20",
        gradient: "bg-gradient-to-r from-gemini-purple to-gemini-cyan text-white shadow-lg hover:shadow-cyan-500/25 border-none",
        glass: "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10"
    };

    const sizes = {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10 p-2"
    };

    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {isLoading ? (
                <span className="animate-spin mr-2">⟳</span>
            ) : null}
            {children}
        </motion.button>
    );
};
