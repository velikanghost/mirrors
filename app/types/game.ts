export type GamePhase = 'lobby' | 'playing' | 'victory'

export interface LobbyScreenProps {
  onStart: () => void
}

export interface PatternSubmissionProps {
  patternLength: number
  availableActions: Array<{
    name: string
    icon: any // We'll type this properly when we have the actual icons
  }>
  isGhostMode: boolean
}

export interface VictoryScreenProps {
  winners: string[]
  prizePool: number
  onPlayAgain: () => void
}

export interface GameState {
  gamePhase: GamePhase
  currentRound: number
  playersAlive: number
  isGhostMode: boolean
  isSuddenDeath: boolean
  patternLength: number
  availableActions: Array<{
    name: string
    icon: any
  }>
}

export const INITIAL_GAME_STATE: GameState = {
  gamePhase: 'lobby',
  currentRound: 1,
  playersAlive: 0,
  isGhostMode: false,
  isSuddenDeath: false,
  patternLength: 4,
  availableActions: [
    { name: 'LEFT', icon: null },
    { name: 'RIGHT', icon: null },
    { name: 'UP', icon: null },
    { name: 'DOWN', icon: null },
    { name: 'JUMP', icon: null },
    { name: 'SPIN', icon: null },
  ],
}
