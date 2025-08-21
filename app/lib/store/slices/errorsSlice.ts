import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ContractError {
  id: string
  message: string
  timestamp: number
  type: 'create' | 'join' | 'distribute' | 'delete'
  lobbyId?: string
}

interface NetworkError {
  id: string
  message: string
  timestamp: number
  retryable: boolean
}

interface ErrorsState {
  contractErrors: ContractError[]
  networkErrors: NetworkError[]
  generalErrors: string[]
}

const initialState: ErrorsState = {
  contractErrors: [],
  networkErrors: [],
  generalErrors: [],
}

const errorsSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    addContractError: (
      state,
      action: PayloadAction<Omit<ContractError, 'id' | 'timestamp'>>,
    ) => {
      const error: ContractError = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }
      state.contractErrors.push(error)
    },
    addNetworkError: (
      state,
      action: PayloadAction<Omit<NetworkError, 'id' | 'timestamp'>>,
    ) => {
      const error: NetworkError = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }
      state.networkErrors.push(error)
    },
    addGeneralError: (state, action: PayloadAction<string>) => {
      state.generalErrors.push(action.payload)
    },
    clearContractError: (state, action: PayloadAction<string>) => {
      state.contractErrors = state.contractErrors.filter(
        (error) => error.id !== action.payload,
      )
    },
    clearNetworkError: (state, action: PayloadAction<string>) => {
      state.networkErrors = state.networkErrors.filter(
        (error) => error.id !== action.payload,
      )
    },
    clearGeneralError: (state, action: PayloadAction<string>) => {
      state.generalErrors = state.generalErrors.filter(
        (error) => error !== action.payload,
      )
    },
    clearAllErrors: (state) => {
      state.contractErrors = []
      state.networkErrors = []
      state.generalErrors = []
    },
    clearOldErrors: (state) => {
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000

      state.contractErrors = state.contractErrors.filter(
        (error) => now - error.timestamp < fiveMinutes,
      )
      state.networkErrors = state.networkErrors.filter(
        (error) => now - error.timestamp < fiveMinutes,
      )
    },
  },
})

export const {
  addContractError,
  addNetworkError,
  addGeneralError,
  clearContractError,
  clearNetworkError,
  clearGeneralError,
  clearAllErrors,
  clearOldErrors,
} = errorsSlice.actions

export default errorsSlice.reducer
