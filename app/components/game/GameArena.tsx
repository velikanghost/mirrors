'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  RotateCw,
} from 'lucide-react'
import { GamePhase } from '@/app/types/game'
import { LobbyScreen } from './LobbyScreen'
import { PatternSubmission } from './PatternSubmission'
import { GameStatus } from './GameStatus'
import { VictoryScreen } from './VictoryScreen'

export const GameArena = () => {
  // Game state management
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby')
  const [currentRound, setCurrentRound] = useState(1)
  const [playersAlive, setPlayersAlive] = useState(0)
  const [isGhostMode, setIsGhostMode] = useState(false)
  const [isSuddenDeath, setIsSuddenDeath] = useState(false)
  const [patternLength, setPatternLength] = useState(4)
  const [availableActions, setAvailableActions] = useState(ACTIONS)

  // Dynamic game pressure mechanics
  useEffect(() => {
    if (currentRound >= 8) {
      setPatternLength(3)
      setAvailableActions(ACTIONS.slice(0, 4))
    }

    if (playersAlive <= 10) {
      setIsGhostMode(true)
    }

    if (playersAlive <= 5) {
      setIsSuddenDeath(true)
      setPatternLength(2)
      setAvailableActions(ACTIONS.slice(0, 3))
    }
  }, [currentRound, playersAlive])

  return (
    <div className="min-h-screen bg-gradient-pit relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-pixel-grid opacity-30" />
      <div className="absolute inset-0 bg-scanlines opacity-50" />

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Game Header */}
        <div className="text-center space-y-8 max-w-4xl mx-auto mb-12">
          <h1 className="text-8xl font-retro font-black text-primary animate-retro-glow">
            MIRROR PIT
          </h1>
          <div className="font-pixel text-accent text-lg animate-blink">
            &gt; REAL-TIME PVP SURVIVAL GAME &lt;
          </div>
        </div>

        {/* Game Status */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="retro-border bg-card/80 backdrop-blur-sm p-6 text-center">
            <Users className="w-8 h-8 text-accent mx-auto mb-3 animate-blink" />
            <div className="text-3xl font-pixel font-bold text-primary">
              {playersAlive}
            </div>
            <div className="text-xs font-pixel text-muted-foreground uppercase">
              PLAYERS_ALIVE
            </div>
          </div>

          <div className="retro-border bg-card/80 backdrop-blur-sm p-6 text-center">
            <div className="text-3xl font-pixel font-bold text-primary">
              ROUND_{currentRound}
            </div>
            <div className="text-xs font-pixel text-muted-foreground uppercase">
              CURRENT_ROUND
            </div>
          </div>

          {isGhostMode && (
            <div className="retro-border bg-card/80 backdrop-blur-sm p-6 text-center">
              <div className="text-3xl font-pixel font-bold text-ghost animate-pulse">
                GHOST_MODE
              </div>
              <div className="text-xs font-pixel text-ghost uppercase">
                BEWARE_THE_DEAD
              </div>
            </div>
          )}
        </div>

        {/* Game Phase Content */}
        {gamePhase === 'lobby' && (
          <LobbyScreen onStart={() => setGamePhase('playing')} />
        )}
        {gamePhase === 'playing' && (
          <PatternSubmission
            patternLength={patternLength}
            availableActions={availableActions}
            isGhostMode={isGhostMode}
          />
        )}
        {gamePhase === 'victory' && (
          <VictoryScreen
            winners={['0x1234...5678']} // TODO: Replace with actual winners
            prizePool={0.08} // TODO: Replace with actual prize pool
            onPlayAgain={() => setGamePhase('lobby')}
          />
        )}

        {/* Game Warnings */}
        {isSuddenDeath && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-destructive font-pixel animate-retro-glow text-center">
            &gt; SUDDEN_DEATH_ACTIVATED - PATTERN_LENGTH_REDUCED &lt;
          </div>
        )}
      </div>
    </div>
  )
}

const ACTIONS = [
  { name: 'LEFT', icon: ChevronLeft },
  { name: 'RIGHT', icon: ChevronRight },
  { name: 'UP', icon: ChevronUp },
  { name: 'DOWN', icon: ChevronDown },
  { name: 'JUMP', icon: ArrowUp },
  { name: 'SPIN', icon: RotateCw },
]
