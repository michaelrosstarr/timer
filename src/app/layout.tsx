import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Countdown Timer - Beautiful Event Timers with Wake Lock",
  description: "Create stunning countdown timers for events, meetings, and special occasions. Features fullscreen mode, screen wake lock, dark/light themes, and shareable links. Perfect for presentations, events, and time-sensitive activities.",
  keywords: "countdown timer, event timer, fullscreen timer, countdown clock, timer app, wake lock, meeting timer, presentation timer, event countdown, digital timer",
  authors: [{ name: "Michael Rostar" }],
  creator: "Michael Rostar",
  publisher: "Michael Rostar",
  metadataBase: new URL('https://timer-countdown.app'),
  openGraph: {
    title: "Countdown Timer - Beautiful Event Timers",
    description: "Create stunning countdown timers with fullscreen mode, wake lock, and theme switching. Perfect for events, meetings, and presentations.",
    url: "https://timer-countdown.app",
    siteName: "Countdown Timer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Countdown Timer - Beautiful Event Timers",
    description: "Create stunning countdown timers with fullscreen mode, wake lock, and theme switching. Perfect for events, meetings, and presentations.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
