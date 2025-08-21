# Redux Store Implementation

This document describes the Redux state management implementation for the Mirror Pit application.

## Store Structure

The store is organized into 7 slices:

### 1. Forms (`formsSlice`)

Manages form state across the application.

**State:**

```typescript
{
  lobbyCreation: {
    name: string
    entryFee: string
    minPlayers: number
    isCreating: boolean
  }
  chat: {
    messageText: string
  }
}
```

**Usage:**

```typescript
import { useAppDispatch, useAppSelector } from '@/app/lib/store/hooks'
import { setLobbyName, setEntryFee, resetLobbyForm } from '@/app/lib/store'

// In component
const dispatch = useAppDispatch()
const { lobbyCreation } = useAppSelector((state) => state.forms)

// Update form
dispatch(setLobbyName('My Lobby'))
dispatch(setEntryFee('0.05'))
dispatch(resetLobbyForm())
```

### 2. Loading (`loadingSlice`)

Manages loading states for async operations.

**State:**

```typescript
{
  creatingLobby: boolean
  joiningLobby: string | null // lobby ID if joining
  distributingPrizes: boolean
  deletingLobby: string | null // lobby ID if deleting
  checkingPayment: boolean
}
```

**Usage:**

```typescript
import { setCreatingLobby, setJoiningLobby } from '@/app/lib/store'

// Start loading
dispatch(setCreatingLobby(true))
dispatch(setJoiningLobby('lobby-123'))

// Stop loading
dispatch(setCreatingLobby(false))
dispatch(setJoiningLobby(null))
```

### 3. Errors (`errorsSlice`)

Manages error states and messages.

**State:**

```typescript
{
  contractErrors: ContractError[]
  networkErrors: NetworkError[]
  generalErrors: string[]
}
```

**Usage:**

```typescript
import {
  addContractError,
  addNetworkError,
  clearAllErrors,
} from '@/app/lib/store'

// Add errors
dispatch(
  addContractError({
    message: 'Failed to create lobby',
    type: 'create',
    lobbyId: 'lobby-123',
  }),
)

dispatch(
  addNetworkError({
    message: 'Network connection lost',
    retryable: true,
  }),
)

// Clear errors
dispatch(clearAllErrors())
```

### 4. UI (`uiSlice`)

Manages UI state like modals, sidebar, theme.

**State:**

```typescript
{
  theme: 'dark' | 'light'
  sidebar: {
    isOpen: boolean
    activeTab: string
  }
  modals: {
    confirmDelete: {
      isOpen: boolean
      lobbyId: string | null
    }
    gameRules: boolean
    settings: boolean
  }
  showGameTitle: boolean
  animationsEnabled: boolean
}
```

**Usage:**

```typescript
import { toggleTheme, openConfirmDelete, setSidebarOpen } from '@/app/lib/store'

// UI actions
dispatch(toggleTheme())
dispatch(openConfirmDelete('lobby-123'))
dispatch(setSidebarOpen(true))
```

### 5. User Preferences (`userPreferencesSlice`)

Manages user settings and preferences.

**State:**

```typescript
{
  soundEnabled: boolean
  animationsEnabled: boolean
  autoReady: boolean
  defaultEntryFee: string
  defaultMinPlayers: number
  notifications: {
    gameStart: boolean
    prizeDistribution: boolean
    playerJoined: boolean
    roundComplete: boolean
  }
  showPlayerNames: boolean
  showGameTimer: boolean
  compactMode: boolean
}
```

**Usage:**

```typescript
import { setSoundEnabled, setAutoReady, setNotification } from '@/app/lib/store'

// Update preferences
dispatch(setSoundEnabled(false))
dispatch(setAutoReady(true))
dispatch(setNotification({ key: 'gameStart', enabled: false }))
```

### 6. Navigation (`navigationSlice`)

Manages navigation state and breadcrumbs.

**State:**

```typescript
{
  currentView: 'lobbies' | 'game' | 'settings' | 'rules'
  activeLobbyId: string | null
  previousLobbyId: string | null
  breadcrumbs: Breadcrumb[]
  lastVisitedLobby: string | null
}
```

**Usage:**

```typescript
import { navigateToGame, setActiveLobby, goBack } from '@/app/lib/store'

// Navigation
dispatch(navigateToGame('lobby-123'))
dispatch(setActiveLobby('lobby-456'))
dispatch(goBack())
```

### 7. Game Config (`gameConfigSlice`)

Manages game configuration and settings.

**State:**

```typescript
{
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
```

**Usage:**

```typescript
import {
  setRoundDuration,
  setComboLength,
  addGameAction,
} from '@/app/lib/store'

// Game config
dispatch(setRoundDuration(60))
dispatch(setComboLength(4))
dispatch(addGameAction('dash'))
```

## Integration with Existing Components

### Current State Management

- **React Together**: Real-time multiplayer state (game state, lobby players, chat)
- **Wagmi**: Web3 interactions and wallet state
- **Local State**: Component-specific UI state

### New Redux Integration

- **Forms**: Replace scattered useState for form inputs
- **Loading**: Centralized loading states
- **Errors**: Global error handling
- **UI**: Theme, modals, sidebar state
- **Preferences**: User settings persistence
- **Navigation**: View management and breadcrumbs
- **Game Config**: Centralized game settings

## Migration Strategy

1. **Phase 1**: Start with forms and loading states
2. **Phase 2**: Add error handling and UI state
3. **Phase 3**: Implement preferences and navigation
4. **Phase 4**: Add game configuration

## Best Practices

1. **Use typed hooks**: Always use `useAppDispatch` and `useAppSelector`
2. **Select specific state**: Don't select entire slices, select specific properties
3. **Action naming**: Use descriptive action names
4. **Error handling**: Always handle errors in Redux
5. **Loading states**: Use loading states for all async operations

## Example Component Migration

**Before (Local State):**

```typescript
const [lobbyName, setLobbyName] = useState('')
const [entryFee, setEntryFee] = useState('0.01')
const [isCreating, setIsCreating] = useState(false)
```

**After (Redux):**

```typescript
const dispatch = useAppDispatch()
const { name, entryFee, isCreating } = useAppSelector(
  (state) => state.forms.lobbyCreation,
)

// Update form
dispatch(setLobbyName('New Lobby'))
dispatch(setEntryFee('0.05'))
dispatch(setLobbyCreating(true))
```

This provides better state management, persistence, and debugging capabilities.
