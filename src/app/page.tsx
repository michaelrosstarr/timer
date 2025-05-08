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
  dateTime: z.string().refine((date) => {
    // Ensure the date is in the future
    const selectedDate = new Date(date).getTime()
    const currentDate = new Date().getTime()
    return selectedDate > currentDate
  }, { message: "Date/time must be in the future" })
})

// Define TypeScript type based on the schema
type FormValues = z.infer<typeof formSchema>

export default function Home() {
  const router = useRouter()

  // Get current date and time formatted for min attribute
  const getCurrentDateTime = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
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
      dateTime: ""
    }
  })

  // Watch the dateTime value for real-time access
  const watchedDateTime = watch("dateTime")

  const handleCopyLink = () => {
    // Use handleSubmit from react-hook-form to validate before processing
    handleSubmit(
      (data) => {
        // Make title parameter optional by only including it if it exists
        const titleParam = data.title ? `&title=${encodeURIComponent(data.title)}` : ""
        const url = `${window.location.origin}/timer?dateTime=${encodeURIComponent(data.dateTime)}${titleParam}`
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
        if (formErrors.dateTime) {
          toast.custom((t) => (
            <div className={t.visible ? 'animate-enter' : 'animate-leave'}>
              <div role="alert" className="alert alert-error">
                <Timer className="w-6 h-6" />
                <span>{formErrors.dateTime?.message || "Invalid date"}</span>
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
        const titleParam = data.title ? `&title=${encodeURIComponent(data.title)}` : ""
        router.push(`/timer?dateTime=${encodeURIComponent(data.dateTime)}${titleParam}`)
      },
      (formErrors) => {
        if (formErrors.dateTime) {
          toast.custom((t) => (
            <div className={t.visible ? 'animate-enter' : 'animate-leave'}>
              <div role="alert" className="alert alert-error">
                <Timer className="w-6 h-6" />
                <span>{formErrors.dateTime?.message || "Invalid date"}</span>
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
                <span className="label-text">Target Date & Time</span>
              </label>
              <input
                type="datetime-local"
                className={`input input-bordered w-full ${errors.dateTime ? 'input-error' : ''}`}
                min={getCurrentDateTime()}
                {...register("dateTime")}
              />
              {errors.dateTime && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.dateTime.message}</span>
                </label>
              )}
            </div>

            <div className="card-actions justify-between mt-6">
              <button
                type="button"
                className="btn btn-outline btn-primary"
                onClick={handleCopyLink}
                disabled={!watchedDateTime}
              >
                <Link className="w-4 h-4" />
                Copy Link
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGoToTimer}
                disabled={!watchedDateTime}
              >
                <TimerIcon className="w-4 h-4" />
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
