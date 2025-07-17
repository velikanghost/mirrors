'use client'

import { useState } from 'react'
import { GameAction, GameState, GAME_ACTIONS } from '@/app/types/game'
import { ArrowLeft, ArrowRight, ArrowUp, RotateCw, Zap } from 'lucide-react'

const ACTION_ICONS: Record<GameAction, React.ReactNode> = {
  L: <ArrowLeft className="w-4 h-4" />,
  R: <ArrowRight className="w-4 h-4" />,
  J: <ArrowUp className="w-4 h-4" />,
  S: <RotateCw className="w-4 h-4" />,
  T: <Zap className="w-4 h-4" />,
}

interface PatternSubmissionProps {
  state: GameState
  playerAddress: string
  onSubmitPattern: (pattern: string) => void
}

export const PatternSubmission = ({
  state,
  playerAddress,
  onSubmitPattern,
}: PatternSubmissionProps) => {
  const [selectedPattern, setSelectedPattern] = useState<GameAction[]>([])
  const player = state.players[playerAddress]

  if (!player || player.isEliminated) return null
  if (player.patternHash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="font-pixel text-success animate-blink">
          &gt; PATTERN_SUBMITTED - AWAITING_REVEAL &lt;
        </div>
      </div>
    )
  }

  const handleActionClick = (action: GameAction) => {
    if (selectedPattern.length < state.patternLength) {
      setSelectedPattern([...selectedPattern, action])
    }
  }

  const handleSubmit = () => {
    if (selectedPattern.length === state.patternLength) {
      // In a real implementation, we would hash this pattern with a salt
      const patternString = selectedPattern.join('')
      onSubmitPattern(patternString)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Pattern Display */}
      <div className="retro-border bg-card/80 backdrop-blur-sm p-6 w-full max-w-md">
        <div className="font-pixel text-xs text-muted-foreground mb-4">
          YOUR_PATTERN:
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: state.patternLength }).map((_, i) => (
            <div
              key={i}
              className="aspect-square retro-border bg-background/50 flex items-center justify-center"
            >
              {selectedPattern[i] && (
                <div className="text-primary animate-pixel-jump">
                  {ACTION_ICONS[selectedPattern[i]]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-5 gap-4">
        {state.availableActions.map((action) => (
          <button
            key={action}
            onClick={() => handleActionClick(action)}
            disabled={selectedPattern.length >= state.patternLength}
            className="retro-border font-pixel uppercase tracking-wider transition-all aspect-square p-4
              bg-primary/20 text-primary border-primary 
              hover:bg-primary hover:text-background
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ACTION_ICONS[action]}
            <div className="text-xs mt-1">{GAME_ACTIONS[action]}</div>
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={selectedPattern.length !== state.patternLength}
        className="retro-border font-pixel uppercase tracking-wider transition-all px-8 py-3
          bg-accent/20 text-accent border-accent
          hover:bg-accent hover:text-background
          disabled:opacity-50 disabled:cursor-not-allowed
          animate-retro-bounce"
      >
        SUBMIT_PATTERN
      </button>

      {/* Clear Button */}
      {selectedPattern.length > 0 && (
        <button
          onClick={() => setSelectedPattern([])}
          className="font-pixel text-destructive text-sm hover:underline"
        >
          CLEAR_PATTERN
        </button>
      )}
    </div>
  )
}
