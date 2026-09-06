'use client'

import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { VisitorTracker } from '../components/layout/VisitorTracker'
import Head from 'next/head'
import './globals.css'

const LOGO_URL = 'https://claude-opus-4-55622187037182%2Fb55cb642ca266f68183727a39a758fc970a55afa6d237274570c64ea889c046d..jpeg?Expires=1788786249&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=OTk9QgeZyy7emy%2BggvNB00%2FYgRA%3D'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <Head>
        {/* Primary Logo */}
        <link rel="icon" type="image/jpeg" href={LOGO_URL} />
        <link rel="shortcut icon" type="image/jpeg" href={LOGO_URL} />
        {/* Open Graph / Social Media */}
        <meta property="og:image" content={LOGO_URL} />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <VisitorTracker />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
