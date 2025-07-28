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
import { formatPlayerId } from '../lib/utils'

// Game state interface
interface GameState {
  round: number
  phase: GamePhase
  submissions: Record<string, GameAction[]>
  eliminated: string[]
  eliminationOrder: { playerId: string; round: number }[] // Track when players were eliminated
  timeRemaining: number
  winners: string[]
  readyPlayers: string[] // Track players who are ready
}

// Per-lobby player state
interface LobbyPlayers {
  players: string[]
  paidPlayers: string[]
}

interface GameArenaProps {
  lobbyId: string
  minPlayers: number
}

export const GameArena = ({ lobbyId, minPlayers }: GameArenaProps) => {
  const myId = useMyId()
  const connectedUsers = useConnectedUsers()

  // Get lobby players state
  const [lobbyPlayers] = useStateTogether<LobbyPlayers>(
    `lobby-${lobbyId}-players`,
    { players: [], paidPlayers: [] },
  )

  // Shared game state using react-together, scoped to lobby ID
  const [gameState, setGameState] = useStateTogether<GameState>(
    `game-${lobbyId}-state`,
    {
      round: 1,
      phase: GAME_PHASES.READY_CHECK,
      submissions: {},
      eliminated: [],
      eliminationOrder: [],
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

    // Use lobby players instead of all connected users
    const activePlayers = (lobbyPlayers?.players || []).filter(
      (id) => !gameState.eliminated.includes(id),
    )

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
  }, [gameState.readyPlayers, lobbyPlayers, minPlayers])

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

  // Update elimination tracking in both places where players can be eliminated

  // 1. When checking for duplicates
  useEffect(() => {
    if (gameState.phase !== GAME_PHASES.INPUT) return

    const activePlayers = (lobbyPlayers?.players || []).filter(
      (id) => !gameState.eliminated.includes(id),
    )

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

      // Update game state with elimination order
      setGameState((prev) => ({
        ...prev,
        phase: GAME_PHASES.REVEAL,
        eliminated: [...prev.eliminated, ...eliminated],
        eliminationOrder: [
          ...prev.eliminationOrder,
          ...eliminated.map((playerId) => ({
            playerId,
            round: prev.round,
          })),
        ],
        timeRemaining: REVEAL_DURATION,
      }))
    }
  }, [gameState.submissions, lobbyPlayers])

  // 2. When time runs out
  useEffect(() => {
    if (gameState.timeRemaining <= 0) {
      if (gameState.phase === GAME_PHASES.INPUT) {
        // Get active players who haven't submitted
        const activePlayers = (lobbyPlayers?.players || []).filter(
          (id) => !gameState.eliminated.includes(id),
        )

        const notSubmittedPlayers = activePlayers.filter(
          (id) => !gameState.submissions[id],
        )

        // Eliminate players who didn't submit in time
        setGameState((prev) => ({
          ...prev,
          phase: GAME_PHASES.REVEAL,
          eliminated: [...prev.eliminated, ...notSubmittedPlayers],
          eliminationOrder: [
            ...prev.eliminationOrder,
            ...notSubmittedPlayers.map((playerId) => ({
              playerId,
              round: prev.round,
            })),
          ],
          timeRemaining: REVEAL_DURATION,
        }))
      } else if (gameState.phase === GAME_PHASES.REVEAL) {
        // Start next round or end game
        const activePlayers = (lobbyPlayers?.players || []).filter(
          (id) => !gameState.eliminated.includes(id),
        )

        if (activePlayers.length <= 1) {
          // Game over - we have winner(s)
          setGameState((prev) => ({
            ...prev,
            phase: GAME_PHASES.END,
            winners: activePlayers,
          }))
        } else {
          // Next round
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
  }, [gameState.timeRemaining, gameState.phase, lobbyPlayers])

  // Helper function to check if current player has submitted
  const hasSubmitted = myId && gameState.submissions[myId]

  return (
    <div className="terminal-section">
      {/* Game Status */}
      <div className="terminal-header">
        <h2 className="text-2xl font-bold animate-retro-glow">
          {gameState.phase === GAME_PHASES.READY_CHECK
            ? 'Status'
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
            <p className="text-lg mb-4">Waiting for players...</p>
            <p>
              ({gameState.readyPlayers.length} /{' '}
              {Math.max(minPlayers, lobbyPlayers?.players?.length || 0)} ready)
            </p>
            {/* Ready Button - only show if player has joined */}
            {myId && lobbyPlayers?.players?.includes(myId) && (
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
                disabled={Boolean(
                  selectedActions.length >= COMBO_LENGTH || hasSubmitted,
                )}
                className={`action-button ${
                  selectedActions.includes(action)
                    ? 'selected animate-retro-bounce'
                    : ''
                } ${hasSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  } ${hasSubmitted ? 'opacity-50' : ''}`}
                >
                  {selectedActions[i] || '?'}
                </div>
              ))}
          </div>

          {/* Control Buttons and Status */}
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleReset}
                variant="destructive"
                disabled={Boolean(selectedActions.length === 0 || hasSubmitted)}
                isAnimated
              >
                Reset
              </Button>
              <Button
                onClick={handleSubmit}
                variant="success"
                disabled={Boolean(
                  selectedActions.length !== COMBO_LENGTH || hasSubmitted,
                )}
                isAnimated
              >
                Submit
              </Button>
            </div>

            {hasSubmitted && (
              <div className="text-center animate-fade-in">
                <p className="text-lg text-green-400">Moves submitted!</p>
                <p className="text-sm text-gray-400">
                  Waiting for other players...
                </p>
                <div className="mt-2 flex justify-center gap-2">
                  {(lobbyPlayers?.players || [])
                    .filter((id) => !gameState.eliminated.includes(id))
                    .map((playerId) => {
                      const hasPlayerSubmitted = gameState.submissions[playerId]
                      return (
                        <div
                          key={playerId}
                          className={`w-2 h-2 rounded-full ${
                            hasPlayerSubmitted ? 'bg-green-400' : 'bg-gray-400'
                          }`}
                          title={`Player ${
                            connectedUsers.find((u) => u.userId === playerId)
                              ?.nickname || 'Unknown'
                          }`}
                        />
                      )
                    })}
                </div>
              </div>
            )}
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
          <div className="space-y-6">
            {/* <div className="winners-section">
              <h4 className="text-xl text-green-400 mb-4">Winners:</h4>
              {gameState.winners.map((winnerId) => (
                <div
                  key={winnerId}
                  className="winner-row bg-green-500/20 p-3 rounded-lg animate-celebrate"
                >
                  <span className="font-bold">
                    {connectedUsers.find((u) => u.userId === winnerId)
                      ?.nickname || formatPlayerId(winnerId)}
                  </span>
                  <span className="text-green-400 ml-2">🏆 WINNER!</span>
                </div>
              ))}
            </div> */}

            <div className="eliminations-section">
              <h4 className="text-xl text-yellow-400 mb-4">
                Elimination Order:
              </h4>
              {(gameState.eliminationOrder || [])
                .reverse()
                .map((elimination, index) => (
                  <div
                    key={elimination.playerId}
                    className="elimination-row p-2 bg-white/5 rounded-lg mb-2"
                  >
                    {/* <span className="text-gray-400">
                      #{(gameState.eliminationOrder || []).length - index}.
                    </span> */}
                    <span className="ml-2">
                      {connectedUsers.find(
                        (u) => u.userId === elimination.playerId,
                      )?.nickname || formatPlayerId(elimination.playerId)}
                    </span>
                    <span className="text-gray-500 ml-2">
                      (Round {elimination.round})
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
