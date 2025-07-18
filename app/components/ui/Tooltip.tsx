import { ReactNode, useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip = ({
  content,
  children,
  position = 'top',
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center gap-1 cursor-help"
      >
        {children}
        <HelpCircle className="w-4 h-4 text-muted-foreground" />
      </div>
      {isVisible && (
        <div
          className={`
            absolute z-50 px-3 py-2 
            retro-border bg-card/95 backdrop-blur-sm
            font-pixel text-xs text-primary
            animate-fade-in
            ${positionStyles[position]}
          `}
        >
          {content}
        </div>
      )}
    </div>
  )
}
