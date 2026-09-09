import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '../../../lib/db/prisma'
import { CattleProfile } from '../../../components/cattle/CattleProfile'

interface PageProps {
  params: { code: string }
}

async function getCattle(code: string) {
  try {
    const cattle = await prisma.cattle.findUnique({
      where: { code },
      include: {
        weights: {
          orderBy: { measurementDate: 'asc' },
        },
        healthRecords: {
          orderBy: { recordDate: 'desc' },
        },
        feedRecords: {
          orderBy: { recordDate: 'desc' },
        },
        media: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!cattle) return null

    // Ensure weights have proper structure
    const weights = (cattle.weights || []).map(w => ({
      ...w,
      measurementDate: new Date(w.measurementDate),
    }))

    // Ensure healthRecords have proper structure
    const healthRecords = (cattle.healthRecords || []).map(hr => ({
      ...hr,
      recordDate: new Date(hr.recordDate),
    }))

    // Ensure feedRecords have proper structure
    const feedRecords = (cattle.feedRecords || []).map(fr => ({
      ...fr,
      recordDate: new Date(fr.recordDate),
    }))

    // This object is passed as a prop into the client-side CattleProfile
    // component, which serializes it into the page payload sent to every
    // visitor's browser - internal cost/margin fields must never ride along.
    const { buyPrice, sellPrice, healthCost, feedCost, ...publicCattle } = cattle

    return {
      ...publicCattle,
      birthDate: new Date(cattle.birthDate),
      weights,
      healthRecords,
      feedRecords,
    }
  } catch (error) {
    console.error('Error fetching cattle:', error)
    return null
  }
}

// Finds the next non-sold cattle to browse to, following the same
// createdAt-desc order used by the catalog, wrapping around to the first
// one when the current cattle is the last in the list.
async function getNextCattleCode(currentId: string, currentCreatedAt: Date): Promise<string | null> {
  try {
    const next = await prisma.cattle.findFirst({
      where: {
        status: { not: 'SOLD' },
        OR: [
          { createdAt: { lt: currentCreatedAt } },
          { createdAt: currentCreatedAt, id: { lt: currentId } },
        ],
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { code: true },
    })
    if (next) return next.code

    const wrapped = await prisma.cattle.findFirst({
      where: { status: { not: 'SOLD' }, id: { not: currentId } },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { code: true },
    })
    return wrapped?.code ?? null
  } catch (error) {
    console.error('Error fetching next cattle:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cattle = await getCattle(params.code)

  if (!cattle) {
    return { title: 'Sapi Tidak Ditemukan' }
  }

  return {
    title: `${cattle.name} - ${cattle.code}`,
    description: cattle.description || `Informasi lengkap sapi ${cattle.name}, ${cattle.breed} dengan bobot terkini dan riwayat pertumbuhan.`,
  }
}

export default async function CattleDetailPage({ params }: PageProps) {
  const cattle = await getCattle(params.code)

  if (!cattle) {
    notFound()
  }

  const nextCode = await getNextCattleCode(cattle.id, cattle.createdAt)

  return <CattleProfile cattle={cattle} nextCode={nextCode} />
}
