import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { calculateWeightStats, estimateTargetCompletion } from '@/lib/utils/calculations'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const cattle = await prisma.cattle.findUnique({
      where: { code: params.code },
      include: {
        weights: {
          orderBy: { measurementDate: 'asc' },
          include: {
            media: true,
          },
        },
        healthRecords: {
          orderBy: { recordDate: 'desc' },
          include: {
            media: true,
          },
        },
        feedRecords: {
          orderBy: { recordDate: 'desc' },
        },
        media: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!cattle) {
      return NextResponse.json(
        { error: 'Cattle not found' },
        { status: 404 }
      )
    }

    // Calculate weight stats
    const weightStats = calculateWeightStats(cattle.weights || [])

    // Calculate target estimation
    let targetEstimation = null
    if (cattle.targetWeight && weightStats.lastWeight) {
      targetEstimation = estimateTargetCompletion(
        cattle.targetWeight,
        weightStats.lastWeight,
        weightStats.adg
      )
    }

    // Get last weight
    const lastWeight = cattle.weights.length > 0
      ? cattle.weights[cattle.weights.length - 1].weight
      : null

    return NextResponse.json({
      ...cattle,
      lastWeight,
      weightStats,
      targetEstimation,
    })
  } catch (error) {
    console.error('Error fetching cattle:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cattle' },
      { status: 500 }
    )
  }
}
