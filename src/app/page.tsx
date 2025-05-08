"use client"

import { useRouter } from "next/navigation"
import { Clock, Link, Timer, TimerIcon } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().optional(),
  time: z.string().refine((timeStr) => {
    // Ensure the time is in the future
    if (!timeStr) return false

    const [hours, minutes] = timeStr.split(':').map(Number)

    const selectedTime = new Date()
    selectedTime.setHours(hours, minutes, 0, 0)

    // If the time is earlier today, we'll assume it's for tomorrow
    // This logic is handled in timeToDateTime function, just validate it has a value
    return true
  }, { message: "Please select a time" })
})

// Define TypeScript type based on the schema
type FormValues = z.infer<typeof formSchema>

export default function Home() {
  const router = useRouter()

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
      time: ""
    }
  })

  // Watch the time value for real-time access
  const watchedTime = watch("time")

  const handleCopyLink = () => {
    // Use handleSubmit from react-hook-form to validate before processing
    handleSubmit(
      (data) => {
        // Convert time to a full datetime
        const dateTimeStr = timeToDateTime(data.time)

        // Make title parameter optional by only including it if it exists
        const titleParam = data.title ? `&title=${encodeURIComponent(data.title)}` : ""
        const url = `${window.location.origin}/timer?dateTime=${encodeURIComponent(dateTimeStr)}${titleParam}`
        navigator.clipboard.writeText(url)

        toast.custom((t) => (
          <div className={t.visible ? 'animate-enter' : 'animate-leave'}>
            <div role="alert" className="alert alert-success">
              <Timer className="w-6 h-6" />
              <span>Your timer has been started!</span>
            </div>
          </div>
        ))
      },
      (formErrors) => {
        if (formErrors.time) {
          toast.custom((t) => (
            <div className={t.visible ? 'animate-enter' : 'animate-leave'}>
              <div role="alert" className="alert alert-error">
                <Timer className="w-6 h-6" />
                <span>{formErrors.time?.message || "Please select a time"}</span>
              </div>
            </div>
          ))
        }
      }
    )()
  }

  const handleGoToTimer = () => {
    // Use handleSubmit from react-hook-form to validate before processing
    handleSubmit(
      (data) => {
        // Convert time to a full datetime
        const dateTimeStr = timeToDateTime(data.time)

        const titleParam = data.title ? `&title=${encodeURIComponent(data.title)}` : ""
        router.push(`/timer?dateTime=${encodeURIComponent(dateTimeStr)}${titleParam}`)
      },
      (formErrors) => {
        if (formErrors.time) {
          toast.custom((t) => (
            <div className={t.visible ? 'animate-enter' : 'animate-leave'}>
              <div role="alert" className="alert alert-error">
                <Timer className="w-6 h-6" />
                <span>{formErrors.time?.message || "Please select a time"}</span>
              </div>
            </div>
          ))
        }
      }
    )()
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold text-center mb-6 flex justify-center">
            <Clock className="mr-2" />
            Countdown Timer
          </h1>

          <form>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Event Title</span>
              </label>
              <input
                type="text"
                placeholder="Enter event title"
                className="input input-bordered w-full"
                {...register("title")}
              />
            </div>

            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text">Target Time</span>
                <span className="label-text-alt">Will use today or tomorrow</span>
              </label>
              <input
                type="time"
                className={`input input-bordered w-full ${errors.time ? 'input-error' : ''}`}
                {...register("time")}
              />
              {errors.time && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.time.message}</span>
                </label>
              )}
            </div>

            <div className="card-actions justify-between mt-6">
              <button
                type="button"
                className="btn btn-outline btn-primary"
                onClick={handleCopyLink}
                disabled={!watchedTime}
              >
                <Link className="w-4 h-4 mr-1" />
                Copy Link
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGoToTimer}
                disabled={!watchedTime}
              >
                <TimerIcon className="w-4 h-4 mr-1" />
                Go to Timer Page
              </button>
            </div>
          </form>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}
