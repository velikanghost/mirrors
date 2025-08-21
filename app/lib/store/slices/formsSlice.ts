import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface LobbyCreationForm {
  name: string
  entryFee: string
  minPlayers: number
  isCreating: boolean
}

interface ChatForm {
  messageText: string
}

interface FormsState {
  lobbyCreation: LobbyCreationForm
  chat: ChatForm
}

const initialState: FormsState = {
  lobbyCreation: {
    name: '',
    entryFee: '0.01',
    minPlayers: 2,
    isCreating: false,
  },
  chat: {
    messageText: '',
  },
}

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    // Lobby Creation Form
    setLobbyName: (state, action: PayloadAction<string>) => {
      state.lobbyCreation.name = action.payload
    },
    setEntryFee: (state, action: PayloadAction<string>) => {
      state.lobbyCreation.entryFee = action.payload
    },
    setMinPlayers: (state, action: PayloadAction<number>) => {
      state.lobbyCreation.minPlayers = action.payload
    },
    setLobbyCreating: (state, action: PayloadAction<boolean>) => {
      state.lobbyCreation.isCreating = action.payload
    },
    resetLobbyForm: (state) => {
      state.lobbyCreation.name = ''
      state.lobbyCreation.entryFee = '0.01'
      state.lobbyCreation.minPlayers = 2
      state.lobbyCreation.isCreating = false
    },

    // Chat Form
    setChatMessage: (state, action: PayloadAction<string>) => {
      state.chat.messageText = action.payload
    },
    clearChatMessage: (state) => {
      state.chat.messageText = ''
    },
  },
})

export const {
  setLobbyName,
  setEntryFee,
  setMinPlayers,
  setLobbyCreating,
  resetLobbyForm,
  setChatMessage,
  clearChatMessage,
} = formsSlice.actions

export default formsSlice.reducer
