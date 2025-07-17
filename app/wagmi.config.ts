import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'app/contracts-generated.ts',
  plugins: [
    foundry({
      project: 'contracts',
      artifacts: 'out',
      include: ['Mirrors.json'],
    }),
    react(),
  ],
})
