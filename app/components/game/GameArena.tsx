'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useConnectedUsers } from 'react-together'
import { GameState, INITIAL_GAME_STATE, Player } from '@/app/types/game'
import { useGameState } from '../ReactTogetherWrapper'
import { PatternReveal } from './PatternReveal'
import { GameStatus } from './GameStatus'
import { RoundManager } from './RoundManager'
import { VictoryScreen } from './VictoryScreen'
import { LobbyScreen } from './LobbyScreen'
import { PatternSubmission } from './PatternSubmission'

export const GameArena = () => {
  const { address } = useAccount()
  const connectedUsers = useConnectedUsers()
  const { state, setState: broadcast } = useGameState()

  // Initialize game state
  useEffect(() => {
    if (!state) {
      broadcast(INITIAL_GAME_STATE)
    }
  }, [state, broadcast])

  // Update players alive count
  useEffect(() => {
    if (state) {
      const alive = Object.values(state.players).filter(
        (p: Player) => !p.isEliminated,
      ).length
      if (alive !== state.playersAlive) {
        broadcast({
          ...state,
          playersAlive: alive,
        })
      }
    }
  }, [state, broadcast])

  // Handle game pressure mechanics
  useEffect(() => {
    if (state) {
      const newState = { ...state }
      let hasChanges = false

      // Ghost mode when <= 10 players
      if (state.playersAlive <= 10 && !state.isGhostMode) {
        newState.isGhostMode = true
        hasChanges = true
      }

      // Sudden death when <= 5 players
      if (state.playersAlive <= 5 && !state.isSuddenDeath) {
        newState.isSuddenDeath = true
        newState.patternLength = 2
        newState.availableActions = ['L', 'R', 'J']
        hasChanges = true
      }

      if (hasChanges) {
        broadcast(newState)
      }
    }
  }, [state?.playersAlive, broadcast])

  // Join game
  const handleJoinGame = () => {
    if (state && address) {
      const newPlayer: Player = {
        address,
        name: `Player_${address.slice(0, 6)}`,
        isEliminated: false,
      }

      broadcast({
        ...state,
        players: {
          ...state.players,
          [address]: newPlayer,
        },
      })
    }
  }

  // Reset game
  const handlePlayAgain = () => {
    broadcast(INITIAL_GAME_STATE)
  }

  if (!state) return null

  return (
    <div className="min-h-screen bg-gradient-pit">
      <div className="absolute inset-0 bg-pixel-grid opacity-30" />
      <div className="absolute inset-0 bg-scanlines opacity-50" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <GameStatus state={state} />
        <RoundManager state={state} onStateChange={broadcast} />

        {state.phase === 'lobby' && (
          <LobbyScreen
            onJoin={handleJoinGame}
            connectedPlayers={Object.keys(state.players).length}
            isJoined={!!address && !!state.players[address]}
          />
        )}

        {state.phase === 'pattern_submission' && address && (
          <PatternSubmission
            state={state}
            playerAddress={address}
            onSubmitPattern={(pattern: string) => {
              broadcast({
                ...state,
                players: {
                  ...state.players,
                  [address]: {
                    ...state.players[address],
                    patternHash: pattern,
                  },
                },
              })
            }}
          />
        )}

        {state.phase === 'reveal' && address && (
          <PatternReveal state={state} playerAddress={address} />
        )}

        {state.phase === 'victory' && (
          <VictoryScreen state={state} onPlayAgain={handlePlayAgain} />
        )}
      </div>
    </div>
  )
}
