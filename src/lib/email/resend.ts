import { Resend } from 'resend'

let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY not configured. Email sending will not work.')
    }
    resend = new Resend(apiKey || '')
  }
  return resend
}

export async function sendVerificationEmail(email: string, code: string) {
  const client = getResendClient()
  try {
    await client.emails.send({
      from: 'samadyafarmadmin@kesug.com <noreply@kesug.com>',
      to: email,
      subject: 'Kode Verifikasi samadyafarm.id',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #173F31;">samadyafarm.id</h1>
          <p>Kode verifikasi Anda:</p>
          <div style="background: #F7F2E7; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #666; margin-top: 20px;">Kode ini berlaku selama 30 menit.</p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
