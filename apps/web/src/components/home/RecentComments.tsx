'use client'

import { useState, useEffect } from 'react'
import { Quote } from 'lucide-react'

interface Testimonial {
  id: string
  customerName: string
  content: string
  rating: number
  order: number
  cattle: { code: string; name: string } | null
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="relative w-[280px] sm:w-[340px] shrink-0 p-4 sm:p-5 bg-white rounded-xl border border-[hsl(var(--line))] hover:border-[hsl(var(--olive))] transition-all shadow-sm hover:shadow-md">
      {/* Quote Icon */}
      <div className="absolute -top-3 left-4">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[hsl(var(--olive))] flex items-center justify-center">
          <Quote className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
      </div>

      {/* Testimonial Content */}
      <div className="mt-2">
        <p className="text-xs sm:text-sm text-[hsl(var(--forest))/85] leading-relaxed line-clamp-4">
          &ldquo;{testimonial.content}&rdquo;
        </p>

        {/* User Info */}
        <div className="mt-3 sm:mt-4 pt-3 border-t border-[hsl(var(--line))]">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[hsl(var(--cream))] border border-[hsl(var(--line))] flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-bold text-[hsl(var(--forest))]">
                {testimonial.customerName.charAt(0) || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-[hsl(var(--forest))] truncate">
                {testimonial.customerName}
              </p>
              {testimonial.cattle && (
                <p className="text-[10px] sm:text-xs text-[hsl(var(--forest))/60]">
                  Tentang {testimonial.cattle.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RecentComments() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        const items = data.testimonials || []
        setTestimonials(items)
        setLoading(false)
      })
      .catch((err) => {
        // Testimonials are a non-critical section - fail quietly (hide the
        // section) rather than showing an error banner on the homepage,
        // but still log so a real outage is visible in monitoring.
        console.error('Failed to load testimonials:', err)
        setTestimonials([])
        setLoading(false)
      })
  }, [])

  // Don't render anything if no testimonials
  if (loading) {
    return (
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="h-40 animate-pulse bg-[hsl(var(--cream))] rounded-lg" />
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  // Duplicate the list so the marquee can loop seamlessly at -50% translate.
  // Below this count a duplicated strip wouldn't fill the viewport width, so
  // fall back to the static grid instead of an obviously-looping 2-3 card
  // scroll.
  const canMarquee = testimonials.length >= 4
  const track = canMarquee ? [...testimonials, ...testimonials] : testimonials
  const durationSeconds = testimonials.length * 5

  return (
    <section className="py-6 sm:py-8">
      <div className={canMarquee ? 'px-0' : 'container mx-auto px-4'}>
        <h2 className="text-lg sm:text-xl font-bold text-[hsl(var(--forest))] mb-4 sm:mb-6 text-center px-4">
          Kata Mereka Tentang Kami
        </h2>

        {canMarquee ? (
          <div
            className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
          >
            <div
              className="flex w-max gap-3 sm:gap-4 animate-testimonial-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
              style={{ animationDuration: `${durationSeconds}s` }}
            >
              {track.map((testimonial, i) => (
                <TestimonialCard key={`${testimonial.id}-${i}`} testimonial={testimonial} />
              ))}
            </div>
            <style jsx>{`
              @keyframes testimonial-marquee {
                from {
                  transform: translateX(0);
                }
                to {
                  transform: translateX(-50%);
                }
              }
              .animate-testimonial-marquee {
                animation: testimonial-marquee linear infinite;
              }
            `}</style>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
