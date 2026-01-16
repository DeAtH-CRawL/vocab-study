import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Copy } from 'lucide-react';
import { cn } from '../../lib/utils';

const DiscordIcon = ({ className }) => (
    <svg
        viewBox="0 0 127.14 96.36"
        className={className}
        fill="currentColor"
        aria-hidden="true"
    >
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22c2.36-24.44-5.42-48.18-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
);

export const CreatorSignature = () => {
    const [copied, setCopied] = useState(false);

    const handleDiscordClick = async (e) => {
        e.preventDefault();

        // Secondary behavior: Copy handle
        try {
            await navigator.clipboard.writeText('death.crawl#8970');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }

        // Primary behavior: Open URL
        window.open('https://discord.com/users/843067252449869845', '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
        >
            {/* Toast Notification */}
            <AnimatePresence>
                {copied && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                        className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-gemini-cyan/10 backdrop-blur-md border border-gemini-cyan/20 rounded-xl flex items-center gap-2 text-xs font-bold text-gemini-cyan shadow-glow pointer-events-none whitespace-nowrap"
                    >
                        <Check size={12} />
                        <span>Discord Copied</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Signature Pill */}
            <div className="group flex items-center gap-4 px-5 py-2.5 bg-[#0f1014]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-full shadow-2xl transition-all duration-300 hover:shadow-glow-purple/20">

                {/* Text */}
                <div className="flex flex-col items-end leading-none">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold group-hover:text-slate-400 transition-colors">Engineered by</span>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Saagar</span>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-8 bg-white/10 group-hover:bg-white/20 transition-colors" />

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {/* Discord */}
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(88, 101, 242, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDiscordClick}
                        className="p-2 rounded-full text-slate-400 hover:text-[#5865F2] transition-colors relative"
                        title="Copy: death.crawl#8970"
                    >
                        <DiscordIcon className="w-5 h-5" />
                    </motion.button>

                    {/* Email */}
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(236, 72, 153, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open('mailto:saagarjhawar84@gmail.com')}
                        className="p-2 rounded-full text-slate-400 hover:text-gemini-pink transition-colors"
                        title="Email Me"
                    >
                        <Mail size={18} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};
