'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SlideProps {
    children: ReactNode;
    isActive: boolean;
    className?: string;
    image?: string;
    imageAlt?: string;
}

export const slideVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.5
        }
    }
};

export const childVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            type: "spring" as const,
            damping: 20,
            stiffness: 100
        }
    }
};

export const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring" as const,
            damping: 20,
            stiffness: 100,
            delay: 0.4
        }
    }
};

export function Slide({ children, isActive, className, image, imageAlt }: SlideProps) {
    if (!isActive) return null;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideVariants}
            className={cn(
                "w-full h-full flex items-center justify-center p-4 md:p-16 overflow-y-auto md:overflow-hidden",
                className
            )}
        >
            <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-8 md:py-0">
                {/* Content */}
                <div className={cn(
                    "flex flex-col space-y-4 md:space-y-6 z-10",
                    image ? "flex-1 text-center md:text-left order-2 md:order-1" : "text-center max-w-5xl"
                )}>
                    {children}
                </div>

                {/* Image */}
                {image && (
                    <motion.div
                        variants={imageVariants}
                        className="flex-shrink-0 flex items-center justify-center order-1 md:order-2"
                    >
                        <div className="relative w-32 h-32 md:w-80 md:h-80">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full animate-pulse" />
                            <div className="relative z-10 w-full h-full bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-4 md:p-8 shadow-2xl flex items-center justify-center overflow-hidden group">
                                <img
                                    src={image}
                                    alt={imageAlt || "Slide image"}
                                    className="w-full h-full object-contain drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
