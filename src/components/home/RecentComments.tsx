'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { MessageCircle } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { name: string | null }
  cattle: { code: string; name: string }
}

export function RecentComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/comments?limit=5')
      .then(res => res.json())
      .then(data => {
        setComments(data.comments || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="h-40 animate-pulse bg-[hsl(var(--cream))] rounded-lg" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold text-[hsl(var(--forest))] mb-4">
          Komentar Terbaru
        </h2>

        <div className="grid gap-3">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Link
                key={comment.id}
                href={`/sapi/${comment.cattle.code}`}
                className="block p-4 bg-white rounded-lg border border-[hsl(var(--line))] hover:border-[hsl(var(--forest))] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[hsl(var(--cream))] rounded-full">
                    <MessageCircle className="h-4 w-4 text-[hsl(var(--forest))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[hsl(var(--forest))]">
                        {comment.user.name || 'User'}
                      </span>
                      <span className="text-xs text-[hsl(var(--forest))/60]">
                        tentang
                      </span>
                      <span className="text-xs font-medium text-[hsl(var(--forest))]">
                        {comment.cattle.name} ({comment.cattle.code})
                      </span>
                    </div>
                    <p className="text-sm text-[hsl(var(--forest))/80] line-clamp-2">
                      {comment.content}
                    </p>
                    <p className="text-xs text-[hsl(var(--forest))/50] mt-2">
                      {formatRelativeTime(comment.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-[hsl(var(--line))]">
              <p className="text-[hsl(var(--forest))/70]">
                Belum ada komentar. Jadilah yang pertama!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
