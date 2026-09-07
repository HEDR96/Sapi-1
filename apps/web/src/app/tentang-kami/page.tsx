'use client'

import { Phone, MapPin, Instagram, MessageCircle, Facebook, AtSign } from 'lucide-react'

export default function TentangKamiPage() {
  const contactInfo = {
    phone: '0859-3561-0197',
    whatsapp: '6285935610197',
    address: 'Puri Bintaro Residence 2 Cluster E No E3 Ciputat Tangerang Selatan',
    farmLocation: 'Cimpaeun, Tapos, Depok',
    social: {
      instagram: 'samadyafarm.id',
      tiktok: 'samadyafarm.id',
      facebook: 'samadyafarm.id',
      threads: 'samadyafarm.id',
    },
  }

  const features = [
    {
      title: 'Sapi Berkualitas',
      description: 'Kami menyediakan sapi kurban dengan breed premium dan kondisi kesehatan yang terjamin.',
      icon: '',
    },
    {
      title: 'Pemantauan Pertumbuhan',
      description: 'Setiap sapi dipantau pertumbuhannya secara berkala dengan dokumentasi lengkap.',
      icon: '',
    },
    {
      title: 'Pengiriman Seluruh Indonesia',
      description: 'Layanan pengiriman sapi kurban ke seluruh wilayah Indonesia dengan penanganan profesional.',
      icon: '',
    },
    {
      title: 'Konsultasi Gratis',
      description: 'Tim kami siap membantu Anda memilih sapi kurban yang tepat sesuai kebutuhan.',
      icon: '',
    },
  ]

  return (
    <div className="min-h-screen bg-[hsl(var(--cream2))]">
      {/* Hero Section */}
      <section className="relative bg-[hsl(var(--forest))] px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Tentang Kami
          </h1>
          <p className="mt-4 text-base text-white/80 sm:text-lg">
            Samadya Farm - Penyedia Sapi Kurban Berkualitas
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        {/* Introduction */}
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl font-bold text-[hsl(var(--forest))] sm:text-2xl">
            Siapa Kami?
          </h2>
          <p className="mt-4 text-sm text-[hsl(var(--forest))/80] sm:text-base leading-relaxed">
            Samadya Farm adalah penyedia sapi kurban berkualitas yang berkomitmen untuk memberikan
            hewan qurban terbaik bagi masyarakat Indonesia. Dengan pengalaman bertahun-tahun dalam
            bidang peternakan, kami memastikan setiap sapi yang kami sediakan memenuhi standar
            kualitas tertinggi.
          </p>
          <p className="mt-4 text-sm text-[hsl(var(--forest))/80] sm:text-base leading-relaxed">
            Kami percaya bahwa kualitas adalah prioritas utama. Setiap sapi melalui proses
            seleksi yang ketat, pemeriksaan kesehatan berkala, dan dokumentasi pertumbuhan
            yang transparan untuk memastikan Anda mendapatkan hewan qurban yang terbaik.
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl border border-[hsl(var(--line))] bg-white p-5 transition-shadow hover:shadow-md sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl sm:text-4xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-[hsl(var(--forest))] sm:text-lg">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs text-[hsl(var(--forest))/65] sm:text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="mt-8 rounded-2xl bg-[hsl(var(--forest))] p-6 text-white sm:mt-12 sm:p-8">
          <h2 className="font-display text-xl font-bold sm:text-2xl">
            Hubungi Kami
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Jangan ragu untuk menghubungi kami jika Anda memiliki pertanyaan
          </p>

          <div className="mt-6 space-y-4">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?phone=62${contactInfo.whatsapp}&text=Halo%2C%20saya%20ingin%20bertanya%20mengenai%20sapi`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-lg bg-white/10 p-4 transition-colors hover:bg-white/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-white/80">{contactInfo.phone}</p>
              </div>
            </a>

            {/* Direct Call */}
            <a
              href={`tel:${contactInfo.phone}`}
              className="flex items-center gap-4 rounded-lg bg-white/10 p-4 transition-colors hover:bg-white/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Telepon</p>
                <p className="text-sm text-white/80">{contactInfo.phone}</p>
              </div>
            </a>

            {/* Address */}
            <div className="flex items-start gap-4 rounded-lg bg-white/10 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Alamat Kantor</p>
                <p className="text-sm text-white/80">{contactInfo.address}</p>
                <p className="mt-2 font-semibold">Lokasi Kandang</p>
                <p className="text-sm text-white/80">{contactInfo.farmLocation}</p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="mt-6">
            <p className="font-semibold">Ikuti Kami</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <a
                href={`https://instagram.com/${contactInfo.social.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-white/10 py-3 text-sm transition-colors hover:bg-white/20"
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </a>
              <a
                href={`https://www.tiktok.com/@${contactInfo.social.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-white/10 py-3 text-sm transition-colors hover:bg-white/20"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
                <span>TikTok</span>
              </a>
              <a
                href={`https://www.facebook.com/${contactInfo.social.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-white/10 py-3 text-sm transition-colors hover:bg-white/20"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </a>
              <a
                href={`https://www.threads.net/@${contactInfo.social.threads}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-white/10 py-3 text-sm transition-colors hover:bg-white/20"
              >
                <AtSign className="h-4 w-4" />
                <span>Threads</span>
              </a>
            </div>
          </div>
        </div>

        {/* Interactive Google Maps */}
        <div className="mt-8 rounded-2xl overflow-hidden bg-white shadow-md">
          <div className="p-4 sm:p-6 border-b border-[hsl(var(--line))]">
            <h3 className="font-display text-lg font-bold text-[hsl(var(--forest))] sm:text-xl">
              Lokasi Kami
            </h3>
            <div className="mt-2 grid gap-2 text-sm text-[hsl(var(--forest))/70]">
              <p><span className="font-semibold">Kantor:</span> {contactInfo.address}</p>
              <p><span className="font-semibold">Kandang:</span> {contactInfo.farmLocation}</p>
            </div>
          </div>
          <div className="relative w-full overflow-hidden" style={{ height: '400px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.2!2d106.7287549!3d-6.31622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ef007e797ac9%3A0x712dc421a5c09dda!2sPuri%20Bintaro%20Residence%202%20Cluster%20D!5e0!3m2!1sen!2sid!4v1699999999999!5m2!1sen!2sid"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
              title="Lokasi Samadya Farm"
            />
          </div>
          <div className="p-4 sm:p-6 border-t border-[hsl(var(--line))]">
            <a
              href="https://www.google.com/maps/place/Puri+Bintaro+Residence+2+Cluster+E+No+E3+Ciputat+Tangerang+Selatan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--forest))] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[hsl(var(--forest2))]"
            >
              <MapPin className="h-4 w-4" />
              Buka di Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
