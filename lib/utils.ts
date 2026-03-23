import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely convert any value to a number
 * Returns 0 for null, undefined, NaN, or non-numeric strings
 */
export function toNumber(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === "number") return isNaN(value) ? defaultValue : value
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

/**
 * Format a rating value safely (handles strings, numbers, null, undefined)
 * @param value - The rating value (can be string, number, null, undefined)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted rating string
 */
export function formatRating(value: unknown, decimals = 1): string {
  return toNumber(value).toFixed(decimals)
}

/**
 * Format a price value safely (handles strings, numbers, null, undefined)
 * @param value - The price value (can be string, number, null, undefined)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted price string
 */
export function formatPrice(value: unknown, decimals = 2): string {
  return toNumber(value).toFixed(decimals)
}
