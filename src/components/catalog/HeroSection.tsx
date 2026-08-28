import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative h-[500px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1920&q=80')`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />

      {/* Content */}
      <div className="relative container flex h-full items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Katalog Sapi Pilihan
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Temukan sapi berkualitas dengan informasi lengkap, transparan, dan riwayat
            pertumbuhan yang terdokumentasi.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="#catalog">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Lihat Katalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#catalog">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20"
              >
                Sapi Tersedia
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
