'use client'

import { Geist, Geist_Mono, Orbitron, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

const ReactTogetherWrapper = dynamic(
  () => import('./components/ReactTogetherWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    ),
  },
)

const Providers = dynamic(
  () => import('./providers').then((mod) => mod.Providers),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    ),
  },
)

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const orbitron = Orbitron({ variable: '--font-retro', subsets: ['latin'] })
const jetBrains = JetBrains_Mono({
  variable: '--font-pixel',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${jetBrains.variable} antialiased`}
      >
        {/* Background Effects */}
        <div className="scanlines" />
        <div className="grid-bg" />
        <Providers>
          <ReactTogetherWrapper>{children}</ReactTogetherWrapper>
        </Providers>
      </body>
    </html>
  )
}
