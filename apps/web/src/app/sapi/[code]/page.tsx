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

    return {
      ...cattle,
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

  return <CattleProfile cattle={cattle} />
}
