'use client'

import { useState } from 'react'
import { PatternSubmissionProps } from '@/app/types/game'

export const PatternSubmission = ({
  patternLength,
  availableActions,
  isGhostMode,
}: PatternSubmissionProps) => {
  const [pattern, setPattern] = useState<string[]>([])

  const handleActionClick = (actionName: string) => {
    if (pattern.length >= patternLength) return
    setPattern([...pattern, actionName])
  }

  const handleClear = () => {
    setPattern([])
  }

  const handleSubmit = () => {
    if (pattern.length !== patternLength) return
    // TODO: Handle pattern submission through React Together
    console.log('Pattern submitted:', pattern)
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Pattern Display */}
      <div className="retro-border bg-card/80 backdrop-blur-sm p-6">
        <div className="text-xl font-pixel text-primary mb-4 text-center">
          CURRENT PATTERN
        </div>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {Array.from({ length: patternLength }).map((_, i) => (
            <div
              key={i}
              className={`
                aspect-square retro-border flex items-center justify-center
                ${
                  pattern[i]
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted/20 text-muted-foreground'
                }
                ${isGhostMode ? 'animate-pulse' : ''}
              `}
            >
              <div className="font-pixel text-lg">{pattern[i] || '_'}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4">
          {availableActions.map((action) => (
            <button
              key={action.name}
              onClick={() => handleActionClick(action.name)}
              disabled={pattern.length >= patternLength}
              className={`
                retro-border font-pixel text-sm p-4 flex flex-col items-center gap-2
                ${
                  pattern.includes(action.name)
                    ? 'bg-accent/20 text-accent'
                    : 'bg-primary/20 text-primary hover:bg-primary hover:text-background'
                }
                ${isGhostMode ? 'animate-pulse' : 'animate-pixel-jump'}
              `}
            >
              <action.icon className="w-6 h-6" />
              {action.name}
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleClear}
            className="retro-border font-pixel uppercase px-8 py-3 bg-destructive/20 text-destructive hover:bg-destructive hover:text-background"
          >
            CLEAR
          </button>
          <button
            onClick={handleSubmit}
            disabled={pattern.length !== patternLength}
            className={`
              retro-border font-pixel uppercase px-8 py-3
              ${
                pattern.length === patternLength
                  ? 'bg-success/20 text-success hover:bg-success hover:text-background animate-retro-bounce'
                  : 'bg-muted/20 text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            SUBMIT
          </button>
        </div>
      </div>

      {/* Timer */}
      <div className="text-center font-pixel text-destructive animate-blink">
        TIME REMAINING: 00:30
      </div>
    </div>
  )
}
