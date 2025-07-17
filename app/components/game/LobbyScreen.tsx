'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Users } from 'lucide-react'

interface LobbyScreenProps {
  onJoin: () => void
  connectedPlayers: number
  isJoined: boolean
}

export const LobbyScreen = ({
  onJoin,
  connectedPlayers,
  isJoined,
}: LobbyScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl">
        <h1 className="text-8xl font-retro font-black text-primary animate-retro-glow">
          MIRROR PIT
        </h1>
        <div className="font-pixel text-accent text-lg animate-blink max-w-2xl mx-auto">
          &gt; REAL-TIME PVP SURVIVAL GAME &lt;
          <br />
          &gt; UNIQUE PATTERNS OR ELIMINATION &lt;
          <br />
          &gt; LAST PLAYER WINS JACKPOT &lt;
        </div>
      </div>

      {/* Player Count Card */}
      <div className="retro-border bg-card/80 backdrop-blur-sm p-6 text-center">
        <Users className="w-8 h-8 text-accent mx-auto mb-3 animate-blink" />
        <div className="text-3xl font-pixel font-bold text-primary">
          {connectedPlayers}
        </div>
        <div className="text-xs font-pixel text-muted-foreground uppercase">
          PLAYERS_READY
        </div>
      </div>

      {/* Join Game Section */}
      <div className="space-y-4">
        {!isJoined ? (
          <>
            <ConnectButton />
            <button
              onClick={onJoin}
              className="retro-border font-pixel uppercase tracking-wider transition-all bg-primary/20 text-primary border-primary hover:bg-primary hover:text-background px-8 py-3 animate-retro-bounce"
            >
              JOIN GAME
            </button>
          </>
        ) : (
          <div className="font-pixel text-success animate-blink">
            &gt; READY_TO_PLAY &lt;
          </div>
        )}
      </div>
    </div>
  )
}
