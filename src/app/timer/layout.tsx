import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Countdown Timer',
    description: 'A simple countdown timer application',
}

export default function TimerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className='bg-white dark:bg-base-100'>
            {children}
        </div>
    )
}