import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { GameAction, GAME_ACTIONS } from '@/app/types/game'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  HelpCircle,
  RotateCw,
  X,
  Zap,
} from 'lucide-react'

const ACTION_ICONS: Record<GameAction, React.ReactNode> = {
  L: <ArrowLeft className="w-4 h-4" />,
  R: <ArrowRight className="w-4 h-4" />,
  J: <ArrowUp className="w-4 h-4" />,
  S: <RotateCw className="w-4 h-4" />,
  T: <Zap className="w-4 h-4" />,
}

interface GameRulesProps {
  onClose?: () => void
}

export const GameRules = ({ onClose }: GameRulesProps) => {
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [
    {
      title: 'WELCOME TO MIRROR PIT',
      content: (
        <div className="space-y-4">
          <p>
            Mirror Pit is a real-time PvP survival game where players must
            create unique patterns to stay alive. The last player standing wins
            the jackpot!
          </p>
          <div className="font-pixel text-accent text-sm">
            &gt; CREATE UNIQUE PATTERNS
            <br />
            &gt; AVOID ELIMINATION
            <br />
            &gt; WIN THE JACKPOT
          </div>
        </div>
      ),
    },
    {
      title: 'GAME PHASES',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-pixel text-accent">1. PATTERN SUBMISSION</h3>
            <p>Create a unique pattern using the available actions.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-pixel text-accent">2. PATTERN REVEAL</h3>
            <p>All patterns are revealed simultaneously.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-pixel text-accent">3. ELIMINATION</h3>
            <p>Players with duplicate patterns are eliminated.</p>
          </div>
        </div>
      ),
    },
    {
      title: 'AVAILABLE ACTIONS',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(GAME_ACTIONS).map(([key, name]) => (
              <div
                key={key}
                className="flex items-center gap-2 p-2 retro-border bg-background/50"
              >
                <div className="text-primary">
                  {ACTION_ICONS[key as GameAction]}
                </div>
                <div className="font-pixel text-sm">{name}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Combine these actions to create your unique pattern.
          </p>
        </div>
      ),
    },
    {
      title: 'PATTERN RULES',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-pixel text-destructive">
              PATTERN RESTRICTIONS:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>No repeating consecutive actions</li>
              <li>Left/Right actions must be balanced (±1)</li>
              <li>Pattern must be unique among players</li>
              <li>Complete pattern within time limit</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-pixel text-success">TIPS:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Mix different actions for uniqueness</li>
              <li>Watch the timer carefully</li>
              <li>Plan your pattern in advance</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'SPECIAL MODES',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-pixel text-ghost">GHOST MODE</h3>
            <p>
              Eliminated players can continue playing as ghosts, but cannot win
              the jackpot.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-pixel text-warning">SUDDEN DEATH</h3>
            <p>
              When few players remain, pattern length increases and time
              decreases.
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card variant="bordered" className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="font-pixel text-lg">GAME RULES</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="min-h-[300px] mb-6">
          <h3 className="font-pixel text-primary mb-4">
            {pages[currentPage].title}
          </h3>
          {pages[currentPage].content}
        </div>

        <div className="flex justify-between">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            PREVIOUS
          </Button>
          <div className="font-pixel text-muted-foreground">
            {currentPage + 1} / {pages.length}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(pages.length - 1, currentPage + 1))
            }
            disabled={currentPage === pages.length - 1}
          >
            NEXT
          </Button>
        </div>
      </Card>
    </div>
  )
}
