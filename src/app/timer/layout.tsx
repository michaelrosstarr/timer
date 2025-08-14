import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Live Countdown Timer - Full Screen Timer Display',
    description: 'Countdown timer with progress tracking, wake lock support, and responsive design.',
    keywords: 'countdown timer, live timer, fullscreen timer, event countdown, timer display',
    openGraph: {
        title: 'Live Countdown Timer',
        description: 'Countdown timer with progress tracking and wake lock support.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Live Countdown Timer',
        description: 'Countdown timer with progress tracking and wake lock support.',
    },
    robots: {
        index: false, // Timer pages shouldn't be indexed as they're dynamic
        follow: true,
    },
}

export default function TimerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
        </>
    )
}