import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/app/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  isAnimated?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isAnimated = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'retro-border font-pixel uppercase tracking-wider transition-all'

    const variantStyles = {
      primary:
        'bg-primary/20 text-primary border-primary hover:bg-primary hover:text-background',
      accent:
        'bg-accent/20 text-accent border-accent hover:bg-accent hover:text-background',
      success:
        'bg-success/20 text-success border-success hover:bg-success hover:text-background',
      warning:
        'bg-warning/20 text-warning border-warning hover:bg-warning hover:text-background',
      destructive:
        'bg-destructive/20 text-destructive border-destructive hover:bg-destructive hover:text-background',
    }

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg',
    }

    const animationStyles = isAnimated ? 'animate-retro-bounce' : ''
    const loadingStyles = isLoading ? 'animate-pulse cursor-not-allowed' : ''
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          animationStyles,
          loadingStyles,
          disabledStyles,
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <span className="animate-spin">⌛</span>
            <span>LOADING...</span>
          </div>
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'

export { Button }
