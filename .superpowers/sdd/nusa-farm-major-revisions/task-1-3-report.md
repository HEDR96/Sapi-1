# Task 1.3 Report: Fix Decimal Formatting

## Changes Made

Updated `src/lib/utils/formatters.ts` with the following function updates:

### 1. formatWeight
- Returns '-' for null/undefined
- Formats with 1 decimal: `${Number(weight).toFixed(1)} kg`

### 2. formatCurrency
- Uses Intl.NumberFormat with 'id-ID' locale
- currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
- Output: "Rp 45.000.000" (no decimals)

### 3. formatADG
- Returns '-' for NaN/undefined/falsy values
- Formats with 2 decimals: `${adg.toFixed(2)} kg/hari`

### 4. formatHeight
- Returns '-' for null/undefined
- Formats with 1 decimal: `${Number(height).toFixed(1)} cm`

### 5. formatDate
- Uses toLocaleDateString('id-ID') instead of date-fns
- Returns '-' for falsy input
- Format: DD Bulan YYYY (e.g., "10 Agustus 2025")

## TypeScript Check
Ran `npx tsc --noEmit` - no errors introduced by these changes. Pre-existing errors in other files (auth routes, CattleCard, CattleGrid, CattleStatusBadge, CattleProfile) are unrelated to this task.

## Concerns
- None - all changes follow the brief exactly
- formatDate switch from date-fns to native toLocaleDateString is a minor dependency cleanup
