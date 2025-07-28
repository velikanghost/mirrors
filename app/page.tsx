'use client'

import { useState } from 'react'
import LobbySystem from './components/LobbySystem'

export default function Home() {
  const [activeLobby, setActiveLobby] = useState<string | null>(null)
  const handleActiveLobbyChange = (lobbyId: string | null) => {
    setActiveLobby(lobbyId)
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {!activeLobby && (
        <h1 className="text-8xl font-pixel neon-text mb-4">MIRROR PIT</h1>
      )}

      {!activeLobby && (
        <div className="text-center space-y-2 mb-12">
          <div className="font-pixel text-neon text-lg">
            &gt; REAL-TIME PVP SURVIVAL GAME &lt;
          </div>
          <div className="font-pixel text-neon text-lg">
            &gt; UNIQUE PATTERNS OR ELIMINATION &lt;
          </div>
          <div className="font-pixel text-yellow text-lg">
            &gt; LAST PLAYER WINS JACKPOT &lt;
          </div>
        </div>
      )}

      <div className="w-full">
        <LobbySystem onActiveLobbyChange={handleActiveLobbyChange} />
      </div>
    </div>
  )
}
