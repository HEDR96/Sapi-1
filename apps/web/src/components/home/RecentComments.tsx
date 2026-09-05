'use client'

import { useState, useEffect } from 'react'
import { Quote } from 'lucide-react'

interface Testimonial {
  id: string
  content: string
  createdAt: string
  user: { name: string | null }
  cattle: { code: string; name: string }
}

// Placeholder testimonials for display when no real data
const placeholderTestimonials: Testimonial[] = [
  {
    id: 'placeholder-1',
    content: 'Alhamdulillah, sapi yang saya beli kualitasnya sangat bagus. Pemberitaan di website sangat transparan, setiap perkembangan bobotnya bisa dipantau dengan mudah.',
    createdAt: new Date().toISOString(),
    user: { name: 'H. Ahmad Fauzi' },
    cattle: { code: 'SM-001', name: 'Sapi Premium' }
  },
  {
    id: 'placeholder-2',
    content: 'Pelayanan sangat memuaskan. Sapi qurban yang saya ambil sesuai dengan yang ditampilkan di website. Terima kasih Samadya Farm!',
    createdAt: new Date().toISOString(),
    user: { name: 'Ustadz Hasan' },
    cattle: { code: 'SM-002', name: 'Sapi Qurban' }
  },
  {
    id: 'placeholder-3',
    content: 'Sangat recommended banget! Prosesnya mudah, sapi sehat dan terawat. Bisa pantau perkembangan via website. Jazakallahu Khairan!',
    createdAt: new Date().toISOString(),
    user: { name: 'Bapak Rahmat' },
    cattle: { code: 'SM-003', name: 'Sapi Limousin' }
  }
]

export function RecentComments() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/comments?limit=3')
      .then(res => res.json())
      .then(data => {
        const comments = data.comments || []
        setTestimonials(comments)
        setLoading(false)
      })
      .catch(() => {
        setTestimonials([])
        setLoading(false)
      })
  }, [])

  // Use real testimonials if available, otherwise use placeholders
  const displayTestimonials = testimonials.length > 0 ? testimonials : placeholderTestimonials

  if (loading) {
    return (
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="h-40 animate-pulse bg-[hsl(var(--cream))] rounded-lg" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-lg sm:text-xl font-bold text-[hsl(var(--forest))] mb-4 sm:mb-6 text-center">
          Kata Mereka Tentang Kami
        </h2>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative p-4 sm:p-5 bg-white rounded-xl border border-[hsl(var(--line))] hover:border-[hsl(var(--olive))] transition-all shadow-sm hover:shadow-md"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 left-4">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[hsl(var(--olive))] flex items-center justify-center">
                  <Quote className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="mt-2">
                <p className="text-xs sm:text-sm text-[hsl(var(--forest))/85] leading-relaxed line-clamp-4 sm:line-clamp-none">
                  "{testimonial.content}"
                </p>

                {/* User Info */}
                <div className="mt-3 sm:mt-4 pt-3 border-t border-[hsl(var(--line))]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Avatar Placeholder */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[hsl(var(--cream))] border border-[hsl(var(--line))] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-[hsl(var(--forest))]">
                        {testimonial.user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[hsl(var(--forest))] truncate">
                        {testimonial.user.name || 'User'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-[hsl(var(--forest))/60]">
                        Tentang {testimonial.cattle.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Placeholder Badge */}
              {testimonial.id.startsWith('placeholder-') && (
                <div className="absolute top-2 right-2">
                  <span className="text-[8px] px-1.5 py-0.5 bg-[hsl(var(--cream))] rounded text-[hsl(var(--forest))/50]">
                    Contoh
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
