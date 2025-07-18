import { HTMLAttributes, forwardRef } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'glowing'
  blur?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className = '', variant = 'default', blur = true, children, ...props },
    ref,
  ) => {
    const baseStyles = 'bg-card/80 p-6'
    const blurStyles = blur ? 'backdrop-blur-sm' : ''

    const variantStyles = {
      default: '',
      bordered: 'retro-border',
      glowing: 'retro-border animate-retro-glow',
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${blurStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'

export { Card }
