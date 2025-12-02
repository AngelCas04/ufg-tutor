"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming utils exists, if not I will create it or use clsx directly

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    intensity?: "low" | "medium" | "high";
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className,
    hoverEffect = false,
    intensity = "medium",
    ...props
}) => {
    const intensityClasses = {
        low: "bg-white/5 backdrop-blur-md border-white/10",
        medium: "bg-white/10 backdrop-blur-xl border-white/20",
        high: "bg-white/20 backdrop-blur-2xl border-white/30",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
                "rounded-2xl border shadow-lg overflow-hidden relative",
                intensityClasses[intensity],
                hoverEffect && "hover:bg-white/15 hover:scale-[1.02] transition-all duration-300 cursor-pointer",
                className
            )}
            {...props}
        >
            {/* Shine effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
