import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from 'viem/chains'
import { mirrorPitAbi } from '@/app/lib/generated'
import { web3config } from '@/app/lib/dapp.config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameId, lobbyId, winnerUserIds, lobbyPlayers } = body

    // Validate input
    if (
      !gameId ||
      !winnerUserIds ||
      !Array.isArray(winnerUserIds) ||
      winnerUserIds.length === 0
    ) {
      return NextResponse.json(
        { error: 'Invalid input parameters' },
        { status: 400 },
      )
    }

    // Get admin private key from environment
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY
    if (!adminPrivateKey) {
      return NextResponse.json(
        { error: 'Admin private key not configured' },
        { status: 500 },
      )
    }

    // Create admin wallet client
    const adminAccount = privateKeyToAccount(adminPrivateKey as `0x${string}`)
    const walletClient = createWalletClient({
      account: adminAccount,
      chain: monadTestnet,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL),
    })

    // Map winner user IDs to wallet addresses
    const winnerAddresses: `0x${string}`[] = []

    if (lobbyPlayers?.paidPlayers) {
      for (const winnerId of winnerUserIds) {
        const playerData = lobbyPlayers.paidPlayers.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p: any) => p.userId === winnerId,
        )
        if (playerData?.walletAddress) {
          winnerAddresses.push(playerData.walletAddress as `0x${string}`)
        }
      }
    }

    // Validate that we found addresses for all winners
    if (winnerAddresses.length !== winnerUserIds.length) {
      return NextResponse.json(
        {
          error: 'Could not find wallet addresses for all winners',
          foundAddresses: winnerAddresses.length,
          expectedAddresses: winnerUserIds.length,
        },
        { status: 400 },
      )
    }

    // Call smart contract to distribute prizes
    const hash = await walletClient.writeContract({
      address: web3config.contractAddress as `0x${string}`,
      abi: mirrorPitAbi,
      functionName: 'distributePrizes',
      args: [BigInt(gameId), winnerAddresses],
    })

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      winnerAddresses,
      gameId,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Failed to distribute prizes:', error)
    return NextResponse.json(
      {
        error: 'Failed to distribute prizes',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
