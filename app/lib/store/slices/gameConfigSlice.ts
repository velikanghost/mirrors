import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GAME_ACTIONS, type GameAction } from '../../constants'

interface GameConfig {
  defaultMinPlayers: number
  defaultEntryFee: string
  roundDuration: number
  revealDuration: number
  comboLength: number
  gameActions: GameAction[]
  maxPlayers: number
  minEntryFee: string
  maxEntryFee: string
  autoStartDelay: number
}

const initialState: GameConfig = {
  defaultMinPlayers: 2,
  defaultEntryFee: '0.01',
  roundDuration: 40,
  revealDuration: 5,
  comboLength: 3,
  gameActions: [...GAME_ACTIONS],
  maxPlayers: 10,
  minEntryFee: '0.001',
  maxEntryFee: '1.0',
  autoStartDelay: 10,
}

const gameConfigSlice = createSlice({
  name: 'gameConfig',
  initialState,
  reducers: {
    // Game Settings
    setDefaultMinPlayers: (state, action: PayloadAction<number>) => {
      state.defaultMinPlayers = Math.max(
        2,
        Math.min(action.payload, state.maxPlayers),
      )
    },
    setDefaultEntryFee: (state, action: PayloadAction<string>) => {
      const fee = parseFloat(action.payload)
      if (
        fee >= parseFloat(state.minEntryFee) &&
        fee <= parseFloat(state.maxEntryFee)
      ) {
        state.defaultEntryFee = action.payload
      }
    },
    setRoundDuration: (state, action: PayloadAction<number>) => {
      state.roundDuration = Math.max(10, Math.min(action.payload, 120))
    },
    setRevealDuration: (state, action: PayloadAction<number>) => {
      state.revealDuration = Math.max(3, Math.min(action.payload, 30))
    },
    setComboLength: (state, action: PayloadAction<number>) => {
      state.comboLength = Math.max(2, Math.min(action.payload, 5))
    },

    // Player Limits
    setMaxPlayers: (state, action: PayloadAction<number>) => {
      state.maxPlayers = Math.max(2, Math.min(action.payload, 20))
      if (state.defaultMinPlayers > state.maxPlayers) {
        state.defaultMinPlayers = state.maxPlayers
      }
    },

    // Fee Limits
    setMinEntryFee: (state, action: PayloadAction<string>) => {
      const fee = parseFloat(action.payload)
      if (fee >= 0 && fee <= parseFloat(state.maxEntryFee)) {
        state.minEntryFee = action.payload
        if (parseFloat(state.defaultEntryFee) < fee) {
          state.defaultEntryFee = action.payload
        }
      }
    },
    setMaxEntryFee: (state, action: PayloadAction<string>) => {
      const fee = parseFloat(action.payload)
      if (fee >= parseFloat(state.minEntryFee)) {
        state.maxEntryFee = action.payload
        if (parseFloat(state.defaultEntryFee) > fee) {
          state.defaultEntryFee = action.payload
        }
      }
    },

    // Game Actions
    setGameActions: (state, action: PayloadAction<GameAction[]>) => {
      if (action.payload.length >= 2 && action.payload.length <= 8) {
        state.gameActions = action.payload
      }
    },
    addGameAction: (state, action: PayloadAction<GameAction>) => {
      if (
        !state.gameActions.includes(action.payload) &&
        state.gameActions.length < 8
      ) {
        state.gameActions.push(action.payload)
      }
    },
    removeGameAction: (state, action: PayloadAction<GameAction>) => {
      if (state.gameActions.length > 2) {
        state.gameActions = state.gameActions.filter(
          (gameAction) => gameAction !== action.payload,
        )
      }
    },

    // Auto-start
    setAutoStartDelay: (state, action: PayloadAction<number>) => {
      state.autoStartDelay = Math.max(5, Math.min(action.payload, 60))
    },

    // Reset to defaults
    resetGameConfig: (state) => {
      return initialState
    },
  },
})

export const {
  setDefaultMinPlayers,
  setDefaultEntryFee,
  setRoundDuration,
  setRevealDuration,
  setComboLength,
  setMaxPlayers,
  setMinEntryFee,
  setMaxEntryFee,
  setGameActions,
  addGameAction,
  removeGameAction,
  setAutoStartDelay,
  resetGameConfig,
} = gameConfigSlice.actions

export default gameConfigSlice.reducer
