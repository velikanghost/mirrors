'use client'

import { GameState } from '@/app/types/game'

interface GameStatusProps {
  state: GameState
}

export const GameStatus = ({ state }: GameStatusProps) => {
  const survivalRate =
    (state.playersAlive / Object.keys(state.players).length) * 100 || 0

  return (
    <div className="fixed top-4 right-4 space-y-4 w-64">
      {/* Round Info */}
      <div className="retro-border bg-card/80 backdrop-blur-sm p-4">
        <div className="font-pixel text-xs text-muted-foreground">
          ROUND_{state.round}
        </div>
        <div className="text-2xl font-retro text-primary animate-retro-glow">
          {state.phase.toUpperCase()}
        </div>
      </div>

      {/* Player Count */}
      <div className="retro-border bg-card/80 backdrop-blur-sm p-4">
        <div className="font-pixel text-xs text-muted-foreground">
          PLAYERS_ALIVE: {state.playersAlive}
        </div>
        <div className="w-full bg-muted/20 h-2 retro-border mt-2">
          <div
            className="h-full bg-gradient-retro transition-all duration-1000"
            style={{ width: `${survivalRate}%` }}
          />
        </div>
      </div>

      {/* Game Mode Indicators */}
      {state.isGhostMode && (
        <div className="retro-border bg-ghost/20 backdrop-blur-sm p-4">
          <div className="text-xs font-pixel text-ghost animate-blink">
            &gt; GHOST_MODE_ACTIVE - BEWARE_THE_DEAD
          </div>
        </div>
      )}

      {state.isSuddenDeath && (
        <div className="retro-border bg-destructive/20 backdrop-blur-sm p-4">
          <div className="text-xs font-pixel text-destructive animate-retro-glow">
            &gt; SUDDEN_DEATH - FINAL_MOMENTS
          </div>
        </div>
      )}
    </div>
  )
}
