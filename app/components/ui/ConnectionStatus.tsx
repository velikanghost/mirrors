import {
  useSessionStatus,
  type CroquetConnectionType,
} from '@/app/hooks/useSessionStatus'
import { cn } from '@/app/lib/utils'

const statusConfig: Record<
  CroquetConnectionType,
  { label: string; color: string }
> = {
  connecting: { label: 'Connecting', color: 'bg-yellow-500' },
  online: { label: 'Connected', color: 'bg-green-500' },
  fatal: { label: 'Error', color: 'bg-red-500' },
  offline: { label: 'Offline', color: 'bg-gray-500' },
}

export const ConnectionStatus = ({ className }: { className?: string }) => {
  const status = useSessionStatus()
  const config = statusConfig[status]

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <div className="flex items-center gap-2">
        <div
          className={cn('h-2 w-2 rounded-full animate-pulse', config.color)}
        />
        <span className="text-text-muted">{config.label}</span>
      </div>
    </div>
  )
}
