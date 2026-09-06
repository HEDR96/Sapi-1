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

    const originalSvg = document.getElementById(`qr-${code}`)
    if (!originalSvg) return

    const originalSize = originalSvg.getAttribute('width') || '200'
    const svgInnerHTML = originalSvg.innerHTML
    const printSize = 200 // mm, ukuran QR saat cetak

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${code}</title>
          <style>
            @page { size: A4; margin: 0; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body {
              width: 210mm;
              height: 297mm;
              overflow: hidden;
            }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-container {
              background: white;
              padding: 15mm;
              border-radius: 8mm;
              border: 1.5mm solid #2d5016;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .qr-wrapper {
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-wrapper svg {
              display: block;
            }
            .farm-name {
              font-size: 4mm;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1mm;
              margin-bottom: 6mm;
            }
            .info {
              margin-top: 8mm;
            }
            .cattle-name {
              font-size: 7mm;
              font-weight: 800;
              color: #2d5016;
              margin: 1mm 0;
            }
            .cattle-code {
              font-size: 10mm;
              font-weight: 900;
              color: #1a3009;
              letter-spacing: 1mm;
              margin: 3mm 0;
              padding: 3mm 8mm;
              background: linear-gradient(135deg, #f5f5f0, #ffffff);
              border-radius: 3mm;
              border: 0.5mm solid #e0e0d0;
            }
            .url {
              font-size: 3mm;
              color: #888;
              margin-top: 4mm;
            }
            .footer {
              margin-top: 10mm;
              font-size: 2.8mm;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="farm-name">samadyafarm.id</div>
            <div class="qr-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="${printSize}mm" height="${printSize}mm" viewBox="0 0 ${originalSize} ${originalSize}">
                ${svgInnerHTML}
              </svg>
            </div>
            <div class="info">
              <p class="cattle-name">${name}</p>
              <p class="cattle-code">${code}</p>
              <p class="url">${url}</p>
              <p class="footer">Scan QR Code untuk melihat profil lengkap sapi ini</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
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