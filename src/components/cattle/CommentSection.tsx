'use client'

import { useState, useEffect } from 'react'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { MessageCircle, Send, Trash2, Loader2, User } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string | null }
  cattle: { code: string; name: string }
}

interface CommentSectionProps {
  cattleId: string
  cattleCode: string
  currentUserId?: string
}

export function CommentSection({ cattleId, cattleCode, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComments()
  }, [cattleId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?cattleId=${cattleId}&limit=50`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch {
      console.error('Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || newComment.length < 3) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cattleId, content: newComment.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal mengirim komentar')
      }

      setNewComment('')
      fetchComments()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return

    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' })
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    } catch {
      console.error('Failed to delete comment')
    }
  }

  return (
    <div className="mt-6 border-t border-[hsl(var(--line))] pt-6">
      <h3 className="text-lg font-bold text-[hsl(var(--forest))] mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Komentar ({comments.length})
      </h3>

      {/* Comment Form */}
      {!currentUserId ? (
        <div className="mb-6 p-4 bg-[hsl(var(--cream))] rounded-lg text-center">
          <p className="text-sm text-[hsl(var(--forest))/70] mb-2">
            Login untuk memberikan komentar
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
            className="text-sm font-semibold text-[hsl(var(--forest))] hover:underline"
          >
            Masuk / Daftar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis komentar Anda..."
            rows={3}
            maxLength={1000}
            className="w-full rounded-lg border border-[hsl(var(--line))] p-3 text-sm text-[hsl(var(--forest))] placeholder:text-[hsl(var(--forest))/50] focus:border-[hsl(var(--forest))] focus:ring-2 focus:ring-[hsl(var(--forest))] focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[hsl(var(--forest))/50]">
              {newComment.length}/1000 karakter
            </span>
            <button
              type="submit"
              disabled={submitting || newComment.length < 3}
              className="flex items-center gap-2 rounded-lg bg-[hsl(var(--forest))] px-4 py-2 text-sm font-semibold text-white hover:bg-[hsl(var(--forest2))] disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Kirim
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--cream))]" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-[hsl(var(--cream))] rounded mb-2" />
                  <div className="h-3 w-full bg-[hsl(var(--cream))] rounded mb-1" />
                  <div className="h-3 w-2/3 bg-[hsl(var(--cream))] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-[hsl(var(--forest))/50]">
          <div className="text-4xl mb-2"></div>
          <p className="text-sm">Belum ada komentar. Jadilah yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[hsl(var(--line))]">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--forest))] flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-[hsl(var(--forest))]">
                    {comment.user.name || 'User'}
                  </span>
                  <span className="text-xs text-[hsl(var(--forest))/50]">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[hsl(var(--forest))/80] whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
              {currentUserId === comment.user.id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-1.5 text-[hsl(var(--forest))/40] hover:text-red-500 transition-colors"
                  title="Hapus komentar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
