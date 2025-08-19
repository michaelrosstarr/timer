"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Maximize2, Minimize2, ArrowLeft, Calendar, Moon, Sun, Plus } from "lucide-react"

// Create a client component that uses useSearchParams
function TimerContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const title = searchParams.get("title");
    const dateTime = searchParams.get("dateTime");
    const hideDate = searchParams.get("hideDate") === "true";

    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isUIVisible, setIsUIVisible] = useState(true)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [targetDateTime, setTargetDateTime] = useState<string | null>(null)

    // Functions to add extra time
    const addExtraTime = (minutes: number) => {
        if (!targetDateTime) return

        const currentTarget = new Date(targetDateTime)
        currentTarget.setMinutes(currentTarget.getMinutes() + minutes)
        const newTargetDateTime = currentTarget.toISOString()

        setTargetDateTime(newTargetDateTime)

        // Update URL with new target time
        const titleParam = title ? `&title=${encodeURIComponent(title)}` : ""
        const hideDateParam = hideDate ? `&hideDate=true` : ""
        const newUrl = `${window.location.pathname}?dateTime=${encodeURIComponent(newTargetDateTime)}${titleParam}${hideDateParam}`
        window.history.replaceState({}, '', newUrl)
    }

    // Set mounted state after hydration
    useEffect(() => {
        setIsMounted(true)
    }, [])

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
                if (isFullscreen) {
                    setIsUIVisible(false);
                }
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
    }, [isFullscreen]); // Add isFullscreen to dependency array

    // Handle timer logic
    useEffect(() => {
        if (!dateTime) {
            router.push("/")
            return
        }

        // Initialize target date time
        setTargetDateTime(dateTime)
    }, [dateTime, router])

    useEffect(() => {
        if (!targetDateTime) return

        const targetDate = new Date(targetDateTime).getTime()

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
    }, [targetDateTime])

    // Theme detection and handling
    useEffect(() => {
        if (!isMounted) return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        setIsDarkMode(mediaQuery.matches)

        const handleChange = (e: MediaQueryListEvent) => {
            setIsDarkMode(e.matches)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [isMounted])

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

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode)
    }

    const getTimeLeftFormatted = () => {
        // Helper to render each digit in a fixed-width span
        const renderDigits = (str: string, extraClass = "") => (
            <>
                {str.split("").map((char, idx) => (
                    <span
                        key={idx}
                        className={`inline-block w-[1ch] text-center ${extraClass}`}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {char}
                    </span>
                ))}
            </>
        );

        // Always show hours:minutes:seconds format
        return (
            <span className="inline-flex gap-1 font-mono text-9xl">
                {renderDigits(formatTime(timeLeft.hours))}
                <span className="inline-block w-[1ch] text-center">:</span>
                {renderDigits(formatTime(timeLeft.minutes))}
                <span className="inline-block w-[1ch] text-center">:</span>
                {renderDigits(formatTime(timeLeft.seconds), "text-red-500")}
            </span>
        );
    }

    const getTargetTimeFormatted = () => {
        if (!targetDateTime) return ""
        const target = new Date(targetDateTime)
        return target.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    return (
        <div
            className={`min-h-screen transition-all duration-300 ${!isMounted
                ? 'bg-white' // Default to light mode during SSR
                : isDarkMode
                    ? 'bg-slate-900'
                    : 'bg-white'
                } flex flex-col items-center justify-center p-4 md:p-8 relative ${!isUIVisible ? 'cursor-none' : ''
                }`}
        >
            {/* Header Controls */}
            <div className={`absolute top-4 left-4 right-4 flex justify-between items-center z-10 ${isUIVisible ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-300`}>
                <button
                    type="button"
                    onClick={() => router.push('/')}
                    className={`p-3 rounded-lg glass-effect hover:bg-black/5 hover:dark:bg-white/10 transition-all duration-200 cursor-pointer ${!isMounted
                        ? 'text-slate-700 bg-black/5 border border-black/10'
                        : isDarkMode
                            ? 'text-white bg-white/5 border border-white/10'
                            : 'text-slate-700 bg-black/5 border border-black/10'
                        }`}
                    aria-label="Go back to home"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className={`p-3 rounded-lg glass-effect hover:bg-black/5 hover:dark:bg-white/10 transition-all duration-200 cursor-pointer ${!isMounted
                            ? 'text-slate-700 bg-black/5 border border-black/10' // Default to light mode
                            : isDarkMode
                                ? 'text-white bg-white/5 border border-white/10'
                                : 'text-slate-700 bg-black/5 border border-black/10'
                            }`}
                        aria-label="Toggle theme"
                    >
                        {!isMounted ? <Moon size={24} /> : isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                    </button>

                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className={`p-3 rounded-lg glass-effect hover:bg-black/5 hover:dark:bg-white/10 transition-all duration-200 cursor-pointer ${!isMounted
                            ? 'text-slate-700 bg-black/5 border border-black/10' // Default to light mode
                            : isDarkMode
                                ? 'text-white bg-white/5 border border-white/10'
                                : 'text-slate-700 bg-black/5 border border-black/10'
                            }`}
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                    </button>
                </div>
            </div>

            {/* Main Timer Content */}
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl animate-fade-in">
                {/* Event Title */}
                {title && (
                    <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-6 animate-scale-in ${!isMounted
                        ? 'text-slate-800' // Default to light mode
                        : isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>
                        {decodeURIComponent(title)}
                    </h1>
                )}

                {/* Target Time Display - conditionally shown */}
                {!hideDate && (
                    <div className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg glass-effect ${!isMounted
                        ? 'text-slate-600 bg-black/5 border border-black/10' // Default to light mode
                        : isDarkMode
                            ? 'text-white/80 bg-white/5 border border-white/10'
                            : 'text-slate-600 bg-black/5 border border-black/10'
                        }`}>
                        <Calendar size={20} />
                        <span className="text-lg font-medium">
                            {getTargetTimeFormatted()}
                        </span>
                    </div>
                )}

                {/* Timer Display */}
                <div className={`text-center font-bold ${!isMounted
                    ? 'text-slate-800' // Default to light mode
                    : isDarkMode
                        ? 'text-white'
                        : 'text-slate-800'
                    }`}>
                    {getTimeLeftFormatted()}
                </div>
            </div>

            {/* Extra Time Buttons - Fixed to bottom right */}
            <div className={`fixed bottom-6 right-6 flex flex-col gap-3 z-10 ${isUIVisible ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-300`}>
                <button
                    type="button"
                    onClick={() => addExtraTime(5)}
                    className={`px-4 py-3 rounded-lg glass-effect hover:bg-black/5 hover:dark:bg-white/10 transition-all duration-200 cursor-pointer shadow-lg ${!isMounted
                        ? 'text-slate-700 bg-black/5 border border-black/10'
                        : isDarkMode
                            ? 'text-white bg-white/5 border border-white/10'
                            : 'text-slate-700 bg-black/5 border border-black/10'
                        }`}
                    aria-label="Add 5 minutes"
                >
                    <span className="flex items-center gap-2 text-sm font-medium">
                        <Plus size={16} />
                        5 min
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => addExtraTime(10)}
                    className={`px-4 py-3 rounded-lg glass-effect hover:bg-black/5 hover:dark:bg-white/10 transition-all duration-200 cursor-pointer shadow-lg ${!isMounted
                        ? 'text-slate-700 bg-black/5 border border-black/10'
                        : isDarkMode
                            ? 'text-white bg-white/5 border border-white/10'
                            : 'text-slate-700 bg-black/5 border border-black/10'
                        }`}
                    aria-label="Add 10 minutes"
                >
                    <span className="flex items-center gap-2 text-sm font-medium">
                        <Plus size={16} />
                        10 min
                    </span>
                </button>
            </div>
        </div>
    )
}

// Loading component with better styling
function TimerLoading() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white text-lg font-medium">Loading timer...</p>
            </div>
        </div>
    )
}

// Main page component with Suspense boundary
export default function TimerPage() {
    return (
        <Suspense fallback={<TimerLoading />}>
            <TimerContent />
        </Suspense>
    )
}
