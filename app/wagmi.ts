import '@rainbow-me/rainbowkit/styles.css'
import { darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { monadTestnet } from 'viem/chains'

export const config = getDefaultConfig({
  appName: 'Gatherers',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
  chains: [monadTestnet],
})

export const myRainbowTheme = darkTheme({
  accentColor: '#C2410C',
  accentColorForeground: 'white',
  borderRadius: 'large',
})
