export type GamePhase =
  | 'lobby'
  | 'pattern_submission'
  | 'reveal'
  | 'elimination'
  | 'victory'

export type GameAction = 'L' | 'R' | 'J' | 'S' | 'T'

export interface Player {
  address: string
  name: string
  isEliminated: boolean
  patternHash?: string
  revealedPattern?: GameAction[]
}

export interface GameState {
  phase: GamePhase
  round: number
  players: Record<string, Player>
  playersAlive: number
  isGhostMode: boolean
  isSuddenDeath: boolean
  patternLength: number
  availableActions: GameAction[]
  roundEndTime?: number
}

export const INITIAL_GAME_STATE: GameState = {
  phase: 'lobby',
  round: 0,
  players: {},
  playersAlive: 0,
  isGhostMode: false,
  isSuddenDeath: false,
  patternLength: 5,
  availableActions: ['L', 'R', 'J', 'S', 'T'],
}

export const GAME_ACTIONS: Record<GameAction, string> = {
  L: 'Left',
  R: 'Right',
  J: 'Jump',
  S: 'Spin',
  T: 'Thrust',
}
