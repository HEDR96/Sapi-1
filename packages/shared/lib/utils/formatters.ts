import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatWeight(weight: number | null | undefined): string {
  if (weight == null) return '-'
  return `${weight.toFixed(1)} kg`
}

export function formatHeight(height: number | null | undefined): string {
  if (height == null) return '-'
  return `${height.toFixed(1)} cm`
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd MMM yyyy', { locale: id })
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: id })
}

export function formatADG(adg: number | null | undefined): string {
  if (adg == null || isNaN(adg)) return '-'
  return `${adg.toFixed(2)} kg/hari`
}

export function formatPercentage(value: number | null | undefined): string {
  if (value == null) return '-'
  return `${value.toFixed(1)}%`
}
