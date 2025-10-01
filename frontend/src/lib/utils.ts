import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSearchParams(params: Record<string, any>): string {
  const usp = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, val]) => {
    if (val === undefined || val === null) return
    if (Array.isArray(val)) {
      val.forEach((v) => usp.append(`${key}[]`, String(v)))
    } else if (typeof val === 'object') {
      // Flatten simple nested objects like a.*, left.*, right.* by preserving keys as-is
      // Caller should pass pre-keyed params when needed
      usp.append(key, JSON.stringify(val))
    } else {
      usp.append(key, String(val))
    }
  })
  return usp.toString()
}
