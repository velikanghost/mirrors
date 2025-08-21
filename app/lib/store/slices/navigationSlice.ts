import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Breadcrumb {
  label: string
  path: string
}

interface NavigationState {
  currentView: 'lobbies' | 'game' | 'settings' | 'rules'
  activeLobbyId: string | null
  previousLobbyId: string | null
  breadcrumbs: Breadcrumb[]
  lastVisitedLobby: string | null
}

const initialState: NavigationState = {
  currentView: 'lobbies',
  activeLobbyId: null,
  previousLobbyId: null,
  breadcrumbs: [{ label: 'Lobbies', path: '/lobbies' }],
  lastVisitedLobby: null,
}

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    // View Navigation
    setCurrentView: (
      state,
      action: PayloadAction<'lobbies' | 'game' | 'settings' | 'rules'>,
    ) => {
      state.currentView = action.payload
    },
    navigateToLobbies: (state) => {
      state.currentView = 'lobbies'
      state.activeLobbyId = null
      state.breadcrumbs = [{ label: 'Lobbies', path: '/lobbies' }]
    },
    navigateToGame: (state, action: PayloadAction<string>) => {
      state.currentView = 'game'
      state.previousLobbyId = state.activeLobbyId
      state.activeLobbyId = action.payload
      state.lastVisitedLobby = action.payload
      state.breadcrumbs = [
        { label: 'Lobbies', path: '/lobbies' },
        { label: 'Game', path: `/game/${action.payload}` },
      ]
    },
    navigateToSettings: (state) => {
      state.currentView = 'settings'
      state.breadcrumbs = [
        { label: 'Lobbies', path: '/lobbies' },
        { label: 'Settings', path: '/settings' },
      ]
    },
    navigateToRules: (state) => {
      state.currentView = 'rules'
      state.breadcrumbs = [
        { label: 'Lobbies', path: '/lobbies' },
        { label: 'Game Rules', path: '/rules' },
      ]
    },

    // Lobby Management
    setActiveLobby: (state, action: PayloadAction<string | null>) => {
      if (action.payload) {
        state.previousLobbyId = state.activeLobbyId
        state.activeLobbyId = action.payload
        state.lastVisitedLobby = action.payload
      } else {
        state.previousLobbyId = state.activeLobbyId
        state.activeLobbyId = null
      }
    },
    clearActiveLobby: (state) => {
      state.previousLobbyId = state.activeLobbyId
      state.activeLobbyId = null
    },

    // Breadcrumbs
    setBreadcrumbs: (state, action: PayloadAction<Breadcrumb[]>) => {
      state.breadcrumbs = action.payload
    },
    addBreadcrumb: (state, action: PayloadAction<Breadcrumb>) => {
      state.breadcrumbs.push(action.payload)
    },
    removeBreadcrumb: (state, action: PayloadAction<string>) => {
      state.breadcrumbs = state.breadcrumbs.filter(
        (bc) => bc.path !== action.payload,
      )
    },
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [{ label: 'Lobbies', path: '/lobbies' }]
    },

    // Navigation History
    setLastVisitedLobby: (state, action: PayloadAction<string | null>) => {
      state.lastVisitedLobby = action.payload
    },
    goBack: (state) => {
      if (state.previousLobbyId) {
        state.activeLobbyId = state.previousLobbyId
        state.previousLobbyId = null
      } else {
        state.currentView = 'lobbies'
        state.activeLobbyId = null
      }
    },
  },
})

export const {
  setCurrentView,
  navigateToLobbies,
  navigateToGame,
  navigateToSettings,
  navigateToRules,
  setActiveLobby,
  clearActiveLobby,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  clearBreadcrumbs,
  setLastVisitedLobby,
  goBack,
} = navigationSlice.actions

export default navigationSlice.reducer
