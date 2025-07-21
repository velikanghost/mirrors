'use client'

import { ReactTogether, useConnectedUsers } from 'react-together'
import { useSearchParams } from 'next/navigation'
import { ConnectButton } from './ui/ConnectButton'

interface ReactTogetherWrapperProps {
  children: React.ReactNode
}

export default function ReactTogetherWrapper({
  children,
}: ReactTogetherWrapperProps) {
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room') || 'default'

  const sessionParams = {
    appId: process.env.NEXT_PUBLIC_DEFAULT_APP_ID || '',
    apiKey: process.env.NEXT_PUBLIC_MULTISYNQ_API_KEY || '',
    name: roomCode,
    password: process.env.NEXT_PUBLIC_DEFAULT_SESSION_PASSWORD || '',
  }

  return (
    <ReactTogether sessionParams={sessionParams} rememberUsers={true}>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="relative z-10 glass border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"></div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">
                    Mirror Pit
                  </h1>
                  <p className="text-xs text-text-subtle">Room: {roomCode}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <ConnectedUsersDisplay />
                <ConnectButton />
              </div>
            </div>
          </div>
        </nav>

        <main className="relative z-10">{children}</main>
      </div>
    </ReactTogether>
  )
}

function ConnectedUsersDisplay() {
  const connectedUsers = useConnectedUsers()

  if (!connectedUsers || connectedUsers.length === 0) return null

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-text-muted">
          {connectedUsers.length} user{connectedUsers.length !== 1 ? 's' : ''}{' '}
          online
        </span>
      </div>
    </div>
  )
}
