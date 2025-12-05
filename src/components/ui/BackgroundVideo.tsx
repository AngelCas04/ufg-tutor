"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function BackgroundVideo() {
    const videoRef1 = useRef<HTMLVideoElement>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const pathname = usePathname();

    // Configuration
    const CROSSFADE_DURATION = 2; // seconds of overlap
    const FADE_IN_DURATION = 2; // initial fade in seconds

    // Check if we should show the video (not on login page)
    const isLoginPage = pathname === "/login";

    useEffect(() => {
        if (!isLoginPage) {
            setShouldShow(true);
        } else {
            setShouldShow(false);
            setIsLoaded(false);
        }
    }, [isLoginPage]);

    useEffect(() => {
        const v1 = videoRef1.current;
        const v2 = videoRef2.current;
        if (!v1 || !v2 || !shouldShow) return;

        let activeVideo = 1;
        let isTransitioning = false;

        const checkTime = () => {
            const current = activeVideo === 1 ? v1 : v2;
            const next = activeVideo === 1 ? v2 : v1;

            if (!current.duration) return;

            // Trigger crossfade before end
            const timeLeft = current.duration - current.currentTime;

            if (timeLeft <= CROSSFADE_DURATION && !isTransitioning) {
                isTransitioning = true;

                // Prepare next video
                next.currentTime = 0;
                next.style.opacity = "0.4"; // Fade in next
                next.play().then(() => {
                    // Fade out current
                    current.style.opacity = "0";

                    // Switch active tracker
                    activeVideo = activeVideo === 1 ? 2 : 1;

                    // Reset after transition completes
                    setTimeout(() => {
                        isTransitioning = false;
                        current.pause();
                    }, CROSSFADE_DURATION * 1000);
                }).catch(e => {
                    console.error("Crossfade failed, falling back to loop", e);
                    // Fallback: just loop current video if next fails
                    current.loop = true;
                    isTransitioning = false;
                });
            }
        };

        // Initial setup
        v1.style.opacity = "0"; // Start invisible
        v2.style.opacity = "0";
        v1.currentTime = 0;

        // Start playing first video
        v1.play().then(() => {
            // Only fade in if we haven't already (handled by isLoaded state visually)
            // But here we set the actual element opacity for the crossfade logic
            v1.style.opacity = "0.4";
        }).catch(console.error);

        // Monitor time on both
        const interval = setInterval(() => {
            if (activeVideo === 1) checkTime();
            else checkTime(); // Check whichever is active
        }, 100); // Check every 100ms

        return () => {
            clearInterval(interval);
        };
    }, [shouldShow]);

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
                    {/* Video 1 */}
                    <video
                        ref={videoRef1}
                        muted
                        playsInline
                        onLoadedData={() => setIsLoaded(true)}
                        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
                        style={{
                            opacity: 0, // Controlled by JS
                            transition: `opacity ${CROSSFADE_DURATION}s linear`
                        }}
                    >
                        <source src="/video.mp4" type="video/mp4" />
                    </video>

                    {/* Video 2 */}
                    <video
                        ref={videoRef2}
                        muted
                        playsInline
                        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
                        style={{
                            opacity: 0, // Controlled by JS
                            transition: `opacity ${CROSSFADE_DURATION}s linear`
                        }}
                    >
                        <source src="/video.mp4" type="video/mp4" />
                    </video>

                    {/* Initial Fade In Overlay - This handles the "Elegant Entrance" */}
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isLoaded ? 0 : 1 }}
                        transition={{ duration: FADE_IN_DURATION, ease: "easeOut" }}
                        className="absolute inset-0 bg-black pointer-events-none z-10"
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-0" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
