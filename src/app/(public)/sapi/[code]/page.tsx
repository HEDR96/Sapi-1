import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { CattleProfile } from '@/components/cattle/CattleProfile'

interface PageProps {
  params: { code: string }
}

async function getCattle(code: string) {
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
  return cattle
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cattle = await getCattle(params.code)

  if (!cattle) {
    return { title: 'Sapi Tidak Ditemukan' }
  }

  return {
    title: `${cattle.name} - ${cattle.code}`,
    description: cattle.description || `Informasi lengkap sapi ${cattle.name}, ${cattle.breed} dengan bobot terkini dan riwayat pertumbuhan.`,
    openGraph: {
      title: `${cattle.name} - ${cattle.code} | Katalog Sapi`,
      description: cattle.description || `Informasi lengkap sapi ${cattle.name}`,
      images: cattle.mainImage ? [cattle.mainImage] : [],
    },
  }
}

export default async function CattleDetailPage({ params }: PageProps) {
  const cattle = await getCattle(params.code)

  if (!cattle) {
    notFound()
  }

  return <CattleProfile cattle={cattle} />
}
