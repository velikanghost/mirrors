'use client'

import { useEffect, useState } from 'react'
import { useConnectedUsers } from 'react-together'
import { GameState, GameAction } from '@/app/types/game'
import { Clock } from 'lucide-react'

const ROUND_DURATION = 30 // seconds
const REVEAL_DURATION = 10 // seconds

interface RoundManagerProps {
  state: GameState
  onStateChange: (newState: GameState) => void
}

export const RoundManager = ({ state, onStateChange }: RoundManagerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const connectedUsers = useConnectedUsers()

  // Handle round timers and phase transitions
  useEffect(() => {
    if (!state) return

    let timer: NodeJS.Timeout

    if (state.phase === 'lobby' && Object.keys(state.players).length >= 2) {
      // Start game when we have enough players
      timer = setTimeout(() => {
        onStateChange({
          ...state,
          phase: 'pattern_submission',
          round: 1,
          roundEndTime: Date.now() + ROUND_DURATION * 1000,
        })
      }, 3000)
    } else if (state.phase === 'pattern_submission' && state.roundEndTime) {
      // Update countdown
      const interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.ceil((state.roundEndTime! - Date.now()) / 1000),
        )
        setTimeLeft(remaining)

        // Time's up - move to reveal phase
        if (remaining === 0) {
          onStateChange({
            ...state,
            phase: 'reveal',
            roundEndTime: Date.now() + REVEAL_DURATION * 1000,
          })
        }
      }, 1000)

      return () => clearInterval(interval)
    } else if (state.phase === 'reveal' && state.roundEndTime) {
      // Update reveal countdown
      const interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.ceil((state.roundEndTime! - Date.now()) / 1000),
        )
        setTimeLeft(remaining)

        // Time's up - process eliminations
        if (remaining === 0) {
          const patterns: Record<string, string> = {}
          const eliminated: string[] = []

          // Collect all patterns
          Object.entries(state.players).forEach(([addr, player]) => {
            if (!player.isEliminated && player.revealedPattern) {
              const patternKey = player.revealedPattern.join('')
              if (patterns[patternKey]) {
                eliminated.push(addr, patterns[patternKey])
              } else {
                patterns[patternKey] = addr
              }
            }
          })

          // Update eliminated players
          const newPlayers = { ...state.players }
          eliminated.forEach((addr) => {
            newPlayers[addr] = {
              ...newPlayers[addr],
              isEliminated: true,
            }
          })

          // Start next round or end game
          const playersAlive = Object.values(newPlayers).filter(
            (p) => !p.isEliminated,
          ).length

          if (playersAlive <= 1) {
            onStateChange({
              ...state,
              phase: 'victory',
              players: newPlayers,
            })
          } else {
            onStateChange({
              ...state,
              phase: 'pattern_submission',
              round: state.round + 1,
              roundEndTime: Date.now() + ROUND_DURATION * 1000,
              players: newPlayers,
            })
          }
        }
      }, 1000)

      return () => clearInterval(interval)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [state, onStateChange])

  if (!state || state.phase === 'lobby' || state.phase === 'victory')
    return null

  return (
    <div className="fixed top-20 right-4 retro-border bg-card/80 backdrop-blur-sm p-4 w-64">
      <div className="flex items-center justify-between">
        <div className="font-pixel text-xs text-muted-foreground">
          TIME_REMAINING
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-pixel text-primary">{timeLeft}s</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted/20 h-2 retro-border mt-2">
        <div
          className="h-full bg-gradient-retro transition-all duration-1000"
          style={{
            width: `${
              (timeLeft /
                (state.phase === 'reveal' ? REVEAL_DURATION : ROUND_DURATION)) *
              100
            }%`,
          }}
        />
      </div>
    </div>
  )
}
