import { configureStore } from '@reduxjs/toolkit'
import formsReducer from './slices/formsSlice'
import loadingReducer from './slices/loadingSlice'
import errorsReducer from './slices/errorsSlice'
import uiReducer from './slices/uiSlice'
import userPreferencesReducer from './slices/userPreferencesSlice'
import navigationReducer from './slices/navigationSlice'
import gameConfigReducer from './slices/gameConfigSlice'

export const store = configureStore({
  reducer: {
    forms: formsReducer,
    loading: loadingReducer,
    errors: errorsReducer,
    ui: uiReducer,
    userPreferences: userPreferencesReducer,
    navigation: navigationReducer,
    gameConfig: gameConfigReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Re-export all actions for convenience
export * from './slices/formsSlice'
export * from './slices/loadingSlice'
export * from './slices/errorsSlice'
export * from './slices/uiSlice'
export * from './slices/navigationSlice'
export * from './slices/gameConfigSlice'

// Re-export user preferences with aliases to avoid conflicts
export {
  setSoundEnabled,
  setAnimationsEnabled as setUserAnimationsEnabled,
  setAutoReady,
  setDefaultEntryFee as setUserDefaultEntryFee,
  setDefaultMinPlayers as setUserDefaultMinPlayers,
  setNotification,
  setAllNotifications,
  setShowPlayerNames,
  setShowGameTimer,
  setCompactMode,
  resetPreferences,
} from './slices/userPreferencesSlice'
