import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Card = ({ children, className, hover = false, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-gemini-surface/50 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden",
                hover && "hover:border-white/10 hover:bg-gemini-surface/70 transition-colors duration-300 group",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};
