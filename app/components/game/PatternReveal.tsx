'use client'

import { useEffect } from 'react'
import { useGameState } from '../ReactTogetherWrapper'
import { GameState, GameAction, GAME_ACTIONS } from '@/app/types/game'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Zap,
  Skull,
} from 'lucide-react'

const ACTION_ICONS: Record<GameAction, React.ReactNode> = {
  L: <ArrowLeft className="w-4 h-4" />,
  R: <ArrowRight className="w-4 h-4" />,
  J: <ArrowUp className="w-4 h-4" />,
  S: <RotateCw className="w-4 h-4" />,
  T: <Zap className="w-4 h-4" />,
}

interface PatternRevealProps {
  state: GameState
  playerAddress: string
}

export const PatternReveal = ({ state, playerAddress }: PatternRevealProps) => {
  const { setState: broadcast } = useGameState()
  const player = state.players[playerAddress]

  useEffect(() => {
    if (
      state.phase === 'reveal' &&
      player?.patternHash &&
      !player.revealedPattern
    ) {
      // In a real implementation, we would verify the hash matches
      // For now, we'll just reveal the pattern directly
      const pattern = player.patternHash.split('') as GameAction[]

      broadcast({
        ...state,
        players: {
          ...state.players,
          [playerAddress]: {
            ...player,
            revealedPattern: pattern,
          },
        },
      })
    }
  }, [state.phase, player, playerAddress, broadcast])

  if (!player || player.isEliminated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="font-pixel text-destructive text-2xl animate-blink">
          <Skull className="w-12 h-12 mx-auto mb-4" />
          &gt; YOU_ARE_ELIMINATED &lt;
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Pattern Display */}
      <div className="retro-border bg-card/80 backdrop-blur-sm p-6 w-full max-w-md">
        <div className="font-pixel text-xs text-muted-foreground mb-4">
          YOUR_PATTERN:
        </div>
        <div className="grid grid-cols-5 gap-2">
          {(player.revealedPattern || []).map((action, i) => (
            <div
              key={i}
              className="aspect-square retro-border bg-background/50 flex items-center justify-center"
            >
              <div className="text-primary animate-pixel-jump">
                {ACTION_ICONS[action]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Players */}
      <div className="w-full max-w-2xl">
        <div className="font-pixel text-xs text-muted-foreground mb-4">
          REVEALED_PATTERNS:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(state.players)
            .filter(([addr]) => addr !== playerAddress)
            .map(([addr, p]) => (
              <div
                key={addr}
                className={`retro-border p-4 ${
                  p.isEliminated
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-card/80 text-primary'
                }`}
              >
                <div className="font-pixel text-xs mb-2">{p.name}</div>
                {p.revealedPattern ? (
                  <div className="flex space-x-1">
                    {p.revealedPattern.map((action, i) => (
                      <div key={i} className="text-xs">
                        {ACTION_ICONS[action]}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs animate-pulse">REVEALING...</div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
