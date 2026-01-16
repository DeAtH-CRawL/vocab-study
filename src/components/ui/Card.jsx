import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Card = ({ children, className, hover = false, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
                "glass-card rounded-3xl p-6 relative overflow-hidden",
                hover && "hover:border-white/20 hover:bg-gemini-surface/60 transition-colors duration-300 group cursor-pointer",
                className
            )}
            {...props}
        >
            {/* Ambient light effect inside card */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            {children}
        </motion.div>
    );
};
