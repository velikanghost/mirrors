import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block font-pixel text-xs text-muted-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2
            retro-border bg-background/50
            font-pixel text-primary placeholder:text-muted-foreground
            focus:outline-none focus:border-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-destructive animate-shake' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <div className="text-xs font-pixel text-destructive animate-fade-in">
            {error}
          </div>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
