import { GameAction, GamePhase } from '../lib/constants'

// Lightweight lobby summary
export interface LobbySummary {
  id: string
  name: string
  entryFeeWei: string // stringify BigInt
  minPlayers: number
  creator: string
}

// Per-lobby player state
export interface LobbyPlayers {
  players: string[]
  paidPlayers: Array<{ userId: string; walletAddress: string }>
}

// Game state interface
export interface GameState {
  round: number
  phase: GamePhase
  submissions: Record<string, GameAction[]>
  eliminated: string[]
  eliminationOrder: { playerId: string; round: number }[] // Track when players were eliminated
  timeRemaining: number
  winners: string[]
  readyPlayers: string[] // Track players who are ready
}

export interface Message {
  userId: string
  text: string
  timestamp: number
}
