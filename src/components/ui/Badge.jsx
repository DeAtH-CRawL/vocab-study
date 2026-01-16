import { cn } from "../../lib/utils";

export const Badge = ({ children, variant = 'default', className }) => {
    const variants = {
        default: "bg-slate-800/50 backdrop-blur-sm text-slate-300 border-slate-700",
        primary: "bg-gemini-cyan/10 backdrop-blur-sm text-gemini-cyan border-gemini-cyan/20 shadow-glow",
        purple: "bg-gemini-purple/10 backdrop-blur-sm text-gemini-purple border-gemini-purple/20 shadow-glow-purple",
        success: "bg-emerald-500/10 backdrop-blur-sm text-emerald-400 border-emerald-500/20",
        warning: "bg-amber-500/10 backdrop-blur-sm text-amber-400 border-amber-500/20",
        danger: "bg-rose-500/10 backdrop-blur-sm text-rose-400 border-rose-500/20",
    };

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};
