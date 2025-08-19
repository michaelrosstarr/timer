"use client"

import { useRouter } from "next/navigation"
import { Clock, Link, Timer, Moon, Sun, Sparkles, Play, Settings } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect } from "react"

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().optional(),
  timerMode: z.enum(["target-time", "duration"]),
  time: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute").optional(),
  hideDate: z.boolean()
}).refine((data) => {
  if (data.timerMode === "target-time") {
    return data.time && data.time.length > 0
  } else {
    return data.duration && data.duration > 0
  }
}, {
  message: "Please provide either a target time or duration",
  path: ["time"] // This will show the error on the time field
})

// Define TypeScript type based on the schema
type FormValues = z.infer<typeof formSchema>

export default function Home() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  // Helper function to convert time string to full DateTime
  const timeToDateTime = (timeStr: string): string => {
    const now = new Date()
    const [hours, minutes] = timeStr.split(':').map(Number)

    // Create date object for today with the selected time
    const dateTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    )

    // If the time is earlier today, set it to tomorrow
    if (dateTime.getTime() <= now.getTime()) {
      dateTime.setDate(dateTime.getDate() + 1)
    }

    return dateTime.toISOString()
  }

  // Helper function to convert duration to DateTime
  const durationToDateTime = (durationMinutes: number): string => {
    const now = new Date()
    const targetTime = new Date(now.getTime() + (durationMinutes * 60 * 1000))
    return targetTime.toISOString()
  }

  // Set up React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      timerMode: "target-time" as const,
      time: "",
      duration: undefined,
      hideDate: false
    }
  })

  // Watch the form values for real-time access
  const watchedTime = watch("time")
  const watchedTitle = watch("title")
  const watchedTimerMode = watch("timerMode")
  const watchedDuration = watch("duration")

  const getTargetTimePreview = () => {
    if (watchedTimerMode === "target-time" && watchedTime) {
      try {
        const dateTimeStr = timeToDateTime(watchedTime)
        const target = new Date(dateTimeStr)
        const now = new Date()

        const isToday = target.toDateString() === now.toDateString()
        const isTomorrow = target.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()

        let dayText = ""
        if (isToday) dayText = "Today"
        else if (isTomorrow) dayText = "Tomorrow"
        else dayText = target.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

        const timeText = target.toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })

        return `${dayText} at ${timeText}`
      } catch {
        return ""
      }
    } else if (watchedTimerMode === "duration" && watchedDuration) {
      const hours = Math.floor(watchedDuration / 60)
      const minutes = watchedDuration % 60
      
      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m from now` : `${hours}h from now`
      } else {
        return `${minutes}m from now`
      }
    }
    return ""
  }

  const handleCopyLink = () => {
    setIsLoading(true)
    // Use handleSubmit from react-hook-form to validate before processing
    handleSubmit(
      (data) => {
        // Convert time to a full datetime based on mode
        let dateTimeStr: string
        if (data.timerMode === "target-time" && data.time) {
          dateTimeStr = timeToDateTime(data.time)
        } else if (data.timerMode === "duration" && data.duration) {
          dateTimeStr = durationToDateTime(data.duration)
        } else {
          setIsLoading(false)
          return
        }
        
        const startTimeStr = new Date().toISOString()

        // Make title parameter optional by only including it if it exists
        const titleParam = data.title ? `&title=${encodeURIComponent(data.title)}` : ""
        const hideDateParam = data.hideDate ? `&hideDate=true` : ""
        const url = `${window.location.origin}/timer?dateTime=${encodeURIComponent(dateTimeStr)}&startTime=${encodeURIComponent(startTimeStr)}${titleParam}${hideDateParam}`
        navigator.clipboard.writeText(url)

        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} transform transition-all duration-300`}>
            <div className={`alert shadow-lg ${!isMounted
              ? 'bg-white text-gray-800 border-gray-200' // Default to light mode
              : isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-500 text-white mr-3">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Link copied!</h3>
                  <div className="text-sm opacity-80">Timer link has been copied to clipboard</div>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 3000 })

        setIsLoading(false)
      },
      (formErrors) => {
        if (formErrors.time) {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} transform transition-all duration-300`}>
              <div className={`alert alert-error shadow-lg ${isDarkMode ? 'bg-red-900 text-white border-red-800' : 'bg-red-50 text-red-800 border-red-200'}`}>
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-red-500 text-white mr-3">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Invalid input</h3>
                    <div className="text-sm opacity-80">{formErrors.time?.message || "Please provide valid timer input"}</div>
                  </div>
                </div>
              </div>
            </div>
          ), { duration: 4000 })
        }
        setIsLoading(false)
      }
    )()
  }

  const handleGoToTimer = () => {
    setIsLoading(true)
    // Use handleSubmit from react-hook-form to validate before processing
    handleSubmit(
      (data) => {
        // Convert time to a full datetime based on mode
        let dateTimeStr: string
        if (data.timerMode === "target-time" && data.time) {
          dateTimeStr = timeToDateTime(data.time)
        } else if (data.timerMode === "duration" && data.duration) {
          dateTimeStr = durationToDateTime(data.duration)
        } else {
          setIsLoading(false)
          return
        }
        
        const startTimeStr = new Date().toISOString()

        const titleParam = data.title ? `&title=${encodeURIComponent(data.title)}` : ""
        const hideDateParam = data.hideDate ? `&hideDate=true` : ""
        router.push(`/timer?dateTime=${encodeURIComponent(dateTimeStr)}&startTime=${encodeURIComponent(startTimeStr)}${titleParam}${hideDateParam}`)
      },
      (formErrors) => {
        if (formErrors.time) {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} transform transition-all duration-300`}>
              <div className={`alert alert-error shadow-lg ${isDarkMode ? 'bg-red-900 text-white border-red-800' : 'bg-red-50 text-red-800 border-red-200'}`}>
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-red-500 text-white mr-3">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Invalid input</h3>
                    <div className="text-sm opacity-80">{formErrors.time?.message || "Please provide valid timer input"}</div>
                  </div>
                </div>
              </div>
            </div>
          ), { duration: 4000 })
        }
        setIsLoading(false)
      }
    )()
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${!isMounted
      ? 'bg-white' // Default to light mode during SSR
      : isDarkMode
        ? 'bg-slate-900'
        : 'bg-white'
      } flex flex-col items-center justify-center p-4 relative`}>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-3 rounded-lg glass-effect hover:bg-black/5 hover:dark:bg-white/10 transition-all duration-200 ${!isMounted
          ? 'text-slate-700 bg-black/5 border border-black/10' // Default to light mode
          : isDarkMode
            ? 'text-white bg-white/5 border border-white/10'
            : 'text-slate-700 bg-black/5 border border-black/10'
          }`}
        aria-label="Toggle theme"
      >
        {!isMounted ? <Moon size={24} /> : isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Main Card */}
        <div className={`card shadow-xl backdrop-blur-sm border transition-all duration-300 ${!isMounted
          ? 'bg-white/80 border-black/10' // Default to light mode
          : isDarkMode
            ? 'bg-white/5 border-white/10'
            : 'bg-white/80 border-black/10'
          }`}>
          <div className="card-body p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${!isMounted
                ? 'bg-blue-600' // Default to light mode
                : isDarkMode
                  ? 'bg-blue-500'
                  : 'bg-blue-600'
                }`}>
                <Timer className="w-8 h-8 text-white" />
              </div>
              <h1 className={`text-3xl font-bold mb-2 ${!isMounted
                ? 'text-slate-800' // Default to light mode
                : isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                Countdown Timer
              </h1>
              <p className={`text-sm ${!isMounted
                ? 'text-slate-600' // Default to light mode
                : isDarkMode ? 'text-white/70' : 'text-slate-600'
                }`}>
                Create beautiful countdown timers for any event
              </p>
            </div>

            <form className="space-y-6">
              {/* Event Title */}
              <div className="form-control">
                <label className={`label ${!isMounted
                  ? 'text-slate-700' // Default to light mode
                  : isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                  <span className="label-text flex items-center gap-2">
                    <Sparkles size={16} />
                    Event Title
                  </span>
                  <span className="label-text-alt text-xs opacity-60">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="New Year's Eve, Meeting, Birthday..."
                  className={`input input-bordered w-full transition-all duration-300 ${!isMounted
                    ? 'bg-white/80 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-purple-400' // Default to light mode
                    : isDarkMode
                      ? 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-400'
                      : 'bg-white/80 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-purple-400'
                    } ${watchedTitle ? 'ring-2 ring-purple-400/20' : ''}`}
                  {...register("title")}
                />
              </div>

              {/* Timer Mode Selection */}
              <div className="form-control">
                <label className={`label ${!isMounted
                  ? 'text-slate-700' // Default to light mode
                  : isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                  <span className="label-text flex items-center gap-2">
                    <Timer size={16} />
                    Timer Type
                  </span>
                </label>
                <div className="flex gap-4">
                  <label className={`label cursor-pointer flex-1 justify-start gap-3 p-3 rounded-lg border transition-all duration-300 ${watchedTimerMode === 'target-time' 
                    ? (isDarkMode ? 'border-purple-400 bg-purple-400/10' : 'border-purple-400 bg-purple-50')
                    : (isDarkMode ? 'border-white/20 hover:border-white/30' : 'border-slate-200 hover:border-slate-300')
                    }`}>
                    <input 
                      type="radio" 
                      value="target-time"
                      className="radio radio-primary" 
                      {...register("timerMode")}
                    />
                    <span className={`label-text ${!isMounted
                      ? 'text-slate-700' // Default to light mode
                      : isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>Target Time</span>
                  </label>
                  <label className={`label cursor-pointer flex-1 justify-start gap-3 p-3 rounded-lg border transition-all duration-300 ${watchedTimerMode === 'duration' 
                    ? (isDarkMode ? 'border-purple-400 bg-purple-400/10' : 'border-purple-400 bg-purple-50')
                    : (isDarkMode ? 'border-white/20 hover:border-white/30' : 'border-slate-200 hover:border-slate-300')
                    }`}>
                    <input 
                      type="radio" 
                      value="duration"
                      className="radio radio-primary" 
                      {...register("timerMode")}
                    />
                    <span className={`label-text ${!isMounted
                      ? 'text-slate-700' // Default to light mode
                      : isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>Duration</span>
                  </label>
                </div>
              </div>

              {/* Target Time - shown only when target-time mode is selected */}
              {watchedTimerMode === 'target-time' && (
                <div className="form-control">
                  <label className={`label ${!isMounted
                    ? 'text-slate-700' // Default to light mode
                    : isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                    <span className="label-text flex items-center gap-2">
                      <Clock size={16} />
                      Target Time
                    </span>
                    <span className="label-text-alt text-xs opacity-60">Required</span>
                  </label>
                  <input
                    type="time"
                    className={`input input-bordered w-full transition-all duration-300 ${!isMounted
                      ? 'bg-white/80 border-slate-200 text-slate-800 focus:border-purple-400' // Default to light mode
                      : isDarkMode
                        ? 'bg-white/10 border-white/20 text-white focus:border-purple-400'
                        : 'bg-white/80 border-slate-200 text-slate-800 focus:border-purple-400'
                      } ${errors.time ? 'border-red-400 focus:border-red-400' : ''} ${watchedTime ? 'ring-2 ring-purple-400/20' : ''
                      }`}
                    {...register("time")}
                  />
                  {errors.time && (
                    <label className="label">
                      <span className="label-text-alt text-red-400 text-sm">{errors.time.message}</span>
                    </label>
                  )}
                  {watchedTime && !errors.time && (
                    <label className="label">
                      <span className={`label-text-alt text-sm ${!isMounted
                        ? 'text-purple-600' // Default to light mode
                        : isDarkMode ? 'text-purple-300' : 'text-purple-600'
                        }`}>
                        {getTargetTimePreview()}
                      </span>
                    </label>
                  )}
                </div>
              )}

              {/* Duration - shown only when duration mode is selected */}
              {watchedTimerMode === 'duration' && (
                <div className="form-control">
                  <label className={`label ${!isMounted
                    ? 'text-slate-700' // Default to light mode
                    : isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                    <span className="label-text flex items-center gap-2">
                      <Clock size={16} />
                      Duration (minutes)
                    </span>
                    <span className="label-text-alt text-xs opacity-60">Required</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10080" // 7 days in minutes
                    placeholder="e.g., 25, 60, 90..."
                    className={`input input-bordered w-full transition-all duration-300 ${!isMounted
                      ? 'bg-white/80 border-slate-200 text-slate-800 focus:border-purple-400' // Default to light mode
                      : isDarkMode
                        ? 'bg-white/10 border-white/20 text-white focus:border-purple-400'
                        : 'bg-white/80 border-slate-200 text-slate-800 focus:border-purple-400'
                      } ${errors.duration ? 'border-red-400 focus:border-red-400' : ''} ${watchedDuration ? 'ring-2 ring-purple-400/20' : ''
                      }`}
                    {...register("duration", { valueAsNumber: true })}
                  />
                  {errors.duration && (
                    <label className="label">
                      <span className="label-text-alt text-red-400 text-sm">{errors.duration.message}</span>
                    </label>
                  )}
                  {watchedDuration && !errors.duration && (
                    <label className="label">
                      <span className={`label-text-alt text-sm ${!isMounted
                        ? 'text-purple-600' // Default to light mode
                        : isDarkMode ? 'text-purple-300' : 'text-purple-600'
                        }`}>
                        {getTargetTimePreview()}
                      </span>
                    </label>
                  )}
                </div>
              )}

              {/* Settings Dropdown */}
              <div className="form-control">
                <details className={`dropdown dropdown-top w-full ${!isMounted
                  ? 'text-slate-700' // Default to light mode
                  : isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                  <summary className={`btn btn-outline w-full justify-between transition-all duration-300 ${!isMounted
                    ? 'border-slate-200 text-slate-700 hover:bg-slate-50' // Default to light mode
                    : isDarkMode
                      ? 'border-white/30 text-white hover:bg-white/10'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}>
                    <span className="flex items-center gap-2">
                      <Settings size={16} />
                      Timer Options
                    </span>
                  </summary>
                  <div className={`dropdown-content p-4 shadow-lg rounded-lg mt-2 w-full ${!isMounted
                    ? 'bg-white border border-slate-200' // Default to light mode
                    : isDarkMode
                      ? 'bg-slate-800 border border-white/10'
                      : 'bg-white border border-slate-200'
                    }`}>
                    <div className="form-control">
                      <label className={`label cursor-pointer justify-start gap-3 ${!isMounted
                        ? 'text-slate-700' // Default to light mode
                        : isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-primary" 
                          {...register("hideDate")}
                        />
                        <span className="label-text">Hide date display</span>
                      </label>
                    </div>
                  </div>
                </details>
              </div>              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  className={`btn flex-1 transition-all duration-200 ${!isMounted
                    ? 'btn-outline border-slate-300 text-slate-700 hover:bg-slate-50' // Default to light mode
                    : isDarkMode
                      ? 'btn-outline border-white/30 text-white hover:bg-white/10'
                      : 'btn-outline border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  onClick={handleCopyLink}
                  disabled={!((watchedTimerMode === 'target-time' && watchedTime) || (watchedTimerMode === 'duration' && watchedDuration)) || isLoading}
                >
                  <Link className="w-4 h-4" />
                  Copy Link
                </button>
                <button
                  type="button"
                  className={`btn btn-primary flex-1 transition-all duration-200 ${!isMounted
                    ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700' // Default to light mode
                    : isDarkMode
                      ? 'bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600'
                      : 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700'
                    } ${isLoading ? 'loading' : ''}`}
                  onClick={handleGoToTimer}
                  disabled={!((watchedTimerMode === 'target-time' && watchedTime) || (watchedTimerMode === 'duration' && watchedDuration)) || isLoading}
                >
                  {!isLoading && <Play className="w-4 h-4" />}
                  Start Timer
                </button>
              </div>
            </form>

            {/* Features */}
            <div className={`mt-8 pt-6 border-t ${!isMounted
              ? 'border-slate-200' // Default to light mode
              : isDarkMode ? 'border-white/10' : 'border-slate-200'
              }`}>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className={`text-sm font-medium ${!isMounted
                    ? 'text-slate-700' // Default to light mode
                    : isDarkMode ? 'text-white/90' : 'text-slate-700'
                    }`}>
                    Fullscreen Mode
                  </div>
                  <div className={`text-xs ${!isMounted
                    ? 'text-slate-500' // Default to light mode
                    : isDarkMode ? 'text-white/60' : 'text-slate-500'
                    }`}>
                    Distraction-free viewing
                  </div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${!isMounted
                    ? 'text-slate-700' // Default to light mode
                    : isDarkMode ? 'text-white/90' : 'text-slate-700'
                    }`}>
                    Screen Wake Lock
                  </div>
                  <div className={`text-xs ${!isMounted
                    ? 'text-slate-500' // Default to light mode
                    : isDarkMode ? 'text-white/60' : 'text-slate-500'
                    }`}>
                    Keeps screen active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster
        position="top-center"
        containerStyle={{
          top: 80,
        }}
      />
    </div>
  )
}
