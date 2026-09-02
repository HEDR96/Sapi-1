import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/jwt'

// POST /api/admin/migrate-video-urls
export async function POST() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find all video media with old Google Drive URLs
    const oldVideos = await prisma.cattleMedia.findMany({
      where: {
        fileType: 'VIDEO',
        fileUrl: {
          contains: 'drive.google.com',
        },
      },
      select: { id: true, fileUrl: true },
    })

    let updated = 0
    const results: { id: string; oldUrl: string; newUrl: string }[] = []

    for (const video of oldVideos) {
      // Extract fileId from old URL patterns:
      // https://drive.google.com/uc?export=view&id=FILEID
      // https://drive.google.com/file/d/FILEID/view
      // https://drive.google.com/open?id=FILEID
      let fileId: string | null = null

      if (video.fileUrl.includes('export=view&id=')) {
        const match = video.fileUrl.match(/export=view&id=([^&]+)/)
        fileId = match?.[1] || null
      } else if (video.fileUrl.includes('/file/d/')) {
        const match = video.fileUrl.match(/\/file\/d\/([^/]+)/)
        fileId = match?.[1] || null
      } else if (video.fileUrl.includes('open?id=')) {
        const match = video.fileUrl.match(/open\?id=([^&]+)/)
        fileId = match?.[1] || null
      }

      if (fileId) {
        const newUrl = `/api/stream?fileId=${fileId}&mimeType=video%2Fmp4`
        await prisma.cattleMedia.update({
          where: { id: video.id },
          data: { fileUrl: newUrl },
        })
        updated++
        results.push({ id: video.id, oldUrl: video.fileUrl, newUrl })
      }
    }

    return NextResponse.json({
      success: true,
      totalFound: oldVideos.length,
      updated,
      results,
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
