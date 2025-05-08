"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CircleX, Clock, Timer } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function Home() {
  const [title, setTitle] = useState("")
  const [dateTime, setDateTime] = useState("")
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

  // Helper function to check if date is in the future
  const isDateInFuture = (date: string): boolean => {
    const selectedDate = new Date(date).getTime()
    const currentDate = new Date().getTime()
    return selectedDate > currentDate
  }

  // Handle datetime input change with validation
  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTime = e.target.value
    setDateTime(selectedDateTime)

    // If the date is in the past, show a warning toast
    if (selectedDateTime && !isDateInFuture(selectedDateTime)) {
      toast.custom((t) => (
        <div className={t.visible ? 'animate-enter' : 'animate-leave'}>
          <div role="alert" className="alert alert-warning">
            <CircleX className="w-6 h-6" />
            <span>Selected time is in the past. Please choose a future date/time.</span>
          </div>
        </div>
      ))
    }
  }

  const handleCopyLink = () => {
    if (!dateTime) {
      toast.custom((t) => (
        <div
          className={t.visible ? 'animate-enter' : 'animate-leave'}
        >
          <div role="alert" className="alert alert-error">
            <CircleX className="w-6 h-6" />
            <span>Select a date/time</span>
          </div>
        </div>
      ))
      return;
    }

    // Check if the date is in the future
    if (!isDateInFuture(dateTime)) {
      toast.custom((t) => (
        <div
          className={t.visible ? 'animate-enter' : 'animate-leave'}
        >
          <div role="alert" className="alert alert-error">
            <CircleX className="w-6 h-6" />
            <span>Date/time must be in the future</span>
          </div>
        </div>
      ))
      return;
    }

    // Make title parameter optional by only including it if it exists
    const titleParam = title ? `&title=${encodeURIComponent(title)}` : ""
    const url = `${window.location.origin}/timer?dateTime=${encodeURIComponent(dateTime)}${titleParam}`
    navigator.clipboard.writeText(url)

    toast.custom((t) => (
      <div
        className={t.visible ? 'animate-enter' : 'animate-leave'}
      >
        <div role="alert" className="alert alert-success">
          <Timer className="w-6 h-6" />
          <span>Your timer has been started!</span>
        </div>
      </div>
    ))

  }

  const handleGoToTimer = () => {
    if (!dateTime) {
      toast.custom((t) => (
        <div
          className={t.visible ? 'animate-enter' : 'animate-leave'}
        >
          <div role="alert" className="alert alert-error">
            <CircleX className="w-6 h-6" />
            <span>Select a date/time</span>
          </div>
        </div>
      ))
      return
    }

    // Check if the date is in the future
    if (!isDateInFuture(dateTime)) {
      toast.custom((t) => (
        <div
          className={t.visible ? 'animate-enter' : 'animate-leave'}
        >
          <div role="alert" className="alert alert-error">
            <CircleX className="w-6 h-6" />
            <span>Date/time must be in the future</span>
          </div>
        </div>
      ))
      return;
    }

    const titleParam = title ? `&title=${encodeURIComponent(title)}` : ""
    router.push(`/timer?dateTime=${encodeURIComponent(dateTime)}${titleParam}`)
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold text-center mb-6 flex justify-center">
            <Clock className="mr-2" />
            Countdown Timer
          </h1>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Event Title</span>
            </label>
            <input
              type="text"
              placeholder="Enter event title"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Target Date & Time</span>
            </label>
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={dateTime}
              onChange={handleDateTimeChange}
              min={getCurrentDateTime()} // Set the min attribute to current date/time
            />
            {dateTime && !isDateInFuture(dateTime) && (
              <label className="label">
                <span className="label-text-alt text-error">Please select a future date and time</span>
              </label>
            )}
          </div>

          <div className="card-actions justify-between mt-6">
            <button className="btn btn-outline btn-primary" onClick={handleCopyLink}>
              Copy Link
            </button>
            <button className="btn btn-primary" onClick={handleGoToTimer}>
              Go to Timer Page
            </button>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}
