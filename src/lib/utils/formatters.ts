import {
  format,
  formatDistanceToNow,
  parseISO,
  differenceInDays,
  addDays,
} from 'date-fns'
import { id } from 'date-fns/locale'

/**
 * Format amount as Indonesian Rupiah currency
 * @example formatCurrency(45000000) -> "Rp 45.000.000"
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('id-ID').format(amount)
  return `Rp ${formatted}`
}

/**
 * Format weight in kilograms
 * @example formatWeight(527) -> "527 Kg"
 */
export function formatWeight(weight: number): string {
  return `${weight} Kg`
}

/**
 * Format height in centimeters
 * @example formatHeight(145) -> "145 cm"
 */
export function formatHeight(height: number): string {
  return `${height} cm`
}

/**
 * Format date as Indonesian long format
 * @example formatDate(new Date(2025, 7, 10)) -> "10 Agustus 2025"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMMM yyyy', { locale: id })
}

/**
 * Format date as Indonesian short format
 * @example formatDateShort(new Date(2025, 7, 10)) -> "10 Ags 2025"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMM yyyy', { locale: id })
}

/**
 * Format date as relative time (e.g., "2 hari yang lalu")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: id })
}

/**
 * Format code as uppercase
 * @example formatCode("abc123") -> "ABC123"
 */
export function formatCode(code: string): string {
  return code.toUpperCase()
}
