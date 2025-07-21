import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'app/generated.ts',
  contracts: [],
  plugins: [
    foundry({
      project: './foundry',
      include: ['MirrorPit.sol/**/*.json'],
    }),
    react(),
  ],
})
