import { differenceInDays, addDays } from 'date-fns'

export interface WeightData {
  weight: number
  measurementDate: Date
}

export interface WeightCalculation {
  initialWeight: number
  lastWeight: number
  weightGain: number
  adg: number | null
  daysDiff: number
}

export interface TargetEstimation {
  remainingWeight: number
  estimatedDays: number | null
  estimatedDate: Date | null
  progressPercentage: number
}

/**
 * Calculate weight statistics from a series of weight measurements
 * @param weights - Array of weight data sorted by measurement date
 * @returns WeightCalculation with initial, last, gain, ADG, and days
 */
export function calculateWeightStats(weights: WeightData[]): WeightCalculation {
  if (!weights || weights.length === 0) {
    return {
      initialWeight: 0,
      lastWeight: 0,
      weightGain: 0,
      adg: null,
      daysDiff: 0,
    }
  }

  // Sort by measurement date (ascending)
  const sortedWeights = [...weights].sort(
    (a, b) => a.measurementDate.getTime() - b.measurementDate.getTime()
  )

  const initialWeight = sortedWeights[0].weight
  const lastWeight = sortedWeights[sortedWeights.length - 1].weight
  const firstDate = sortedWeights[0].measurementDate
  const lastDate = sortedWeights[sortedWeights.length - 1].measurementDate

  const daysDiff = differenceInDays(lastDate, firstDate)
  const weightGain = lastWeight - initialWeight

  // Calculate Average Daily Gain (ADG)
  // ADG = (lastWeight - initialWeight) / daysDiff
  const adg = daysDiff > 0 ? weightGain / daysDiff : null

  return {
    initialWeight,
    lastWeight,
    weightGain,
    adg,
    daysDiff,
  }
}

/**
 * Estimate when target weight will be reached based on current ADG
 * @param targetWeight - Target weight to achieve
 * @param lastWeight - Most recent recorded weight
 * @param adg - Average Daily Gain (kg/day)
 * @returns TargetEstimation with remaining weight, days, date, and progress
 */
export function estimateTargetCompletion(
  targetWeight: number,
  lastWeight: number,
  adg: number | null
): TargetEstimation {
  const remainingWeight = Math.max(0, targetWeight - lastWeight)
  const progressPercentage =
    lastWeight > 0 ? Math.min(100, (lastWeight / targetWeight) * 100) : 0

  // If already at or above target, return immediately
  if (remainingWeight <= 0) {
    return {
      remainingWeight: 0,
      estimatedDays: null,
      estimatedDate: null,
      progressPercentage: 100,
    }
  }

  // If no ADG or negative ADG, cannot estimate
  if (adg === null || adg <= 0) {
    return {
      remainingWeight,
      estimatedDays: null,
      estimatedDate: null,
      progressPercentage,
    }
  }

  const estimatedDays = Math.ceil(remainingWeight / adg)
  const estimatedDate = addDays(new Date(), estimatedDays)

  return {
    remainingWeight,
    estimatedDays,
    estimatedDate,
    progressPercentage,
  }
}
