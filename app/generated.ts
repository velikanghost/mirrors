import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MirrorPit
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mirrorPitAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'OPERATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'activeGamesCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'entryFee', internalType: 'uint256', type: 'uint256' },
      { name: 'minPlayers', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createLobby',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'gameId', internalType: 'uint256', type: 'uint256' },
      { name: 'winners', internalType: 'address[]', type: 'address[]' },
    ],
    name: 'distributePrizes',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'games',
    outputs: [
      { name: 'exists', internalType: 'bool', type: 'bool' },
      { name: 'active', internalType: 'bool', type: 'bool' },
      { name: 'prizePool', internalType: 'uint256', type: 'uint256' },
      { name: 'entryFee', internalType: 'uint256', type: 'uint256' },
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'minPlayers', internalType: 'uint256', type: 'uint256' },
      { name: 'readyPlayersCount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'gameId', internalType: 'uint256', type: 'uint256' }],
    name: 'getGameInfo',
    outputs: [
      { name: 'exists', internalType: 'bool', type: 'bool' },
      { name: 'active', internalType: 'bool', type: 'bool' },
      { name: 'prizePool', internalType: 'uint256', type: 'uint256' },
      { name: 'entryFee', internalType: 'uint256', type: 'uint256' },
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'minPlayers', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'gameId', internalType: 'uint256', type: 'uint256' },
      { name: 'player', internalType: 'address', type: 'address' },
    ],
    name: 'hasPlayerJoined',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'gameId', internalType: 'uint256', type: 'uint256' }],
    name: 'joinGame',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxLobbies',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_maxLobbies', internalType: 'uint256', type: 'uint256' }],
    name: 'setMaxLobbies',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'gameId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'creator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'entryFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'minPlayers',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LobbyCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newMaxLobbies',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MaxLobbiesUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'gameId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PlayerJoined',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'gameId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'PlayerReady',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'gameId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'PlayerUnready',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'gameId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'winners',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
      {
        name: 'prizePerWinner',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PrizesDistributed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'GameNotActive' },
  {
    type: 'error',
    inputs: [
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientBalance',
  },
  { type: 'error', inputs: [], name: 'InvalidAmount' },
  { type: 'error', inputs: [], name: 'InvalidGameId' },
  { type: 'error', inputs: [], name: 'InvalidMinPlayers' },
  { type: 'error', inputs: [], name: 'MaxLobbiesReached' },
  { type: 'error', inputs: [], name: 'NotAllPlayersReady' },
  { type: 'error', inputs: [], name: 'PlayerNotJoined' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'TransferFailed' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mirrorPitAbi}__
 */
export const useReadMirrorPit = /*#__PURE__*/ createUseReadContract({
  abi: mirrorPitAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadMirrorPitDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: mirrorPitAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"OPERATOR_ROLE"`
 */
export const useReadMirrorPitOperatorRole = /*#__PURE__*/ createUseReadContract(
  { abi: mirrorPitAbi, functionName: 'OPERATOR_ROLE' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"activeGamesCount"`
 */
export const useReadMirrorPitActiveGamesCount =
  /*#__PURE__*/ createUseReadContract({
    abi: mirrorPitAbi,
    functionName: 'activeGamesCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"games"`
 */
export const useReadMirrorPitGames = /*#__PURE__*/ createUseReadContract({
  abi: mirrorPitAbi,
  functionName: 'games',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"getGameInfo"`
 */
export const useReadMirrorPitGetGameInfo = /*#__PURE__*/ createUseReadContract({
  abi: mirrorPitAbi,
  functionName: 'getGameInfo',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadMirrorPitGetRoleAdmin = /*#__PURE__*/ createUseReadContract(
  { abi: mirrorPitAbi, functionName: 'getRoleAdmin' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"hasPlayerJoined"`
 */
export const useReadMirrorPitHasPlayerJoined =
  /*#__PURE__*/ createUseReadContract({
    abi: mirrorPitAbi,
    functionName: 'hasPlayerJoined',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadMirrorPitHasRole = /*#__PURE__*/ createUseReadContract({
  abi: mirrorPitAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"maxLobbies"`
 */
export const useReadMirrorPitMaxLobbies = /*#__PURE__*/ createUseReadContract({
  abi: mirrorPitAbi,
  functionName: 'maxLobbies',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadMirrorPitSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: mirrorPitAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mirrorPitAbi}__
 */
export const useWriteMirrorPit = /*#__PURE__*/ createUseWriteContract({
  abi: mirrorPitAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"createLobby"`
 */
export const useWriteMirrorPitCreateLobby =
  /*#__PURE__*/ createUseWriteContract({
    abi: mirrorPitAbi,
    functionName: 'createLobby',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"distributePrizes"`
 */
export const useWriteMirrorPitDistributePrizes =
  /*#__PURE__*/ createUseWriteContract({
    abi: mirrorPitAbi,
    functionName: 'distributePrizes',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteMirrorPitGrantRole = /*#__PURE__*/ createUseWriteContract({
  abi: mirrorPitAbi,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"joinGame"`
 */
export const useWriteMirrorPitJoinGame = /*#__PURE__*/ createUseWriteContract({
  abi: mirrorPitAbi,
  functionName: 'joinGame',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteMirrorPitRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: mirrorPitAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteMirrorPitRevokeRole = /*#__PURE__*/ createUseWriteContract(
  { abi: mirrorPitAbi, functionName: 'revokeRole' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"setMaxLobbies"`
 */
export const useWriteMirrorPitSetMaxLobbies =
  /*#__PURE__*/ createUseWriteContract({
    abi: mirrorPitAbi,
    functionName: 'setMaxLobbies',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mirrorPitAbi}__
 */
export const useSimulateMirrorPit = /*#__PURE__*/ createUseSimulateContract({
  abi: mirrorPitAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"createLobby"`
 */
export const useSimulateMirrorPitCreateLobby =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mirrorPitAbi,
    functionName: 'createLobby',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"distributePrizes"`
 */
export const useSimulateMirrorPitDistributePrizes =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mirrorPitAbi,
    functionName: 'distributePrizes',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateMirrorPitGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mirrorPitAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"joinGame"`
 */
export const useSimulateMirrorPitJoinGame =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mirrorPitAbi,
    functionName: 'joinGame',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateMirrorPitRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mirrorPitAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateMirrorPitRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mirrorPitAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mirrorPitAbi}__ and `functionName` set to `"setMaxLobbies"`
 */
export const useSimulateMirrorPitSetMaxLobbies =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mirrorPitAbi,
    functionName: 'setMaxLobbies',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mirrorPitAbi}__
 */
export const useWatchMirrorPitEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: mirrorPitAbi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mirrorPitAbi}__ and `eventName` set to `"LobbyCreated"`
 */
export const useWatchMirrorPitLobbyCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mirrorPitAbi,
    eventName: 'LobbyCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mirrorPitAbi}__ and `eventName` set to `"MaxLobbiesUpdated"`
 */
export const useWatchMirrorPitMaxLobbiesUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mirrorPitAbi,
    eventName: 'MaxLobbiesUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mirrorPitAbi}__ and `eventName` set to `"PlayerJoined"`
 */
export const useWatchMirrorPitPlayerJoinedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mirrorPitAbi,
    eventName: 'PlayerJoined',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mirrorPitAbi}__ and `eventName` set to `"PlayerReady"`
 */
export const useWatchMirrorPitPlayerReadyEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mirrorPitAbi,
    eventName: 'PlayerReady',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mirrorPitAbi}__ and `eventName` set to `"PlayerUnready"`
 */
export const useWatchMirrorPitPlayerUnreadyEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mirrorPitAbi,
    eventName: 'PlayerUnready',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mirrorPitAbi}__ and `eventName` set to `"PrizesDistributed"`
 */
export const useWatchMirrorPitPrizesDistributedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mirrorPitAbi,
    eventName: 'PrizesDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mirrorPitAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchMirrorPitRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mirrorPitAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mirrorPitAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchMirrorPitRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mirrorPitAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mirrorPitAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchMirrorPitRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mirrorPitAbi,
    eventName: 'RoleRevoked',
  })
