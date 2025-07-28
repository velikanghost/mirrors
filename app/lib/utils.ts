import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPlayerId(id: string | null | undefined): string {
  if (!id) return 'Unknown'
  return id.length > 8 ? `${id.slice(0, 4)}...${id.slice(-4)}` : id
}
