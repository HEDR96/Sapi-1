# Task 1.3: Fix Decimal Formatting

## Overview
Update formatters.ts untuk memastikan format desimal yang konsisten dengan maksimal 1-2 angka di belakang koma.

## Files to Modify
- `src/lib/utils/formatters.ts`

## Requirements

### formatWeight
- Jika null/undefined, return '-'
- Format: `{value.toFixed(1)} kg` (1 desimal)

### formatCurrency
- Format mata uang Indonesia
- Use Intl.NumberFormat dengan 'id-ID' locale
- currency: 'IDR'
- minimumFractionDigits: 0
- maximumFractionDigits: 0

### formatADG
- Jika NaN/undefined, return '-'
- Format: `{value.toFixed(2)} kg/hari` (2 desimal)

### formatHeight
- Jika null/undefined, return '-'
- Format: `{value.toFixed(1)} cm` (1 desimal)

### formatDate
- Format Indonesia: DD Bulan YYYY
- Gunakan toLocaleDateString('id-ID')

## Code Example

```typescript
export function formatWeight(weight: number | null | undefined): string {
  if (weight === null || weight === undefined) return '-'
  return `${Number(weight).toFixed(1)} kg`
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatADG(adg: number): string {
  if (!adg || isNaN(adg)) return '-'
  return `${adg.toFixed(2)} kg/hari`
}

export function formatHeight(height: number | null | undefined): string {
  if (height === null || height === undefined) return '-'
  return `${Number(height).toFixed(1)} cm`
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
```

## Implementation Notes
- Handle edge cases (null, undefined, NaN)
- Support both string and number for price
- Use Number() untuk konversi yang aman
