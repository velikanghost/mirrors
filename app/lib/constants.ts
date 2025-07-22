export const ROUND_DURATION = 30
export const REVEAL_DURATION = 5

export const GAME_ACTIONS = ['left', 'right', 'jump', 'spin', 'duck'] as const
export type GameAction = (typeof GAME_ACTIONS)[number]

export const COMBO_LENGTH = 3

export const GAME_PHASES = {
  READY_CHECK: 'ready_check',
  INPUT: 'input',
  REVEAL: 'reveal',
  END: 'end',
} as const

export type GamePhase = (typeof GAME_PHASES)[keyof typeof GAME_PHASES]
