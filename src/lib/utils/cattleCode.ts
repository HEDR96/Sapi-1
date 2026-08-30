import { prisma } from '@/lib/db/prisma'

/**
 * Generate a unique cattle code in format: NF-YYYYNNNN
 * Where YYYY = current year, NNNN = sequential number padded with zeros
 * Example: NF-20260001, NF-20260002, etc.
 */
export async function generateCattleCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `NF-${year}`

  // Get the last cattle code with this year's prefix
  const lastCattle = await prisma.cattle.findFirst({
    where: {
      code: {
        startsWith: prefix,
      },
    },
    orderBy: {
      code: 'desc',
    },
    select: {
      code: true,
    },
  })

  if (lastCattle) {
    // Extract the number from the last code (e.g., "NF-20260001" -> 1)
    const parts = lastCattle.code.split('-')
    const lastNum = parseInt(parts[parts.length - 1], 10)
    const newNum = lastNum + 1
    return `${prefix}${String(newNum).padStart(4, '0')}`
  }

  // First cattle of the year
  return `${prefix}0001`
}

/**
 * Validate cattle code format
 */
export function isValidCattleCode(code: string): boolean {
  // Format: NF-YYYYNNNN (e.g., NF-20260001)
  const pattern = /^NF-\d{4}\d{4}$/
  return pattern.test(code)
}
