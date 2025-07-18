'use client'

import { useAccount } from 'wagmi'
import { LobbyScreenProps } from '@/app/types/game'

export const LobbyScreen = ({ onStart }: LobbyScreenProps) => {
  const { address } = useAccount()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="font-pixel text-accent text-lg animate-blink max-w-2xl mx-auto">
          &gt; WAITING FOR PLAYERS TO JOIN &lt;
          <br />
          &gt; MINIMUM 2 PLAYERS REQUIRED &lt;
          <br />
          &gt; MAXIMUM 8 PLAYERS ALLOWED &lt;
        </div>
      </div>

      {/* Entry Fee Info */}
      <div className="retro-border bg-card/80 backdrop-blur-sm p-8 max-w-md mx-auto text-center">
        <div className="text-xl font-pixel text-primary mb-4">ENTRY FEE</div>
        <div className="text-4xl font-retro text-accent animate-retro-glow mb-2">
          0.01 ETH
        </div>
        <div className="text-sm font-pixel text-muted-foreground">
          Winners split the prize pool equally
        </div>
      </div>

      {/* Join Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onStart}
          disabled={!address}
          className={`
            retro-border font-pixel uppercase tracking-wider px-12 py-4
            ${
              address
                ? 'bg-primary/20 text-primary hover:bg-primary hover:text-background animate-retro-bounce'
                : 'bg-destructive/20 text-destructive cursor-not-allowed'
            }
          `}
        >
          {address ? 'JOIN GAME' : 'CONNECT WALLET TO JOIN'}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-12 text-center font-pixel text-sm text-muted-foreground space-y-2">
        <div>&gt; Submit unique patterns each round &lt;</div>
        <div>&gt; Mirror another pattern = elimination &lt;</div>
        <div>&gt; Last player standing wins &lt;</div>
      </div>
    </div>
  )
}
