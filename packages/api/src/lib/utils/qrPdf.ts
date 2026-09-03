import jsPDF from 'jspdf'
import QRCode from 'qrcode'

export async function generateQRPdf(cattle: {
  code: string
  name: string
  breed: string
  price: number | string
}) {
  const doc = new jsPDF()

  // Generate QR Code
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sapi/${cattle.code}`
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 200,
    margin: 1,
    color: { dark: '#173F31', light: '#ffffff' }
  })

  // Add QR Code
  doc.addImage(qrDataUrl, 'PNG', 15, 15, 50, 50)

  // Add Info
  doc.setFontSize(24)
  doc.setTextColor(23, 63, 49)
  doc.text('samadyafarm.id', 75, 25)

  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text('Sapi Pilihan Qurban', 75, 32)

  doc.setFontSize(16)
  doc.setTextColor(0)
  doc.text(cattle.name, 75, 45)
  doc.setFontSize(12)
  doc.text(`Kode: ${cattle.code}`, 75, 52)
  doc.text(`Jenis: ${cattle.breed}`, 75, 59)

  // Format price
  const priceNum = typeof cattle.price === 'string' ? parseFloat(cattle.price) : cattle.price
  doc.setFontSize(14)
  doc.text(`Harga: Rp ${priceNum.toLocaleString('id-ID')}`, 75, 70)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('Scan QR code untuk melihat detail sapi', 15, 75)
  doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 15, 80)

  // Save
  doc.save(`QR-${cattle.code}.pdf`)
}
