"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { Button } from "./ui/Button";
import { createPortal } from "react-dom";

interface CalendarCarouselProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CalendarCarousel({ isOpen, onClose }: CalendarCarouselProps) {
    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        async function fetchImages() {
            try {
                const res = await fetch("/api/images");
                const data = await res.json();
                if (data.images) {
                    setImages(data.images);
                }
            } catch (error) {
                console.error("Failed to load images", error);
            } finally {
                setLoading(false);
            }
        }
        fetchImages();
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prev) => {
            let nextIndex = prev + newDirection;
            if (nextIndex < 0) nextIndex = images.length - 1;
            if (nextIndex >= images.length) nextIndex = 0;
            return nextIndex;
        });
    };

    const downloadImage = async () => {
        if (!images[currentIndex]) return;
        try {
            const response = await fetch(images[currentIndex]);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `calendario-ufg-${currentIndex + 1}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed", error);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0,
            scale: 0.8,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0,
            scale: 0.8,
        }),
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 z-20">
                        <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                            Calendario Académico
                        </h2>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="glass"
                                onClick={downloadImage}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border-white/20"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Descargar</span>
                            </Button>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
                        {loading ? (
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        ) : images.length === 0 ? (
                            <p className="text-white/70 text-lg">No hay imágenes disponibles</p>
                        ) : (
                            <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
                                <AnimatePresence initial={false} custom={direction} mode="wait">
                                    <motion.img
                                        key={currentIndex}
                                        src={images[currentIndex]}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            x: { type: "spring", stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.2 },
                                        }}
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={1}
                                        onDragEnd={(e, { offset, velocity }) => {
                                            const swipe = Math.abs(offset.x) * velocity.x;
                                            if (swipe < -10000) {
                                                paginate(1);
                                            } else if (swipe > 10000) {
                                                paginate(-1);
                                            }
                                        }}
                                        className="max-w-full max-h-full object-contain drop-shadow-2xl select-none"
                                        draggable={false}
                                    />
                                </AnimatePresence>

                                {/* Navigation Buttons */}
                                {images.length > 1 && (
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => paginate(-1)}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/40 transition-all z-10"
                                        >
                                            <ChevronLeft className="w-8 h-8" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => paginate(1)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/40 transition-all z-10"
                                        >
                                            <ChevronRight className="w-8 h-8" />
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Indicators */}
                    <div className="p-6 flex justify-center z-20">
                        <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                            {/* Glow effect behind the container */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />

                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        const diff = idx - currentIndex;
                                        setDirection(diff > 0 ? 1 : -1);
                                        setCurrentIndex(idx);
                                    }}
                                    className="relative outline-none group py-2"
                                >
                                    {/* Inactive Dot (The path) */}
                                    <div
                                        className={`w-2 h-2 rounded-full transition-all duration-500 ${idx === currentIndex
                                            ? "bg-transparent scale-0"
                                            : "bg-white/20 group-hover:bg-white/60 group-hover:scale-150 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] scale-100"
                                            }`}
                                    />

                                    {/* Active Pill (The Liquid Light) */}
                                    {idx === currentIndex && (
                                        <motion.div
                                            layoutId="venom-pill"
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 rounded-full"
                                            style={{
                                                width: '32px',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                                                boxShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255,255,255,0.8)'
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 170,
                                                damping: 20,
                                                mass: 1,
                                                restDelta: 0.001
                                            }}
                                        >
                                            {/* Specular highlight for liquid effect */}
                                            <div className="absolute top-[2px] left-[4px] right-[4px] h-[30%] bg-white/90 rounded-full blur-[1px]" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
