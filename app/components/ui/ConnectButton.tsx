'use client'

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export const ConnectButton = () => {
  const { isConnected } = useAccount()

  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted

        if (!ready) {
          return (
            <button
              className="retro-border font-pixel text-sm px-4 py-2 bg-primary/20 text-primary animate-pulse"
              disabled
            >
              LOADING...
            </button>
          )
        }

        if (account && chain) {
          return (
            <div className="flex items-center gap-3">
              <button
                onClick={openChainModal}
                className="retro-border font-pixel text-xs px-2 py-1 bg-accent/20 text-accent hover:bg-accent hover:text-background"
              >
                {chain.name}
              </button>

              <button
                onClick={openAccountModal}
                className="retro-border font-pixel text-sm px-4 py-2 bg-primary/20 text-primary hover:bg-primary hover:text-background"
              >
                {account.displayName}
              </button>
            </div>
          )
        }

        return (
          <button
            onClick={openConnectModal}
            className="retro-border font-pixel text-sm px-4 py-2 bg-primary/20 text-primary hover:bg-primary hover:text-background animate-retro-bounce"
          >
            CONNECT WALLET
          </button>
        )
      }}
    </RainbowConnectButton.Custom>
  )
}
