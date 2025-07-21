'use client'

import LobbySystem from './components/LobbySystem'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-8xl font-pixel neon-text mb-4">MIRROR PIT</h1>

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

      <div className="w-full">
        <LobbySystem />
      </div>
    </div>
  )
}
