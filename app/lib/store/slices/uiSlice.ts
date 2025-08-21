import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SidebarState {
  isOpen: boolean
  activeTab: string
}

interface ModalState {
  confirmDelete: { isOpen: boolean; lobbyId: string | null }
  gameRules: boolean
  settings: boolean
}

interface UIState {
  theme: 'dark' | 'light'
  sidebar: SidebarState
  modals: ModalState
  showGameTitle: boolean
  animationsEnabled: boolean
}

const initialState: UIState = {
  theme: 'dark',
  sidebar: {
    isOpen: false,
    activeTab: 'lobbies',
  },
  modals: {
    confirmDelete: { isOpen: false, lobbyId: null },
    gameRules: false,
    settings: false,
  },
  showGameTitle: true,
  animationsEnabled: true,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },

    // Sidebar
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload
    },
    setSidebarTab: (state, action: PayloadAction<string>) => {
      state.sidebar.activeTab = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen
    },

    // Modals
    openConfirmDelete: (state, action: PayloadAction<string>) => {
      state.modals.confirmDelete = { isOpen: true, lobbyId: action.payload }
    },
    closeConfirmDelete: (state) => {
      state.modals.confirmDelete = { isOpen: false, lobbyId: null }
    },
    setGameRulesModal: (state, action: PayloadAction<boolean>) => {
      state.modals.gameRules = action.payload
    },
    setSettingsModal: (state, action: PayloadAction<boolean>) => {
      state.modals.settings = action.payload
    },
    closeAllModals: (state) => {
      state.modals.confirmDelete = { isOpen: false, lobbyId: null }
      state.modals.gameRules = false
      state.modals.settings = false
    },

    // Game UI
    setShowGameTitle: (state, action: PayloadAction<boolean>) => {
      state.showGameTitle = action.payload
    },
    setAnimationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.animationsEnabled = action.payload
    },
  },
})

export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  setSidebarTab,
  toggleSidebar,
  openConfirmDelete,
  closeConfirmDelete,
  setGameRulesModal,
  setSettingsModal,
  closeAllModals,
  setShowGameTitle,
  setAnimationsEnabled,
} = uiSlice.actions

export default uiSlice.reducer
