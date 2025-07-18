import { useEffect } from 'react'
import { useGameState } from '@/app/components/ReactTogetherWrapper'
import { useAccount } from 'wagmi'
import { useSearchParams } from 'next/navigation'
import { Player } from '@/app/types/game'

export function useLobby() {
  const { state, setState } = useGameState()
  const { address } = useAccount()
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room') || 'default'

  // Join game
  const handleJoin = () => {
    if (!address) return

    const newPlayer: Player = {
      address,
      name: address.slice(0, 6),
      isEliminated: false,
    }

    setState({
      ...state,
      players: {
        ...state.players,
        [address]: newPlayer,
      },
      playersAlive: state.playersAlive + 1,
    })
  }

  // Ready up
  const handleReady = () => {
    if (!address) return

    // For now, we'll just use a random hash to simulate readiness
    const mockHash = `0x${Math.random().toString(16).slice(2)}`

    setState({
      ...state,
      players: {
        ...state.players,
        [address]: {
          ...state.players[address],
          patternHash: mockHash,
        },
      },
    })
  }

  // Check if current player is joined
  const isJoined = address ? !!state.players[address] : false

  // Get number of connected players
  const connectedPlayers = Object.keys(state.players).length

  // Auto-join if room code is provided
  useEffect(() => {
    const roomFromUrl = searchParams.get('room')
    if (roomFromUrl && address && !isJoined) {
      handleJoin()
    }
  }, [address, searchParams])

  return {
    players: state.players,
    connectedPlayers,
    isJoined,
    roomCode,
    handleJoin,
    handleReady,
  }
}
