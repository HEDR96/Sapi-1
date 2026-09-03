import {
  format,
  formatDistanceToNow,
  parseISO,
} from 'date-fns'
import { id } from 'date-fns/locale'

/**
 * Format amount as Indonesian Rupiah currency
 * @example formatCurrency(45000000) -> "Rp 45.000.000"
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format weight in kilograms with 1 decimal place
 * @example formatWeight(527.456) -> "527.5 Kg"
 */
export function formatWeight(weight: number | null | undefined): string {
  if (weight === null || weight === undefined) return '-'
  return `${Number(weight).toFixed(1)} kg`
}

/**
 * Format height in centimeters
 * @example formatHeight(145) -> "145 cm"
 */
export function formatHeight(height: number | null | undefined): string {
  if (height === null || height === undefined) return '-'
  return `${Number(height).toFixed(1)} cm`
}

/**
 * Format date as Indonesian long format
 * @example formatDate(new Date(2025, 7, 10)) -> "10 Agustus 2025"
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
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
 * Format ADG (Average Daily Gain)
 * @example formatADG(1.456) -> "1.5 kg/hari"
 */
export function formatADG(adg: number): string {
  if (!adg || isNaN(adg)) return '-'
  return `${adg.toFixed(2)} kg/hari`
}
