'use client'

import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { VisitorTracker } from '../components/layout/VisitorTracker'
import Head from 'next/head'
import './globals.css'
import Logo from './logo.jpeg'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <Head>
        {/* Primary Logo - Local file */}
        <link rel="icon" type="image/jpeg" href={Logo.src} />
        <link rel="shortcut icon" type="image/jpeg" href={Logo.src} />
        {/* Open Graph / Social Media */}
        <meta property="og:image" content={Logo.src} />
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
