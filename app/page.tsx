'use client'

import { GameArena } from './components/game/GameArena'
import ReactTogetherWrapper from './components/ReactTogetherWrapper'

export default function Home() {
  return (
    <ReactTogetherWrapper>
      <GameArena />
    </ReactTogetherWrapper>
  )
}
