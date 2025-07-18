'use client'

import { useState } from 'react'
import { PatternSubmissionProps } from '@/app/types/game'
import { Send } from 'lucide-react'

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
    <div className="space-y-6">
      {/* Pattern Display */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm">Your Pattern</div>
          <div className="text-sm opacity-70">
            {pattern.length}/{patternLength} moves
          </div>
        </div>
        <div className="pattern-grid">
          {Array.from({ length: patternLength }).map((_, i) => (
            <div
              key={i}
              className={`
                pattern-slot
                ${pattern[i] ? 'filled' : ''}
                ${isGhostMode ? 'animate-pulse' : ''}
              `}
            >
              {pattern[i] || `Move ${i + 1}`}
            </div>
          ))}
        </div>
      </div>

      {/* Available Actions */}
      <div>
        <div className="text-sm mb-4">Available Actions</div>
        <div className="action-grid">
          {availableActions.map((action) => (
            <button
              key={action.name}
              onClick={() => handleActionClick(action.name)}
              disabled={pattern.length >= patternLength}
              className={`
                action-button
                ${pattern.includes(action.name) ? 'selected' : ''}
                ${isGhostMode ? 'animate-pulse' : ''}
              `}
            >
              <action.icon className="w-6 h-6" />
              {action.name}
            </button>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleClear}
          className="text-sm px-6 py-2 border border-neon hover:bg-neon hover:text-card transition-colors"
        >
          CLEAR
        </button>
        <button
          onClick={handleSubmit}
          disabled={pattern.length !== patternLength}
          className={`
            text-sm px-6 py-2 bg-neon text-card flex items-center gap-2
            ${
              pattern.length === patternLength
                ? 'opacity-100 hover:bg-neon/90'
                : 'opacity-50 cursor-not-allowed'
            }
          `}
        >
          <Send className="w-4 h-4" />
          SUBMIT PATTERN
        </button>
      </div>
    </div>
  )
}
