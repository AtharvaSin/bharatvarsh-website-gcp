'use client';

import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScrollIndicator: FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    const handleScrollClick = () => {
        const nextSection = document.getElementById('the-world');
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            // Hide if scrolled more than 100px
            if (window.scrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={handleScrollClick}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer group"
                    aria-label="Scroll to next section"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-6 h-10 border-2 border-[var(--powder-500)] rounded-full flex justify-center bg-black/10 backdrop-blur-sm group-hover:border-[var(--mustard-500)] transition-colors"
                    >
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-1.5 h-3 bg-[var(--powder-500)] rounded-full mt-2 group-hover:bg-[var(--mustard-500)] transition-colors"
                        />
                    </motion.div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};
