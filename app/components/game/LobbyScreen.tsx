'use client'

import { useAccount } from 'wagmi'
import { Users, Trophy, Timer } from 'lucide-react'

interface LobbyScreenProps {
  playersReady: number
  totalJackpot: number
  secondsToStart: number
  onStart: () => void
}

export const LobbyScreen = ({
  playersReady,
  totalJackpot,
  secondsToStart,
  onStart,
}: LobbyScreenProps) => {
  const { address } = useAccount()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Title */}
      <h1 className="text-8xl font-pixel neon-text mb-4">MIRROR PIT</h1>

      <div className="text-center space-y-2 mb-12">
        <div className="font-pixel text-neon-green text-lg">
          &gt; REAL-TIME PVP SURVIVAL GAME &lt;
        </div>
        <div className="font-pixel text-neon-green text-lg">
          &gt; UNIQUE PATTERNS OR ELIMINATION &lt;
        </div>
        <div className="font-pixel text-yellow-400 text-lg">
          &gt; LAST PLAYER WINS JACKPOT &lt;
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        <div className="game-card p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-2" />
          <div className="text-4xl font-pixel text-neon-green mb-1">
            {playersReady}
          </div>
          <div className="text-sm font-pixel text-neon-green/70">
            PLAYERS_READY
          </div>
        </div>

        <div className="game-card p-6 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
          <div className="text-4xl font-pixel text-yellow-400 mb-1">
            ${totalJackpot}
          </div>
          <div className="text-sm font-pixel text-yellow-400/70">
            TOTAL_JACKPOT
          </div>
        </div>

        <div className="game-card p-6 text-center">
          <Timer className="w-8 h-8 mx-auto mb-2" />
          <div className="text-4xl font-pixel text-neon-green mb-1">
            {secondsToStart}
          </div>
          <div className="text-sm font-pixel text-neon-green/70">
            SECONDS_TO_START
          </div>
        </div>
      </div>

      {/* Join Button */}
      <button
        onClick={onStart}
        disabled={!address}
        className={`
          font-pixel text-xl px-16 py-4
          ${
            address
              ? 'bg-neon-green text-black hover:bg-neon-green/90'
              : 'border border-neon-green/50 text-neon-green/50 cursor-not-allowed'
          }
        `}
      >
        [ENTER_THE_PIT]
      </button>

      <div className="mt-4 font-pixel text-neon-green/70 text-sm">
        &gt; ENTRY_FEE: 10_TOKENS &lt;
      </div>
    </div>
  )
}
