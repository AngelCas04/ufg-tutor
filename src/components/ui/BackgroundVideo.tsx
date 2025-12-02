"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function BackgroundVideo() {
    const videoRef1 = useRef<HTMLVideoElement>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);
    const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const pathname = usePathname();

    const TRANSITION_DURATION = 1; // seconds

    // Check if we should show the video (not on login page)
    const isLoginPage = pathname === "/login";

    useEffect(() => {
        // Show video with delay when not on login page
        if (!isLoginPage) {
            // Small delay before showing to create entrance effect
            const timer = setTimeout(() => {
                setShouldShow(true);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setShouldShow(false);
        }
    }, [isLoginPage]);

    useEffect(() => {
        const v1 = videoRef1.current;
        const v2 = videoRef2.current;

        if (!v1 || !v2 || !shouldShow) return;

        const handleTimeUpdate = () => {
            if (isTransitioning) return;

            const currentVideo = activeVideo === 1 ? v1 : v2;
            const nextVideo = activeVideo === 1 ? v2 : v1;

            // Start transition before end
            if (currentVideo.currentTime > currentVideo.duration - TRANSITION_DURATION) {
                setIsTransitioning(true);

                // Prepare next video
                nextVideo.currentTime = 0;
                nextVideo.play().catch(e => console.error("Video play failed", e));
                nextVideo.style.opacity = "0.4"; // Target opacity

                // Fade out current
                currentVideo.style.opacity = "0";

                // Swap active tracker after transition
                setTimeout(() => {
                    setActiveVideo(prev => prev === 1 ? 2 : 1);
                    setIsTransitioning(false);
                    currentVideo.pause();
                }, TRANSITION_DURATION * 1000);
            }
        };

        // Attach listener only to active video
        const active = activeVideo === 1 ? v1 : v2;
        active.addEventListener("timeupdate", handleTimeUpdate);

        return () => {
            active.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, [activeVideo, isTransitioning, shouldShow]);

    // Don't render anything on login page
    if (isLoginPage) {
        return null;
    }

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="fixed inset-0 -z-50 overflow-hidden bg-black"
                >
                    <video
                        ref={videoRef1}
                        autoPlay
                        muted
                        playsInline
                        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000 ease-linear"
                        style={{ opacity: activeVideo === 1 ? 0.4 : 0 }}
                    >
                        <source src="/video.mp4" type="video/mp4" />
                    </video>

                    <video
                        ref={videoRef2}
                        muted
                        playsInline
                        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000 ease-linear"
                        style={{ opacity: activeVideo === 2 ? 0.4 : 0 }}
                    >
                        <source src="/video.mp4" type="video/mp4" />
                    </video>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
