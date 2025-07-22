import {
  useStateTogether,
  useStateTogetherWithPerUserValues,
  useConnectedUsers,
  useMyId,
} from 'react-together'
import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import {
  useWriteMirrorPitCreateLobby,
  useWriteMirrorPitJoinGame,
  useWriteMirrorPitDistributePrizes,
  useReadMirrorPitHasPlayerJoined,
  mirrorPitAbi,
} from '../generated'
import { web3config } from '../dapp.config'

interface Lobby {
  id: string // Contract's game ID used for everything
  name: string
  players: string[]
  messages: Message[]
  entryFee: bigint
  minPlayers: number
  creator: string
  paidPlayers: string[] // Track addresses that have paid entry fee
  winners?: string[] // Track winners when game ends
}

interface Message {
  userId: string
  text: string
  timestamp: number
}

export default function LobbySystem() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync: createLobbyContract } =
    useWriteMirrorPitCreateLobby()
  const { writeContractAsync: joinGameContract } = useWriteMirrorPitJoinGame()
  const { writeContractAsync: distributePrizesContract } =
    useWriteMirrorPitDistributePrizes()

  // Global lobbies state managed by react-together
  const [lobbies, setLobbies] = useStateTogether<Lobby[]>('lobbies', [])

  // Current user's active lobby - don't reset on disconnect anymore
  const [activeLobby, setActiveLobby] = useStateTogetherWithPerUserValues<
    string | null
  >('active-lobby', null, { resetOnDisconnect: false })

  const myId = useMyId()
  const connectedUsers = useConnectedUsers()
  const [newLobbyName, setNewLobbyName] = useState('')
  const [entryFee, setEntryFee] = useState('0.01')
  const [minPlayers, setMinPlayers] = useState(2)
  const [messageText, setMessageText] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  // Track paid status for all lobbies
  const [paidStatusMap, setPaidStatusMap] = useState<Record<string, boolean>>(
    {},
  )

  // Check paid status for all lobbies
  useEffect(() => {
    if (!address) return

    const checkAllLobbies = async () => {
      const statusMap: Record<string, boolean> = {}
      for (const lobby of lobbies) {
        const paid = await hasUserPaid(lobby)
        statusMap[lobby?.id ?? ''] = paid ?? false
      }
      setPaidStatusMap(statusMap)
    }

    checkAllLobbies()
  }, [address, lobbies])

  // Check if player has already paid from contract
  const checkContractPayment = async (
    gameId: string,
    playerAddress: string,
  ) => {
    if (!isConnected || !address) return false

    try {
      const hasJoined = await publicClient?.readContract({
        address: web3config.contractAddress as `0x${string}`,
        abi: mirrorPitAbi,
        functionName: 'hasPlayerJoined',
        args: [BigInt(gameId), playerAddress as `0x${string}`],
      })
      return hasJoined
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
        setLobbies((prev) =>
          prev.map((lobby) =>
            lobby.id === activeLobby
              ? {
                  ...lobby,
                  players: [...new Set([...lobby.players, myId as string])],
                  paidPlayers: [...new Set([...lobby.paidPlayers, address])],
                }
              : lobby,
          ),
        )
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

      // Create react-together lobby with contract gameId
      const newLobby: Lobby = {
        id: gameId,
        name: newLobbyName.trim(),
        players: [],
        messages: [],
        entryFee: entryFeeWei,
        minPlayers,
        creator: address,
        paidPlayers: [],
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
      setIsJoining(true)

      // First check if already paid
      const hasPaid = await checkContractPayment(gameId, address)

      // Only pay if haven't paid before
      if (!hasPaid) {
        await joinGameContract({
          address: web3config.contractAddress as `0x${string}`,
          args: [BigInt(gameId)],
          value: lobby.entryFee,
        })
      }

      // Join react-together lobby
      setActiveLobby(gameId)
      setLobbies((prev) =>
        prev.map((l) =>
          l.id === gameId
            ? {
                ...l,
                players: [...new Set([...l.players, myId as string])],
                paidPlayers: [...new Set([...l.paidPlayers, address])],
              }
            : l,
        ),
      )
    } catch (error) {
      console.error('Failed to join lobby:', error)
    } finally {
      setIsJoining(false)
    }
  }

  // Leave current lobby
  const leaveLobby = () => {
    if (!activeLobby || !myId) return

    setLobbies((prev) =>
      prev.map((lobby) =>
        lobby.id === activeLobby
          ? { ...lobby, players: lobby.players.filter((id) => id !== myId) }
          : lobby,
      ),
    )
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

    setLobbies((prev) =>
      prev.map((lobby) =>
        lobby.id === activeLobby
          ? { ...lobby, messages: [...lobby.messages, message] }
          : lobby,
      ),
    )
    setMessageText('')
  }

  // End game and distribute prizes
  const endGame = async (gameId: string, winners: string[]) => {
    if (!isConnected) return

    try {
      // Update winners in react-together state
      setLobbies((prev) =>
        prev.map((lobby) =>
          lobby.id === gameId ? { ...lobby, winners } : lobby,
        ),
      )

      // Distribute prizes through contract
      await distributePrizesContract({
        address: web3config.contractAddress as `0x${string}`,
        args: [BigInt(gameId), winners as `0x${string}`[]],
      })
    } catch (error) {
      console.error('Failed to end game:', error)
    }
  }

  // Get current lobby data
  const currentLobby = lobbies.find((lobby) => lobby.id === activeLobby)

  // Check if current user has paid entry fee for a lobby
  const hasUserPaid = async (lobby: Lobby) => {
    if (!address) return false

    // First check react-together state
    if (lobby.paidPlayers.includes(address)) return true

    // If not in react-together state, check contract
    return await checkContractPayment(lobby.id, address)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Lobby System</h1>

      {/* Create Lobby Form */}
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
                onChange={(e) => setEntryFee(e.target.value)}
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
                onChange={(e) => setMinPlayers(parseInt(e.target.value))}
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

      {/* Active Lobby Chat or Lobby List */}
      {currentLobby ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{currentLobby.name}</h2>
              <p className="text-sm text-gray-400">
                Entry Fee: {formatEther(currentLobby.entryFee)} MON • Min
                Players: {currentLobby.minPlayers}
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
              {currentLobby.players.map((playerId) => {
                const user = connectedUsers.find((u) => u.userId === playerId)
                const hasPaid =
                  address && currentLobby.paidPlayers.includes(address)
                return (
                  <span
                    key={playerId}
                    className={`px-3 py-1 rounded-full text-sm ${
                      hasPaid ? 'bg-green-500/20' : 'bg-white/10'
                    }`}
                  >
                    {user?.nickname || `Player ${playerId.slice(-4)}`}
                    {playerId === myId && ' (You)'}
                    {hasPaid && ' ✓'}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 p-4 bg-white/5 rounded-lg backdrop-blur-sm space-y-4 overflow-y-auto">
            {currentLobby.messages.map((msg, idx) => {
              const user = connectedUsers.find((u) => u.userId === msg.userId)
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
                    {user?.nickname || `Player ${msg.userId.slice(-4)}`}
                    {msg.userId === myId && ' (You)'}
                  </div>
                  <div>{msg.text}</div>
                </div>
              )
            })}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
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
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Lobbies</h2>
          {lobbies.length === 0 ? (
            <div className="text-center p-8 bg-white/5 rounded-lg backdrop-blur-sm">
              <p className="text-gray-400">No lobbies available. Create one!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {lobbies.map((lobby) => (
                <div
                  key={lobby.id}
                  className="p-4 bg-white/5 rounded-lg backdrop-blur-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{lobby.name}</h3>
                      <p className="text-sm text-gray-400">
                        {lobby.players.length} / {lobby.minPlayers} players •
                        Entry: {formatEther(lobby.entryFee)} MON
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Game ID: {lobby.id}
                      </p>
                    </div>
                    <button
                      onClick={() => joinLobby(lobby.id)}
                      disabled={!isConnected || isJoining}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition"
                    >
                      {isJoining
                        ? 'Joining...'
                        : paidStatusMap[lobby.id]
                        ? 'Rejoin'
                        : 'Join'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
