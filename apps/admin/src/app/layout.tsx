import './globals.css'

export const metadata = {
  title: 'Samadya Farm Admin',
  description: 'Admin panel for cattle management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" type="image/jpeg" href="/logo.jpeg" />
        <link rel="shortcut icon" type="image/jpeg" href="/logo.jpeg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
