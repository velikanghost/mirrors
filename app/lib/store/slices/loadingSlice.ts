import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface LoadingState {
  creatingLobby: boolean
  joiningLobby: string | null // lobby ID if joining, null if not
  distributingPrizes: boolean
  deletingLobby: string | null // lobby ID if deleting, null if not
  checkingPayment: boolean
}

const initialState: LoadingState = {
  creatingLobby: false,
  joiningLobby: null,
  distributingPrizes: false,
  deletingLobby: null,
  checkingPayment: false,
}

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setCreatingLobby: (state, action: PayloadAction<boolean>) => {
      state.creatingLobby = action.payload
    },
    setJoiningLobby: (state, action: PayloadAction<string | null>) => {
      state.joiningLobby = action.payload
    },
    setDistributingPrizes: (state, action: PayloadAction<boolean>) => {
      state.distributingPrizes = action.payload
    },
    setDeletingLobby: (state, action: PayloadAction<string | null>) => {
      state.deletingLobby = action.payload
    },
    setCheckingPayment: (state, action: PayloadAction<boolean>) => {
      state.checkingPayment = action.payload
    },
    clearAllLoading: (state) => {
      state.creatingLobby = false
      state.joiningLobby = null
      state.distributingPrizes = false
      state.deletingLobby = null
      state.checkingPayment = false
    },
  },
})

export const {
  setCreatingLobby,
  setJoiningLobby,
  setDistributingPrizes,
  setDeletingLobby,
  setCheckingPayment,
  clearAllLoading,
} = loadingSlice.actions

export default loadingSlice.reducer
