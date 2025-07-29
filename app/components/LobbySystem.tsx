import {
  useStateTogether,
  useStateTogetherWithPerUserValues,
  useConnectedUsers,
  useMyId,
} from 'react-together'
import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { GAME_PHASES } from '../lib/constants'
import {
  useWriteMirrorPitCreateLobby,
  useWriteMirrorPitJoinGame,
  useWriteMirrorPitDistributePrizes,
  useWriteMirrorPitDeleteLobby,
  useReadMirrorPitHasPlayerJoined,
  mirrorPitAbi,
} from '../generated'
import { web3config } from '../dapp.config'
import { GameArena } from './GameArena'
import { formatPlayerId } from '../lib/utils'

// Lightweight lobby summary
interface LobbySummary {
  id: string
  name: string
  entryFeeWei: string // stringify BigInt
  minPlayers: number
  creator: string
}

// Per-lobby player state
interface LobbyPlayers {
  players: string[]
  paidPlayers: Array<{ userId: string; walletAddress: string }>
}

interface LobbySystemProps {
  onActiveLobbyChange?: (lobbyId: string | null) => void
}

interface Message {
  userId: string
  text: string
  timestamp: number
}

// Lobby Item Component
const LobbyItem = ({
  lobby,
  isConnected,
  isJoining,
  paidStatusMap,
  onJoin,
  onDelete,
  canDelete,
}: {
  lobby: LobbySummary
  isConnected: boolean
  isJoining: boolean
  paidStatusMap: Record<string, boolean>
  onJoin: (id: string) => void
  onDelete: (id: string) => void
  canDelete: boolean
}) => {
  const [lobbyPlayers] = useStateTogether<LobbyPlayers>(
    `lobby-${lobby.id}-players`,
    { players: [], paidPlayers: [] },
  )

  // Format entry fee with fallback
  const formattedEntryFee = lobby?.entryFeeWei
    ? formatEther(BigInt(lobby.entryFeeWei))
    : '0'

  // Ensure players array exists
  const playerCount = lobbyPlayers?.players?.length || 0

  return (
    <div key={lobby.id} className="p-4 bg-white/5 rounded-lg backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold">{lobby.name}</h3>
          <p className="text-sm text-gray-400">
            {playerCount} / {lobby.minPlayers} players • Entry:{' '}
            {formattedEntryFee} MON
          </p>
          <p className="text-xs text-gray-500 mt-1">Game ID: {lobby.id}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onJoin(lobby.id)}
            disabled={!isConnected || isJoining}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {isJoining
              ? 'Joining...'
              : paidStatusMap[lobby.id]
              ? 'Rejoin'
              : 'Join'}
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(lobby.id)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LobbySystem({ onActiveLobbyChange }: LobbySystemProps) {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync: createLobbyContract } =
    useWriteMirrorPitCreateLobby()
  const { writeContractAsync: joinGameContract } = useWriteMirrorPitJoinGame()
  const { writeContractAsync: distributePrizesContract } =
    useWriteMirrorPitDistributePrizes()
  const { writeContractAsync: deleteLobbyContract } =
    useWriteMirrorPitDeleteLobby()

  // Global lobbies state - lightweight summaries only
  const [lobbies, setLobbies] = useStateTogether<LobbySummary[]>('lobbies', [])

  // Current user's active lobby - don't reset on disconnect anymore
  const [activeLobby, setActiveLobbyState] = useStateTogetherWithPerUserValues<
    string | null
  >('active-lobby', null, { resetOnDisconnect: false })

  // Notify parent component when active lobby changes
  useEffect(() => {
    onActiveLobbyChange?.(activeLobby)
  }, [activeLobby, onActiveLobbyChange])

  // Wrapper to ensure we update both local and parent state
  const setActiveLobby = (lobbyId: string | null) => {
    setActiveLobbyState(lobbyId)
    onActiveLobbyChange?.(lobbyId)
  }

  // Get current lobby data
  const currentLobby = lobbies.find((l) => l.id === activeLobby)

  // Get game state for the current lobby
  const [gameState] = useStateTogether(
    currentLobby ? `game-${currentLobby.id}-state` : '',
    {
      round: 1,
      phase: GAME_PHASES.READY_CHECK,
      submissions: {},
      eliminated: [],
      timeRemaining: 30,
      winners: [],
      readyPlayers: [],
    },
  )

  // Per-lobby state when active
  const [lobbyPlayers, setLobbyPlayers] = useStateTogether<LobbyPlayers>(
    currentLobby ? `lobby-${currentLobby.id}-players` : '',
    { players: [], paidPlayers: [] },
  )

  const [lobbyMessages, setLobbyMessages] = useStateTogether<Message[]>(
    currentLobby ? `lobby-${currentLobby.id}-chat` : '',
    [],
  )

  const myId = useMyId()
  const connectedUsers = useConnectedUsers()
  const [newLobbyName, setNewLobbyName] = useState('')
  const [entryFee, setEntryFee] = useState('0.01')
  const [minPlayers, setMinPlayers] = useState(2)
  const [messageText, setMessageText] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [joiningLobbyId, setJoiningLobbyId] = useState<string | null>(null)

  // Track paid status for all lobbies
  const [paidStatusMap, setPaidStatusMap] = useState<Record<string, boolean>>(
    {},
  )

  // Check paid status for all lobbies
  useEffect(() => {
    if (!address || !lobbies) return

    const checkAllLobbies = async () => {
      const statusMap: Record<string, boolean> = {}
      for (const lobby of lobbies) {
        const paid = await hasUserPaid(lobby.id)
        statusMap[lobby.id] = paid
      }
      setPaidStatusMap(statusMap)
    }

    checkAllLobbies()
  }, [address, lobbies])

  // Check if player has already paid from contract
  const checkContractPayment = async (
    gameId: string,
    playerAddress: string,
  ): Promise<boolean> => {
    if (!isConnected || !address) return false

    try {
      const hasJoined = await publicClient?.readContract({
        address: web3config.contractAddress as `0x${string}`,
        abi: mirrorPitAbi,
        functionName: 'hasPlayerJoined',
        args: [BigInt(gameId), playerAddress as `0x${string}`],
      })
      return hasJoined ?? false
    } catch (error) {
      console.error('Failed to check payment status:', error)
      return false
    }
  }

  // Handle MultiSync reconnection
  useEffect(() => {
    const handleReconnection = async () => {
      if (!address || !activeLobby) return

      // Check if player has already paid for this lobby
      const hasPaid = await checkContractPayment(activeLobby, address)

      if (hasPaid) {
        // If paid, update react-together state to reflect this
        setLobbyPlayers((prev) => ({
          players: [...new Set([...prev.players, myId as string])],
          paidPlayers: [
            ...prev.paidPlayers.filter((p) => p.userId !== myId),
            { userId: myId as string, walletAddress: address },
          ],
        }))
      }
    }

    handleReconnection()
  }, [myId, address, activeLobby])

  // Create a new lobby
  const createLobby = async () => {
    if (!isConnected || !address || !newLobbyName.trim() || !publicClient)
      return

    try {
      setIsCreating(true)
      const entryFeeWei = parseEther(entryFee)

      // Create vault in contract
      const hash = await createLobbyContract({
        address: web3config.contractAddress as `0x${string}`,
        args: [entryFeeWei, BigInt(minPlayers)],
      })

      // Wait for transaction and get game ID
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const event = receipt?.logs[0]
      if (!event?.topics[1]) {
        console.error('No game ID in event')
        return
      }

      const gameId = event.topics[1]
      console.log('Game ID:', gameId)

      // Create lightweight lobby summary
      const newLobby: LobbySummary = {
        id: gameId,
        name: newLobbyName.trim(),
        entryFeeWei: entryFeeWei.toString(), // stringify BigInt
        minPlayers,
        creator: address,
      }

      setLobbies((prev) => [...prev, newLobby])
      setNewLobbyName('')
    } catch (error) {
      console.error('Failed to create lobby:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Join a lobby
  const joinLobby = async (gameId: string) => {
    if (!isConnected || !address || !myId) return

    const lobby = lobbies.find((l) => l.id === gameId)
    if (!lobby) return

    try {
      setJoiningLobbyId(gameId)

      // First check if already paid
      const hasPaid = await checkContractPayment(gameId, address)

      // Only pay if haven't paid before
      if (!hasPaid) {
        await joinGameContract({
          address: web3config.contractAddress as `0x${string}`,
          args: [BigInt(gameId)],
          value: BigInt(lobby.entryFeeWei),
        })
      }

      // Join react-together lobby
      setActiveLobby(gameId)

      // Update lobby players - ensure arrays exist with fallbacks
      setLobbyPlayers((prev) => ({
        players: [...new Set([...(prev?.players || []), myId])],
        paidPlayers: [
          ...(prev?.paidPlayers || []).filter((p) => p.userId !== myId),
          { userId: myId, walletAddress: address },
        ],
      }))
    } catch (error) {
      console.error('Failed to join lobby:', error)
    } finally {
      setJoiningLobbyId(null)
    }
  }

  // Leave current lobby
  const leaveLobby = () => {
    if (!activeLobby || !myId) return

    setLobbyPlayers((prev) => ({
      ...prev,
      players: prev.players.filter((id) => id !== myId),
    }))
    setActiveLobby(null)
  }

  // Send a message in current lobby
  const sendMessage = () => {
    if (!messageText.trim() || !activeLobby || !myId) return

    const message: Message = {
      userId: myId,
      text: messageText.trim(),
      timestamp: Date.now(),
    }

    setLobbyMessages((prev) => {
      const currentMessages = Array.isArray(prev) ? prev : []
      return [...currentMessages, message]
    })
    setMessageText('')
  }

  // End game and distribute prizes
  const endGame = async (gameId: string, winners: string[]) => {
    if (!isConnected) return

    try {
      // Distribute prizes through contract
      await distributePrizesContract({
        address: web3config.contractAddress as `0x${string}`,
        args: [BigInt(gameId), winners as `0x${string}`[]],
      })
    } catch (error) {
      console.error('Failed to end game:', error)
    }
  }

  // Check if current user has paid entry fee for a lobby
  const hasUserPaid = async (lobbyId: string) => {
    if (!address || !lobbies) return false

    // First check react-together state
    const lobby = lobbies.find((l) => l.id === lobbyId)
    if (!lobby) return false

    // If not in react-together state, check contract
    return await checkContractPayment(lobbyId, address)
  }

  // Delete a lobby
  const deleteLobby = async (gameId: string) => {
    if (!isConnected || !address) return

    try {
      await deleteLobbyContract({
        address: web3config.contractAddress as `0x${string}`,
        args: [BigInt(gameId)],
      })

      // Remove from react-together state
      setLobbies((prev) => prev.filter((lobby) => lobby.id !== gameId))
    } catch (error) {
      console.error('Failed to delete lobby:', error)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        {activeLobby ? 'Game Arena' : 'Lobbies'}
      </h1>

      {/* Create Lobby Form - Only show if not in a lobby */}
      {!activeLobby && (
        <div className="mb-8 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newLobbyName}
                onChange={(e) => setNewLobbyName(e.target.value)}
                placeholder="Enter lobby name..."
                className="flex-1 px-4 py-2 bg-white/10 rounded border border-white/20 text-white"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">
                  Entry Fee (MON)
                </label>
                <input
                  type="number"
                  value={entryFee}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || parseFloat(value) >= 0) {
                      setEntryFee(value)
                    }
                  }}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-white/10 rounded border border-white/20 text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">
                  Min Players
                </label>
                <input
                  type="number"
                  value={minPlayers}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    if (!isNaN(value) && value >= 2) {
                      setMinPlayers(value)
                    }
                  }}
                  min="2"
                  className="w-full px-4 py-2 bg-white/10 rounded border border-white/20 text-white"
                />
              </div>
            </div>
            <button
              onClick={createLobby}
              disabled={!isConnected || isCreating || !newLobbyName.trim()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {isCreating ? 'Creating...' : 'Create Lobby'}
            </button>
            {!isConnected && (
              <p className="text-sm text-red-400">
                Connect wallet to create lobbies
              </p>
            )}
          </div>
        </div>
      )}

      {/* Active Lobby Chat or Lobby List */}
      {currentLobby && lobbyPlayers ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{currentLobby.name}</h2>
              <p className="text-sm text-gray-400">
                Entry Fee: {formatEther(BigInt(currentLobby.entryFeeWei))} MON •
                Min Players: {currentLobby.minPlayers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Game ID: {currentLobby.id}
              </p>
            </div>
            <button
              onClick={leaveLobby}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Leave Lobby
            </button>
          </div>

          {/* Players List */}
          <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm">
            <h3 className="font-bold mb-2">Players:</h3>
            <div className="flex flex-wrap gap-2">
              {(lobbyPlayers?.players || []).map((playerId) => {
                const user = connectedUsers?.find((u) => u.userId === playerId)
                const hasPaid =
                  address &&
                  (lobbyPlayers?.paidPlayers || []).some(
                    (p) => p.userId === playerId && p.walletAddress === address,
                  )
                return (
                  <span
                    key={playerId}
                    className={`px-3 py-1 rounded-full text-sm ${
                      hasPaid ? 'bg-green-500/20' : 'bg-white/10'
                    }`}
                  >
                    {user?.nickname || formatPlayerId(playerId)}
                    {playerId === myId && ' (You)'}
                    {hasPaid && ' ✓'}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <div
              className={`arena ${
                gameState?.phase === GAME_PHASES.READY_CHECK
                  ? 'w-1/4'
                  : 'w-full'
              }`}
            >
              <GameArena
                lobbyId={currentLobby.id}
                minPlayers={currentLobby.minPlayers}
              />
            </div>
            {gameState?.phase === GAME_PHASES.READY_CHECK && (
              <div className="chat w-3/4">
                {/* Chat Messages */}
                <div className="h-84 p-4 bg-white/5 rounded-lg backdrop-blur-sm space-y-4 overflow-y-auto">
                  {Array.isArray(lobbyMessages) &&
                    lobbyMessages.map((msg, idx) => {
                      const user = connectedUsers?.find(
                        (u) => u.userId === msg.userId,
                      )
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            msg.userId === myId
                              ? 'bg-blue-500/20 ml-auto'
                              : 'bg-white/10'
                          } max-w-[80%]`}
                        >
                          <div className="text-sm font-bold mb-1">
                            {user?.nickname || formatPlayerId(msg.userId)}
                            {msg.userId === myId && ' (You)'}
                          </div>
                          <div>{msg.text}</div>
                        </div>
                      )
                    })}
                </div>

                {/* Message Input */}
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-white/10 rounded border border-white/20 text-white"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Lobbies</h2>
          {!lobbies || lobbies.length === 0 ? (
            <div className="text-center p-8 bg-white/5 rounded-lg backdrop-blur-sm">
              <p className="text-gray-400">No lobbies available. Create one!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {(lobbies || []).map((lobby) => (
                <LobbyItem
                  key={lobby.id}
                  lobby={lobby}
                  isConnected={isConnected}
                  isJoining={joiningLobbyId === lobby.id}
                  paidStatusMap={paidStatusMap}
                  onJoin={joinLobby}
                  onDelete={deleteLobby}
                  canDelete={address === lobby.creator}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
