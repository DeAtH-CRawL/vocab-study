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
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 ease-spring disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-gemini-cyan text-gemini-bg hover:bg-cyan-400 hover:shadow-glow shadow-md font-bold tracking-wide",
        secondary: "bg-gemini-surface/50 text-slate-200 hover:bg-gemini-highlight border border-white/10 hover:border-white/20 backdrop-blur-sm",
        ghost: "text-slate-400 hover:text-white hover:bg-white/5",
        danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:shadow-glow-purple",
        gradient: "bg-gradient-to-r from-gemini-purple to-gemini-cyan text-white shadow-lg hover:shadow-glow-lg border-none font-bold tracking-wide",
        glass: "glass text-slate-200 hover:bg-white/10 hover:text-white"
    };

    const sizes = {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10 p-2"
    };

    return (
        <motion.button
            whileHover={{
                y: -2,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
            whileTap={{ scale: 0.97 }}
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
