import { CattleWeightWithMedia } from '@samadya/shared/types'

export function calculateWeightStats(weights: CattleWeightWithMedia[]) {
  if (!weights || weights.length === 0) {
    return {
      initialWeight: 0,
      lastWeight: 0,
      weightGain: 0,
      adg: null,
      minWeight: 0,
      maxWeight: 0,
    }
  }

  // Sort by date ascending for calculations
  const sorted = [...weights].sort(
    (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
  )

  const initialWeight = sorted[0]?.weight || 0
  const lastWeight = sorted[sorted.length - 1]?.weight || 0
  const weightGain = lastWeight - initialWeight

  // Calculate ADG (Average Daily Gain)
  let adg: number | null = null
  if (sorted.length >= 2) {
    const firstDate = new Date(sorted[0].measurementDate)
    const lastDate = new Date(sorted[sorted.length - 1].measurementDate)
    const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysDiff > 0) {
      adg = weightGain / daysDiff
    }
  }

  const allWeights = sorted.map(w => w.weight)
  const minWeight = Math.min(...allWeights)
  const maxWeight = Math.max(...allWeights)

  return {
    initialWeight,
    lastWeight,
    weightGain,
    adg,
    minWeight,
    maxWeight,
  }
}

export function estimateTargetCompletion(
  targetWeight: number,
  currentWeight: number,
  adg: number | null
): {
  estimatedDays: number
  estimatedDate: Date | null
  remainingWeight: number
  progressPercentage: number
} | null {
  if (!adg || adg <= 0) return null

  const remainingWeight = targetWeight - currentWeight
  if (remainingWeight <= 0) {
    return {
      estimatedDays: 0,
      estimatedDate: new Date(),
      remainingWeight: 0,
      progressPercentage: 100,
    }
  }

  const estimatedDays = Math.ceil(remainingWeight / adg)
  const estimatedDate = new Date()
  estimatedDate.setDate(estimatedDate.getDate() + estimatedDays)

  const progressPercentage = (currentWeight / targetWeight) * 100

  return {
    estimatedDays,
    estimatedDate,
    remainingWeight,
    progressPercentage,
  }
}
