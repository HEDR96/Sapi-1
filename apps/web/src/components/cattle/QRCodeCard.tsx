'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Download, Printer } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'

interface QRCodeCardProps {
  code: string
  name: string
}

export function QRCodeCard({ code, name }: QRCodeCardProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = `${baseUrl}/sapi/${code}`

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${code}`)
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = 400
      canvas.height = 400
      ctx?.drawImage(img, 0, 0, 400, 400)
      const pngFile = canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-${code}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const printQR = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${code}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .qr-container { margin: 20px auto; }
            .info { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <svg id="qr-${code}" xmlns="http://www.w3.org/2000/svg" width="200" height="200">
              ${document.getElementById(`qr-${code}`)?.innerHTML || ''}
            </svg>
          </div>
          <div class="info">
            <p><strong>${name}</strong></p>
            <p>${code}</p>
            <p>${url}</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <section className="bg-muted/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">QR Code</h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <QRCodeSVG
            id={`qr-${code}`}
            value={url}
            size={200}
            level="H"
            includeMargin
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Scan untuk melihat profil sapi</p>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{code}</p>
          <div className="flex gap-2 pt-2">
            <Button onClick={downloadQR} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button onClick={printQR} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
