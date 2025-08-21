import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Notifications {
  gameStart: boolean
  prizeDistribution: boolean
  playerJoined: boolean
  roundComplete: boolean
}

interface UserPreferences {
  soundEnabled: boolean
  animationsEnabled: boolean
  autoReady: boolean
  defaultEntryFee: string
  defaultMinPlayers: number
  notifications: Notifications
  showPlayerNames: boolean
  showGameTimer: boolean
  compactMode: boolean
}

const initialState: UserPreferences = {
  soundEnabled: true,
  animationsEnabled: true,
  autoReady: false,
  defaultEntryFee: '0.01',
  defaultMinPlayers: 2,
  notifications: {
    gameStart: true,
    prizeDistribution: true,
    playerJoined: true,
    roundComplete: true,
  },
  showPlayerNames: true,
  showGameTimer: true,
  compactMode: false,
}

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    // Sound and Animation
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload
    },
    setAnimationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.animationsEnabled = action.payload
    },

    // Game Behavior
    setAutoReady: (state, action: PayloadAction<boolean>) => {
      state.autoReady = action.payload
    },
    setDefaultEntryFee: (state, action: PayloadAction<string>) => {
      state.defaultEntryFee = action.payload
    },
    setDefaultMinPlayers: (state, action: PayloadAction<number>) => {
      state.defaultMinPlayers = action.payload
    },

    // Notifications
    setNotification: (
      state,
      action: PayloadAction<{ key: keyof Notifications; enabled: boolean }>,
    ) => {
      state.notifications[action.payload.key] = action.payload.enabled
    },
    setAllNotifications: (state, action: PayloadAction<boolean>) => {
      Object.keys(state.notifications).forEach((key) => {
        state.notifications[key as keyof Notifications] = action.payload
      })
    },

    // UI Preferences
    setShowPlayerNames: (state, action: PayloadAction<boolean>) => {
      state.showPlayerNames = action.payload
    },
    setShowGameTimer: (state, action: PayloadAction<boolean>) => {
      state.showGameTimer = action.payload
    },
    setCompactMode: (state, action: PayloadAction<boolean>) => {
      state.compactMode = action.payload
    },

    // Reset to defaults
    resetPreferences: () => {
      return initialState
    },
  },
})

export const {
  setSoundEnabled,
  setAnimationsEnabled,
  setAutoReady,
  setDefaultEntryFee,
  setDefaultMinPlayers,
  setNotification,
  setAllNotifications,
  setShowPlayerNames,
  setShowGameTimer,
  setCompactMode,
  resetPreferences,
} = userPreferencesSlice.actions

export default userPreferencesSlice.reducer
