'use client'

import { Trophy } from 'lucide-react'
import { GameState } from '@/app/types/game'

interface VictoryScreenProps {
  state: GameState
  onPlayAgain: () => void
}

export const VictoryScreen = ({ state, onPlayAgain }: VictoryScreenProps) => {
  const winner = Object.values(state.players).find((p) => !p.isEliminated)

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12">
      <div className="text-center space-y-8">
        <Trophy className="w-24 h-24 text-accent mx-auto animate-retro-bounce" />
        <h1 className="text-6xl font-retro font-black text-primary animate-retro-glow">
          GAME OVER
        </h1>
        {winner && (
          <div className="font-pixel text-accent text-2xl animate-blink">
            &gt; WINNER: {winner.name} &lt;
          </div>
        )}
      </div>

      <div className="space-y-4 text-center">
        <div className="font-pixel text-muted-foreground">
          FINAL_ROUND: {state.round}
        </div>
        <div className="font-pixel text-muted-foreground">
          TOTAL_PLAYERS: {Object.keys(state.players).length}
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        className="retro-border font-pixel uppercase tracking-wider transition-all px-8 py-3
          bg-accent/20 text-accent border-accent
          hover:bg-accent hover:text-background
          animate-retro-bounce"
      >
        PLAY_AGAIN
      </button>
    </div>
  )
}
