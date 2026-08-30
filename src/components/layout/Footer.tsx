import Link from 'next/link'
import { ShieldCheck, Instagram, Facebook, Play, Music2 } from 'lucide-react'

const menuLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/#katalog', label: 'Sapi Qurban' },
  { href: '/#cara-kerja', label: 'Cara Kerja' },
]

const infoLinks = [
  { href: '/#tentang', label: 'Tentang Kami' },
  { href: '/#blog', label: 'Blog' },
  { href: '/#kontak', label: 'Kontak' },
]

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Play, href: '#', label: 'YouTube' },
  { icon: Music2, href: '#', label: 'TikTok' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="kontak" className="mx-auto max-w-[1400px] px-4 pb-2 sm:px-5 lg:px-8">
      <div className="grid gap-6 border-b border-[hsl(var(--line))] bg-[hsl(var(--cream2))] px-4 py-5 md:grid-cols-2 lg:grid-cols-[1.5fr_.7fr_.7fr_.9fr_.8fr] lg:px-6">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 text-[hsl(var(--forest))]">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--forest))/20] bg-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13px] font-extrabold tracking-[.08em]">samadyafarm.id</div>
              <div className="text-[8px] text-[hsl(var(--forest))/60]">KURBAN BERKUALITAS</div>
            </div>
          </div>
          <p className="mt-3 max-w-[260px] text-[10px] leading-5 text-[hsl(var(--forest))/65]">
            samadyafarm.id adalah peternakan modern yang berkomitmen menghadirkan sapi qurban berkualitas dengan transparansi penuh.
          </p>
        </div>

        {/* Menu */}
        <div>
          <h4 className="mb-2 text-[11px] font-bold text-[hsl(var(--forest))]">Menu</h4>
          <ul className="space-y-1.5 text-[10px] text-[hsl(var(--forest))/65]">
            {menuLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[hsl(var(--forest))]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="mb-2 text-[11px] font-bold text-[hsl(var(--forest))]">Informasi</h4>
          <ul className="space-y-1.5 text-[10px] text-[hsl(var(--forest))/65]">
            {infoLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[hsl(var(--forest))]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-2 text-[11px] font-bold text-[hsl(var(--forest))]">Kontak Kami</h4>
          <ul className="space-y-1.5 text-[10px] text-[hsl(var(--forest))/65]">
            <li>0812-3456-7890</li>
            <li>halo@nusafarm.id</li>
            <li>
              Kandang Utama samadyafarm.id,<br />
              Kab. Bogor, Jawa Barat
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="mb-2 text-[11px] font-bold text-[hsl(var(--forest))]">Ikuti Kami</h4>
          <div className="flex gap-2 text-[hsl(var(--forest))]">
            {socialLinks.map((social, index) => (
              <Link
                key={index}
                href={social.href}
                aria-label={social.label}
                className="grid h-7 w-7 place-items-center rounded-full border border-[hsl(var(--line))] hover:bg-[hsl(var(--forest))] hover:text-white transition-colors"
              >
                <social.icon className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col gap-2 px-4 py-2 text-[9px] text-[hsl(var(--forest))/55] sm:flex-row sm:items-center sm:justify-between">
        <div>© {currentYear} samadyafarm.id. All rights reserved.</div>
        <div>Dari Peternak untuk Ummat.</div>
      </div>
    </footer>
  )
}
