"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Maximize2, Minimize2 } from "lucide-react"

// Create a client component that uses useSearchParams
function TimerContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const title = searchParams.get("title");
    const dateTime = searchParams.get("dateTime");

    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isUIVisible, setIsUIVisible] = useState(true)

    // Handle wakeLock to keep screen on
    useEffect(() => {
        // Check if the Wake Lock API is supported
        if ('wakeLock' in navigator) {
            let wakeLockRef: WakeLockSentinel | null = null;

            const requestWakeLock = async () => {
                if (wakeLockRef) return; // Avoid requesting if we already have a lock

                try {
                    wakeLockRef = await navigator.wakeLock.request('screen');

                    // Add a release handler
                    wakeLockRef.addEventListener('release', () => {
                        wakeLockRef = null;
                    });
                } catch (err) {
                    console.error(`Failed to get wake lock: ${err}`);
                }
            };

            // Handle visibility changes
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible' && !wakeLockRef) {
                    requestWakeLock();
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Initial request
            requestWakeLock();

            // Cleanup on unmount
            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                if (wakeLockRef) {
                    wakeLockRef.release().catch(err => console.error(`Failed to release wake lock: ${err}`));
                }
            };
        } else {
            // Wake Lock API not supported
        }
    }, []); // Empty dependency array - only run on mount/unmount

    // Handle fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])  // This effect only needs to run once on mount

    // Handle UI visibility based on mouse inactivity
    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;

        // Show UI on any mouse movement or touch
        const handleActivity = () => {
            setIsUIVisible(true);

            // Clear any existing timer
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // Set a new timer to hide UI after 5 seconds of inactivity
            timeoutId = setTimeout(() => {
                setIsUIVisible(false);
            }, 5000);
        };

        // Initialize - show UI and set timer
        handleActivity();

        // Add event listeners for both mouse and touch events
        document.addEventListener('mousemove', handleActivity);
        document.addEventListener('touchstart', handleActivity);
        document.addEventListener('touchmove', handleActivity);
        document.addEventListener('click', handleActivity);
        document.addEventListener('keydown', handleActivity);

        // Clean up
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            document.removeEventListener('mousemove', handleActivity);
            document.removeEventListener('touchstart', handleActivity);
            document.removeEventListener('touchmove', handleActivity);
            document.removeEventListener('click', handleActivity);
            document.removeEventListener('keydown', handleActivity);
        };
    }, []); // Remove inactivityTimer from dependency array

    // Handle timer logic
    useEffect(() => {
        if (!dateTime) {
            router.push("/")
            return
        }

        const targetDate = new Date(dateTime).getTime()

        const calculateTimeLeft = () => {
            const now = new Date().getTime()
            const difference = targetDate - now

            if (difference <= 0) {
                return { hours: 0, minutes: 0, seconds: 0 }
            }

            // Calculate hours, minutes, and seconds
            const hours = Math.floor(difference / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            return { hours, minutes, seconds }
        }

        // Initial calculation
        setTimeLeft(calculateTimeLeft())

        // Update every second
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        // Clean up interval on unmount
        return () => clearInterval(timer)
    }, [dateTime, router])

    const formatTime = (value: number) => {
        return value.toString().padStart(2, "0")
    }

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else if (document.exitFullscreen) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error(`Fullscreen error: ${err}`);
        }
    }

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-5 relative ${!isUIVisible ? 'cursor-none' : ''}`}>
            {/* Fullscreen button in top right corner */}
            <button
                type="button"
                onClick={toggleFullscreen}
                className={`absolute top-5 right-5 p-3 md:p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors touch-manipulation ${isUIVisible ? 'opacity-100' : 'opacity-0'
                    } transition-opacity duration-300`}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                style={{ touchAction: 'manipulation' }}
            >
                {isFullscreen ? <Minimize2 size={28} /> : <Maximize2 size={28} />}
            </button>

            {title && <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">{decodeURIComponent(title)}</h1>}

            <div className="text-timer font-mono font-bold tracking-tight">
                {formatTime(timeLeft.hours)}
                <span className="mx-5">:</span>
                {formatTime(timeLeft.minutes)}
                <span className="mx-5">:</span>
                <span className="text-red-500">{formatTime(timeLeft.seconds)}</span>
            </div>
        </div>
    )
}

// Main page component with Suspense boundary
export default function TimerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <TimerContent />
        </Suspense>
    )
}
