import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, code: string) {
  try {
    await resend.emails.send({
      from: 'Nusa Farm <noreply@nusafarm.id>',
      to: email,
      subject: 'Kode Verifikasi Nusa Farm',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #173F31;">Nusa Farm</h1>
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
