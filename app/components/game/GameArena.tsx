'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Trophy,
  Timer,
  Users,
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
  const [playersAlive, setPlayersAlive] = useState(47)
  const [totalPlayers, setTotalPlayers] = useState(100)
  const [timeLeft, setTimeLeft] = useState(30)
  const [jackpot, setJackpot] = useState(1000)
  const [pattern, setPattern] = useState<string[]>([])

  // Timer effect
  useEffect(() => {
    if (gamePhase !== 'playing' || timeLeft <= 0) return
    const timer = setInterval(
      () => setTimeLeft((t) => Math.max(0, t - 1)),
      1000,
    )
    return () => clearInterval(timer)
  }, [gamePhase, timeLeft])

  return (
    <div className="min-h-screen bg-dark text-neon relative p-6">
      {/* Background Effects */}
      <div className="scanlines" />
      <div className="grid-bg" />

      {gamePhase === 'lobby' ? (
        <LobbyScreen
          playersReady={playersAlive}
          totalJackpot={jackpot}
          secondsToStart={timeLeft}
          onStart={() => setGamePhase('playing')}
        />
      ) : (
        <div className="container mx-auto relative z-10">
          {/* System Status */}
          <div className="terminal-section mb-6">
            <div className="terminal-header">SYSTEM_STATUS</div>
            <div className="status-grid">
              <div className="status-card">
                <Users className="w-6 h-6" />
                <div className="status-card-value">{playersAlive}</div>
                <div className="status-card-label">Alive</div>
              </div>
              <div className="status-card">
                <Trophy className="w-6 h-6 text-yellow" />
                <div className="status-card-value">${jackpot}</div>
                <div className="status-card-label">Jackpot</div>
              </div>
              <div className="status-card">
                <Timer className="w-6 h-6" />
                <div className="status-card-value">{timeLeft}s</div>
                <div className="status-card-label">Time Left</div>
              </div>
              <div className="status-card">
                <div className="status-card-value">
                  {Math.round((playersAlive / totalPlayers) * 100)}%
                </div>
                <div className="status-card-label">Survival</div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="progress-container">
              <div>
                <div className="progress-label">
                  <span>Players Remaining</span>
                  <span>
                    {playersAlive}/{totalPlayers}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(playersAlive / totalPlayers) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="progress-label">
                  <span>Round Timer</span>
                  <span>{timeLeft}s</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Pattern Input Terminal */}
            <div className="col-span-2">
              <div className="terminal-section">
                <div className="terminal-header">PATTERN_INPUT_TERMINAL</div>
                <PatternSubmission
                  patternLength={5}
                  availableActions={ACTIONS}
                  isGhostMode={playersAlive <= 10}
                />
              </div>
            </div>

            {/* Player Grid */}
            <div className="terminal-section">
              <div className="terminal-header">PLAYER_GRID</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{playersAlive} Players Alive</span>
                  </div>
                  <span>
                    {Math.round((playersAlive / totalPlayers) * 100)}% Survival
                  </span>
                </div>

                <div>
                  <div className="text-sm mb-2">
                    • Survivors ({playersAlive})
                  </div>
                  <div className="player-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="player-card">
                        <div className="player-indicator">
                          {i === 0 ? 'YO' : 'PL'}
                        </div>
                        <span>{i === 0 ? 'You' : `Player ${i}`}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm mb-2">• Top Survivors</div>
                  <div className="survivors-list">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="survivor-row">
                        <span className="rank">
                          {i + 1}. {i === 0 ? 'You' : `Player ${i}`}
                        </span>
                        <span className="status">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ACTIONS = [
  { name: 'LEFT', icon: ChevronLeft },
  { name: 'RIGHT', icon: ChevronRight },
  { name: 'JUMP', icon: ChevronUp },
  { name: 'SPIN', icon: RotateCw },
  { name: 'DUCK', icon: ChevronDown },
]
