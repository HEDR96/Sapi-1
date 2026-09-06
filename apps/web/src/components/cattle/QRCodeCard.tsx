'use client'

import { Download, Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { Button } from '@samadya/shared/components/ui/button'

interface QRCodeCardProps {
  code: string
  name: string
}

export function QRCodeCard({ code, name }: QRCodeCardProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const url = `${baseUrl}/sapi/${code}`

  /**
   * Download QR Code sebagai PNG
   */
  const downloadQR = () => {
    const element = document.getElementById(`qr-${code}`)

    if (!(element instanceof SVGSVGElement)) {
      return
    }

    const svg = element.cloneNode(true) as SVGSVGElement

    svg.setAttribute('width', '1200')
    svg.setAttribute('height', '1200')

    const svgData = new XMLSerializer().serializeToString(svg)

    const blob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    })

    const blobUrl = URL.createObjectURL(blob)
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement('canvas')

      canvas.width = 1200
      canvas.height = 1200

      const context = canvas.getContext('2d')

      if (!context) {
        URL.revokeObjectURL(blobUrl)
        return
      }

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, 1200, 1200)

      context.drawImage(
        image,
        0,
        0,
        1200,
        1200,
      )

      const pngUrl = canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a')

      downloadLink.download = `qr-${code}.png`
      downloadLink.href = pngUrl

      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      URL.revokeObjectURL(blobUrl)
    }

    image.onerror = () => {
      URL.revokeObjectURL(blobUrl)
    }

    image.src = blobUrl
  }

  /**
   * Print QR Code
   */
  const printQR = () => {
    const element = document.getElementById(`qr-${code}`)

    if (!(element instanceof SVGSVGElement)) {
      return
    }

    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      alert(
        'Popup diblokir oleh browser. Silakan izinkan popup terlebih dahulu.',
      )
      return
    }

    /*
     * Ukuran QR saat dicetak.
     *
     * 100mm = 10cm
     * 110mm = 11cm
     * 120mm = 12cm
     */
    const qrSize = 100

    const qrSvg = element.cloneNode(true) as SVGSVGElement

    qrSvg.setAttribute(
      'width',
      `${qrSize}mm`,
    )

    qrSvg.setAttribute(
      'height',
      `${qrSize}mm`,
    )

    qrSvg.setAttribute(
      'preserveAspectRatio',
      'xMidYMid meet',
    )

    qrSvg.style.display = 'block'
    qrSvg.style.width = `${qrSize}mm`
    qrSvg.style.height = `${qrSize}mm`
    qrSvg.style.margin = '0 auto'

    const svgHtml =
      new XMLSerializer().serializeToString(qrSvg)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />

          <title>
            QR Code - ${escapeHtml(code)}
          </title>

          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              width: 210mm;
              height: 297mm;

              margin: 0;
              padding: 0;

              background: #ffffff;
            }

            body {
              display: flex;

              justify-content: center;
              align-items: flex-start;

              font-family:
                Arial,
                Helvetica,
                sans-serif;
            }

            /*
             * CARD
             */
            .card {
              width: 140mm;

              margin-top: 40mm;
              padding: 12mm;

              background: #ffffff;

              border: 0.8mm solid #2d5016;
              border-radius: 5mm;

              display: flex;
              flex-direction: column;
              align-items: center;

              text-align: center;
            }

            /*
             * FARM NAME
             */
            .farm-name {
              width: 100%;

              margin: 0 0 7mm;

              font-size: 4mm;
              font-weight: 600;

              letter-spacing: 1mm;

              color: #666666;

              text-align: center;
            }

            /*
             * QR CODE
             */
            .qr-wrapper {
              width: ${qrSize}mm;
              height: ${qrSize}mm;

              display: flex;

              align-items: center;
              justify-content: center;

              margin: 0 auto;

              flex-shrink: 0;
            }

            .qr-wrapper svg {
              display: block;

              width: ${qrSize}mm !important;
              height: ${qrSize}mm !important;

              max-width: none !important;
              max-height: none !important;

              margin: 0 auto;
            }

            /*
             * INFORMATION
             */
            .info {
              width: 100%;

              margin-top: 8mm;

              text-align: center;
            }

            /*
             * CATTLE NAME
             */
            .cattle-name {
              margin: 0;

              font-size: 7mm;
              line-height: 1.2;
              font-weight: 800;

              color: #2d5016;

              word-break: break-word;

              text-align: center;
            }

            /*
             * CATTLE CODE
             */
            .cattle-code {
              display: inline-block;

              margin-top: 4mm;
              padding: 3mm 8mm;

              font-size: 9mm;
              line-height: 1;
              font-weight: 900;

              letter-spacing: 1mm;

              color: #1a3009;
              background: #f5f5f0;

              border:
                0.5mm
                solid
                #e0e0d0;

              border-radius: 3mm;

              text-align: center;
            }

            /*
             * URL
             */
            .url {
              margin-top: 5mm;

              font-size: 3mm;
              line-height: 1.4;

              color: #888888;

              word-break: break-all;

              text-align: center;
            }

            /*
             * FOOTER
             */
            .footer {
              margin-top: 8mm;

              font-size: 2.8mm;
              line-height: 1.4;

              color: #999999;

              text-align: center;
            }

            /*
             * PRINT
             */
            @media print {
              html,
              body {
                width: 210mm;
                height: 297mm;
              }

              .card {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>

        <body>
          <div class="card">

            <div class="farm-name">
              SAMADYA FARM
            </div>

            <div class="qr-wrapper">
              ${svgHtml}
            </div>

            <div class="info">

              <p class="cattle-name">
                ${escapeHtml(name)}
              </p>

              <div class="cattle-code">
                ${escapeHtml(code)}
              </div>

              <div class="url">
                ${escapeHtml(url)}
              </div>

              <div class="footer">
                Scan QR Code untuk melihat
                profil lengkap sapi ini
              </div>

            </div>

          </div>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  return (
    <section className="rounded-lg bg-muted/50 p-6">
      <h3 className="mb-4 text-lg font-semibold">
        QR Code
      </h3>

      <div className="flex flex-col items-center gap-6 md:flex-row">

        {/* QR Preview */}
        <div className="rounded-lg bg-white p-4 shadow">
          <QRCodeSVG
            id={`qr-${code}`}
            value={url}
            size={200}
            level="H"
            includeMargin
          />
        </div>

        {/* Information & Actions */}
        <div className="space-y-2">

          <p className="text-sm text-muted-foreground">
            Scan untuk melihat profil sapi
          </p>

          <p className="font-medium">
            {name}
          </p>

          <p className="text-sm text-muted-foreground">
            {code}
          </p>

          <div className="flex gap-2 pt-2">

            <Button
              onClick={downloadQR}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>

            <Button
              onClick={printQR}
              variant="outline"
              size="sm"
            >
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>

          </div>

        </div>

      </div>
    </section>
  )
}

/**
 * Escape HTML agar data seperti nama sapi
 * tidak merusak document.write().
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}