"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'liquid';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-indigo-500/30 border border-white/10',
            secondary: 'bg-slate-800/50 text-slate-100 hover:bg-slate-800/70 border border-slate-700/50',
            outline: 'border border-white/20 bg-transparent hover:bg-white/5 text-white',
            ghost: 'hover:bg-white/5 text-slate-200',
            glass: 'glass text-white hover:bg-white/10 border-white/20 shadow-lg backdrop-blur-md',
            liquid: 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[4px] hover:bg-white/20',
        };

        const sizes = {
            sm: 'h-8 rounded-lg px-3 text-xs',
            md: 'h-10 rounded-xl px-4 py-2',
            lg: 'h-12 rounded-2xl px-8 text-lg',
            icon: 'h-10 w-10 rounded-xl p-2',
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {children}
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-shimmer pointer-events-none" />
            </motion.button>
        )
    }
)
Button.displayName = "Button"

