import { useStateTogether, useConnectedUsers, useMyId } from 'react-together'
import { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import {
  ROUND_DURATION,
  REVEAL_DURATION,
  GAME_ACTIONS,
  type GameAction,
  COMBO_LENGTH,
  GAME_PHASES,
  type GamePhase,
} from '../lib/constants'

// Game state interface
interface GameState {
  round: number
  phase: GamePhase
  submissions: Record<string, GameAction[]>
  eliminated: string[]
  timeRemaining: number
  winners: string[]
  readyPlayers: string[] // Track players who are ready
}

interface GameArenaProps {
  lobbyId: string
  minPlayers: number
}

export const GameArena = ({ lobbyId, minPlayers }: GameArenaProps) => {
  const myId = useMyId()
  const connectedUsers = useConnectedUsers()

  // Shared game state using react-together, scoped to lobby ID
  const [gameState, setGameState] = useStateTogether<GameState>(
    `game-${lobbyId}-state`, // Changed from game-state-${lobbyId} to game-${lobbyId}-state for consistency
    {
      round: 1,
      phase: GAME_PHASES.READY_CHECK,
      submissions: {},
      eliminated: [],
      timeRemaining: ROUND_DURATION,
      winners: [],
      readyPlayers: [],
    },
  )

  // Local state for current player's action selection
  const [selectedActions, setSelectedActions] = useState<GameAction[]>([])

  // Reset selectedActions when transitioning to a new round
  useEffect(() => {
    if (gameState.phase === GAME_PHASES.INPUT) {
      setSelectedActions([])
    }
  }, [gameState.round, gameState.phase])

  // Handle ready toggle
  const handleReady = () => {
    if (!myId) return

    setGameState((prev) => ({
      ...prev,
      readyPlayers: prev.readyPlayers.includes(myId)
        ? prev.readyPlayers.filter((id) => id !== myId)
        : [...prev.readyPlayers, myId],
    }))
  }

  // Check if all players are ready
  useEffect(() => {
    if (gameState.phase !== GAME_PHASES.READY_CHECK) return

    const activePlayers = connectedUsers
      .map((u) => u.userId)
      .filter((id) => !gameState.eliminated.includes(id))

    const allReady =
      activePlayers.length >= minPlayers &&
      activePlayers.every((id) => gameState.readyPlayers.includes(id))

    if (allReady) {
      setGameState((prev) => ({
        ...prev,
        phase: GAME_PHASES.INPUT,
        timeRemaining: ROUND_DURATION,
      }))
    }
  }, [gameState.readyPlayers, connectedUsers, minPlayers])

  // Handle action selection
  const handleActionSelect = (action: GameAction) => {
    if (gameState.phase !== GAME_PHASES.INPUT) return
    if (selectedActions.length >= COMBO_LENGTH) return

    setSelectedActions((prev) => [...prev, action])
  }

  // Submit player's action sequence
  const handleSubmit = () => {
    if (selectedActions.length !== COMBO_LENGTH || !myId) return

    setGameState((prev) => ({
      ...prev,
      submissions: {
        ...prev.submissions,
        [myId]: selectedActions,
      },
    }))
  }

  // Reset selection
  const handleReset = () => {
    setSelectedActions([])
  }

  // Check for eliminations when all players have submitted
  useEffect(() => {
    if (gameState.phase !== GAME_PHASES.INPUT) return

    const activePlayers = connectedUsers
      .map((u) => u.userId)
      .filter((id) => !gameState.eliminated.includes(id))

    const allSubmitted = activePlayers.every((id) => gameState.submissions[id])

    if (allSubmitted) {
      // Find duplicates
      const sequences = Object.entries(gameState.submissions)
      const eliminated = sequences.reduce((acc, [playerId, sequence]) => {
        const hasDuplicate = sequences.some(
          ([otherId, otherSeq]) =>
            playerId !== otherId &&
            JSON.stringify(sequence) === JSON.stringify(otherSeq),
        )
        return hasDuplicate ? [...acc, playerId] : acc
      }, [] as string[])

      // Update game state
      setGameState((prev) => ({
        ...prev,
        phase: GAME_PHASES.REVEAL,
        eliminated: [...prev.eliminated, ...eliminated],
        timeRemaining: REVEAL_DURATION,
      }))
    }
  }, [gameState.submissions, connectedUsers])

  // Handle round timer
  useEffect(() => {
    if (gameState.timeRemaining <= 0) {
      if (gameState.phase === GAME_PHASES.INPUT) {
        // Get active players who haven't submitted
        const activePlayers = connectedUsers
          .map((u) => u.userId)
          .filter((id) => !gameState.eliminated.includes(id))

        const notSubmittedPlayers = activePlayers.filter(
          (id) => !gameState.submissions[id],
        )

        // Eliminate players who didn't submit in time
        setGameState((prev) => ({
          ...prev,
          phase: GAME_PHASES.REVEAL,
          eliminated: [...prev.eliminated, ...notSubmittedPlayers],
          timeRemaining: REVEAL_DURATION,
        }))
      } else if (gameState.phase === GAME_PHASES.REVEAL) {
        // Start next round or end game
        const activePlayers = connectedUsers
          .map((u) => u.userId)
          .filter((id) => !gameState.eliminated.includes(id))

        if (activePlayers.length <= 1) {
          // Game over - we have winner(s)
          setGameState((prev) => ({
            ...prev,
            phase: GAME_PHASES.END,
            winners: activePlayers,
          }))
        } else {
          // Next round - no need to reset ready state
          setGameState((prev) => ({
            ...prev,
            round: prev.round + 1,
            phase: GAME_PHASES.INPUT,
            submissions: {},
            timeRemaining: ROUND_DURATION,
          }))
        }
      }
    }

    // Countdown timer - only run during INPUT and REVEAL phases
    if (
      gameState.phase === GAME_PHASES.INPUT ||
      gameState.phase === GAME_PHASES.REVEAL
    ) {
      const timer = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
        }))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameState.timeRemaining, gameState.phase])

  return (
    <div className="terminal-section">
      {/* Game Status */}
      <div className="terminal-header">
        <h2 className="text-2xl font-bold animate-retro-glow">
          {gameState.phase === GAME_PHASES.READY_CHECK
            ? 'Ready Check'
            : `Round ${gameState.round}`}
        </h2>
        {(gameState.phase === GAME_PHASES.INPUT ||
          gameState.phase === GAME_PHASES.REVEAL) && (
          <p
            className={`text-lg ${
              gameState.timeRemaining <= 5 ? 'animate-blink text-yellow' : ''
            }`}
          >
            Time: {gameState.timeRemaining}s
          </p>
        )}
      </div>

      {gameState.phase === GAME_PHASES.READY_CHECK && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg mb-4">
              Waiting for players... ({gameState.readyPlayers.length} /{' '}
              {minPlayers} ready)
            </p>
            {/* Players List */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {connectedUsers.map((user) => {
                const isReady = gameState.readyPlayers.includes(user.userId)
                return (
                  <div
                    key={user.userId}
                    className={`p-4 rounded ${
                      isReady ? 'bg-green-500/20' : 'bg-white/10'
                    }`}
                  >
                    <span>{user.nickname || user.userId}</span>
                    <span className="ml-2">{isReady ? '✓' : '...'}</span>
                  </div>
                )
              })}
            </div>
            {/* Ready Button */}
            {myId && (
              <Button
                onClick={handleReady}
                variant={
                  gameState.readyPlayers.includes(myId) ? 'success' : 'primary'
                }
                isAnimated
              >
                {gameState.readyPlayers.includes(myId)
                  ? 'Ready!'
                  : 'Click when ready'}
              </Button>
            )}
          </div>
        </div>
      )}

      {gameState.phase === GAME_PHASES.INPUT && (
        <div className="space-y-6">
          {/* Action Grid */}
          <div className="action-grid">
            {GAME_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleActionSelect(action)}
                disabled={selectedActions.length >= COMBO_LENGTH}
                className={`action-button ${
                  selectedActions.includes(action)
                    ? 'selected animate-retro-bounce'
                    : ''
                }`}
              >
                {action}
              </button>
            ))}
          </div>

          {/* Pattern Grid */}
          <div className="pattern-grid">
            {Array(COMBO_LENGTH)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className={`pattern-slot ${
                    selectedActions[i] ? 'filled animate-pixel-jump' : ''
                  }`}
                >
                  {selectedActions[i] || '?'}
                </div>
              ))}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleReset}
              variant="destructive"
              disabled={selectedActions.length === 0}
              isAnimated
            >
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              variant="success"
              disabled={selectedActions.length !== COMBO_LENGTH}
              isAnimated
            >
              Submit
            </Button>
          </div>
        </div>
      )}

      {gameState.phase === GAME_PHASES.REVEAL && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xl text-center">Round Results</h3>
          {/* Player Grid */}
          <div className="player-grid">
            {Object.entries(gameState.submissions).map(
              ([playerId, actions]) => {
                const isEliminated = gameState.eliminated.includes(playerId)
                return (
                  <div
                    key={playerId}
                    className={`player-card ${
                      isEliminated ? 'animate-eliminate' : 'animate-celebrate'
                    }`}
                  >
                    <div className="player-indicator">
                      {connectedUsers
                        .find((u) => u.userId === playerId)
                        ?.nickname?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p>
                        {connectedUsers.find((u) => u.userId === playerId)
                          ?.nickname || playerId}
                      </p>
                      <p className="text-sm opacity-70">
                        {actions.join(' → ')}
                      </p>
                    </div>
                  </div>
                )
              },
            )}
          </div>
        </div>
      )}

      {gameState.phase === GAME_PHASES.END && (
        <div className="text-center space-y-4 animate-fade-in">
          <h3 className="text-2xl font-bold animate-celebrate">Game Over!</h3>
          <div className="survivors-list">
            <h4 className="text-xl">Winners:</h4>
            {gameState.winners.map((winnerId, index) => (
              <div key={winnerId} className="survivor-row">
                <span className="rank">#{index + 1}</span>
                <span>
                  {connectedUsers.find((u) => u.userId === winnerId)
                    ?.nickname || winnerId}
                </span>
                <span className="status animate-retro-glow">WINNER!</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
