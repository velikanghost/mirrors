import {
  useStateTogether,
  useStateTogetherWithPerUserValues,
  useConnectedUsers,
  useMyId,
} from 'react-together'
import { useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import {
  useWriteMirrorPitCreateLobby,
  useWriteMirrorPitJoinGame,
  useReadMirrorPitGetGameInfo,
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

  // Global lobbies state
  const [lobbies, setLobbies] = useStateTogether<Lobby[]>('lobbies', [])

  // Current user's active lobby
  const [activeLobby, setActiveLobby] = useStateTogetherWithPerUserValues<
    string | null
  >('active-lobby', null, { resetOnDisconnect: true })

  const myId = useMyId()
  const connectedUsers = useConnectedUsers()
  const [newLobbyName, setNewLobbyName] = useState('')
  const [entryFee, setEntryFee] = useState('0.01')
  const [minPlayers, setMinPlayers] = useState(2)
  const [messageText, setMessageText] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  // Create a new lobby
  const createLobby = async () => {
    if (!isConnected || !address || !newLobbyName.trim() || !publicClient)
      return

    try {
      setIsCreating(true)
      const entryFeeWei = parseEther(entryFee)

      // Create lobby on-chain with raw numbers
      const hash = await createLobbyContract({
        address: web3config.contractAddress as `0x${string}`,
        args: [entryFeeWei, BigInt(minPlayers)],
      })

      // Wait for transaction and get game ID from event
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const event = receipt?.logs[0]
      if (!event?.topics[1]) {
        console.error('No game ID in event')
        return
      }

      // Get the game ID from event
      const gameId = event.topics[1]
      console.log('Game ID:', gameId)

      // Create local lobby state using game ID
      const newLobby: Lobby = {
        id: gameId, // Use game ID for everything
        name: newLobbyName.trim(),
        players: [],
        messages: [],
        entryFee: entryFeeWei,
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
      setIsJoining(true)
      console.log('Joining game with ID:', gameId)

      // Join game on-chain using the game ID
      await joinGameContract({
        address: web3config.contractAddress as `0x${string}`,
        args: [BigInt(gameId)],
        value: lobby.entryFee,
      })

      // Update local state
      setActiveLobby(gameId)
      setLobbies((prev) =>
        prev.map((l) =>
          l.id === gameId
            ? { ...l, players: [...new Set([...l.players, myId])] }
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

  // Format entry fee with fallback
  const formatEntryFee = (fee: bigint | undefined) => {
    if (!fee) return '0'
    try {
      return formatEther(fee)
    } catch (error) {
      console.error('Error formatting fee:', error)
      return '0'
    }
  }

  // Get current lobby data
  const currentLobby = lobbies.find((lobby) => lobby.id === activeLobby)

  // Get shareable link for a lobby
  const getShareableLink = (lobby: Lobby) => {
    const url = new URL(window.location.href)
    url.searchParams.set('room', lobby.id) // Use game ID for room parameter
    return url.toString()
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
                Entry Fee: {formatEntryFee(currentLobby.entryFee)} MON • Min
                Players: {currentLobby.minPlayers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Game ID: {currentLobby.id}
              </p>
              <button
                onClick={() => {
                  const link = getShareableLink(currentLobby)
                  navigator.clipboard.writeText(link)
                }}
                className="text-xs text-blue-400 hover:text-blue-300 mt-1"
              >
                Copy Invite Link
              </button>
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
                return (
                  <span
                    key={playerId}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm"
                  >
                    {user?.nickname || `Player ${playerId.slice(-4)}`}
                    {playerId === myId && ' (You)'}
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
                        Entry: {formatEntryFee(lobby.entryFee)} MON
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Game ID: {lobby.id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const link = getShareableLink(lobby)
                          navigator.clipboard.writeText(link)
                        }}
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => joinLobby(lobby.id)}
                        disabled={!isConnected || isJoining}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition"
                      >
                        {isJoining ? 'Joining...' : 'Join'}
                      </button>
                    </div>
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
