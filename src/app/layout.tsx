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
  title: "Beautiful Countdown Timer - Create Stunning Event Timers",
  description: "Create beautiful, fullscreen countdown timers for any event. Features include wake lock, responsive design, and shareable links.",
  keywords: "countdown timer, event timer, fullscreen timer, countdown clock, timer app",
  authors: [{ name: "Timer App" }],
  creator: "Timer App",
  publisher: "Timer App",
  metadataBase: new URL('https://timer.app'),
  openGraph: {
    title: "Beautiful Countdown Timer",
    description: "Create stunning countdown timers for any event with fullscreen mode and wake lock support.",
    url: "https://timer.app",
    siteName: "Timer App",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beautiful Countdown Timer",
    description: "Create stunning countdown timers for any event with fullscreen mode and wake lock support.",
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
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
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
