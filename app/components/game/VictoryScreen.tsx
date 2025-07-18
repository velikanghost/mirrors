'use client'

import { Trophy } from 'lucide-react'
import { VictoryScreenProps } from '@/app/types/game'

export const VictoryScreen = ({
  winners,
  prizePool,
  onPlayAgain,
}: VictoryScreenProps) => {
  return (
    <div className="space-y-12 text-center">
      {/* Victory Title */}
      <div className="space-y-4">
        <Trophy className="w-24 h-24 text-accent mx-auto animate-retro-bounce" />
        <h1 className="text-6xl font-retro font-black text-primary animate-retro-glow">
          VICTORY!
        </h1>
      </div>

      {/* Winners */}
      <div className="retro-border bg-card/80 backdrop-blur-sm p-8 max-w-md mx-auto">
        <div className="text-xl font-pixel text-primary mb-6">WINNERS</div>
        <div className="space-y-4">
          {winners.map((winner, index) => (
            <div
              key={winner}
              className="font-pixel text-accent animate-blink"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {winner.slice(0, 6)}...{winner.slice(-4)}
            </div>
          ))}
        </div>
        <div className="mt-8 text-2xl font-retro text-success animate-retro-glow">
          {(prizePool / winners.length).toFixed(3)} ETH
          <div className="text-sm font-pixel text-muted-foreground mt-2">
            PER WINNER
          </div>
        </div>
      </div>

      {/* Play Again Button */}
      <button
        onClick={onPlayAgain}
        className="retro-border font-pixel uppercase px-12 py-4 bg-primary/20 text-primary hover:bg-primary hover:text-background animate-retro-bounce"
      >
        PLAY AGAIN
      </button>

      {/* Stats */}
      <div className="font-pixel text-sm text-muted-foreground space-y-2">
        <div>TOTAL PRIZE POOL: {prizePool.toFixed(3)} ETH</div>
        <div>WINNERS: {winners.length}</div>
      </div>
    </div>
  )
}
