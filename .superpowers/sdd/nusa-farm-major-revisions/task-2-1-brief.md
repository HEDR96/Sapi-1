# Task 2.1: Setup Resend & Email Template

## Overview
Setup Resend untuk pengiriman email verifikasi dan buat email template.

## Files to Create
- `src/lib/email/resend.ts`

## Files to Modify
- `src/app/api/auth/register/route.ts`
- `.env` (tambahkan environment variable)

## Requirements

### 1. Install Resend
```bash
npm install resend
```

### 2. Create Email Client
File: `src/lib/email/resend.ts`

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, code: string) {
  try {
    await resend.emails.send({
      from: 'samadyafarm.id <noreply@nusafarm.id>',
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
```

### 3. Update Register API
File: `src/app/api/auth/register/route.ts`

Import dan panggil sendVerificationEmail setelah user dibuat:

```typescript
import { sendVerificationEmail } from '@/lib/email/resend'

// After creating user:
await sendVerificationEmail(email, verificationCode)

// In response:
return NextResponse.json({
  success: true,
  message: 'Akun berhasil dibuat. Silakan verifikasi email Anda.',
  // Remove verificationCode from response in production
})
```

### 4. Environment Variables
Tambahkan ke .env.example:
```
RESEND_API_KEY=
```

## Implementation Notes
- Buat folder `src/lib/email/` jika belum ada
- Di development, masih log kode verifikasi ke console
- Di production, kirim via Resend API
