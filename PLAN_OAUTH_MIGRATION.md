# Plan: OAuth 2.0 untuk Google Drive (Complete)

## Overview

Implementasi OAuth 2.0 untuk Google Drive menggunakan akun Google personal sebagai storage quota owner.

## Files yang Dibuat/Diubah

### New Files:
| File | Fungsi |
|------|--------|
| `src/lib/storage/token-store.ts` | Menyimpan refresh token secara aman |
| `src/lib/storage/google-drive-oauth.ts` | OAuth 2.0 client untuk upload |
| `src/app/api/auth/google/init/route.ts` | Generate authorization URL |
| `src/app/api/auth/google/callback/route.ts` | Handle OAuth callback |
| `src/app/api/auth/google/status/route.ts` | Cek status authorization |

### Modified Files:
| File | Perubahan |
|------|-----------|
| `src/app/api/upload/route.ts` | Use OAuth client |
| `src/app/api/admin/media/route.ts` | Use OAuth client |
| `src/lib/storage/index.ts` | Export OAuth functions |
| `src/lib/storage/google-drive.ts` | DELETED |
| `.env` | OAuth credentials |
| `.env.example` | OAuth template |
| `Dockerfile` | DATA_DIR for tokens |
| `docker-compose.yml` | Volume mount for tokens |

---

## Environment Variables

### Diperlukan di `.env`:

```env
# OAuth 2.0 Credentials (dari Google Cloud Console)
GOOGLE_OAUTH_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_OAUTH_CLIENT_SECRET="GOCSPX-xxx"
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# Folder IDs (dari Google Drive Anda)
GOOGLE_DRIVE_IMAGE_FOLDER_ID="1STZFsxltjtnZdmr8Omt6Rh1Sf3-5S5K-"
GOOGLE_DRIVE_VIDEO_FOLDER_ID="1xfCZL2FUFLpmN1EQabEae2feC_iIjdgc"
```

---

## Cara Membuat OAuth Client ID di Google Cloud

### Langkah 1: Buat Project (jika belum ada)
1. Buka https://console.cloud.google.com
2. Klik **Select a project** → **New Project**
3. Nama: `Cattle Catalog`
4. Klik **Create**

### Langkah 2: Enable Google Drive API
1. Buka **APIs & Services** → **Library**
2. Search: **Google Drive API**
3. Klik **Enable**

### Langkah 3: Buat OAuth Credentials
1. Buka **APIs & Services** → **Credentials**
2. Klik **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Cattle Catalog Web Client`
5. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
   *(Untuk production, tambahkan juga domain production Anda)*
6. Klik **Create**
7. **Copy Client ID dan Client Secret**

---

## Cara Authorization Pertama Kali

### Local Development:

1. **Update `.env`** dengan OAuth credentials:
   ```env
   GOOGLE_OAUTH_CLIENT_ID="xxx.apps.googleusercontent.com"
   GOOGLE_OAUTH_CLIENT_SECRET="GOCSPX-xxx"
   ```

2. **Start server**:
   ```bash
   docker-compose up -d
   ```

3. **Buka browser**:
   ```
   http://localhost:3000/api/auth/google/init
   ```

4. **Copy authUrl** dari response JSON

5. **Buka authUrl** di browser

6. **Login** dengan Google account Anda

7. **Grant permission** untuk access Google Drive

8. **Redirect** akan terjadi, copy `code` parameter dari URL:
   ```
   http://localhost:3000/api/auth/google/callback?code=xxxxx&scope=...
   ```

9. **Submit authorization code**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/google/callback \
     -H "Content-Type: application/json" \
     -d '{"code":"ISI_CODE_DARI_URL"}'
   ```

10. **Success!** Refresh token tersimpan di `/app/data/google-token.json`

---

## Cara Mengetes Upload

### Check Status:
```bash
curl http://localhost:3000/api/auth/google/status
```

Response:
```json
{
  "authorized": true,
  "tokenStatus": {
    "exists": true,
    "isExpired": false,
    "expiresIn": 3540
  }
}
```

### Test Upload Image:
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.jpg" \
  -F "folder=image"
```

### Test Upload Video:
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@video.mp4" \
  -F "folder=video"
```

---

## Cara Verifikasi File di Google Drive

1. Buka https://drive.google.com
2. Buka folder **Cattle Images** atau **Cattle Videos**
3. Cek apakah file sudah muncul
4. Klik file → **Share** → harus ada **"Anyone with the link can view"**

---

## API Endpoints

### GET /api/auth/google/init
Generate authorization URL untuk user grant access

### POST /api/auth/google/callback
Exchange authorization code untuk tokens

### GET /api/auth/google/status
Cek apakah sudah authorized

### POST /api/upload
Upload file ke Google Drive

### POST /api/admin/media
Upload media (images/videos) untuk sapi

---

## Security

1. **Refresh token** HANYA ada di server
2. **Tidak pernah** dikirim ke client
3. **Token tersimpan** di file terenkripsi (`/app/data/google-token.json`)
4. **Auto-refresh** sebelum token expired
5. **Volume mount** di Docker untuk persist tokens

---

## Troubleshooting

### Error: "No OAuth tokens found"
→ Belum authorization. Jalankan `/api/auth/google/init` dan follow authorization flow.

### Error: "invalid_grant"
→ Code sudah expired atau sudah digunakan. Generate code baru.

### Error: "redirect_uri_mismatch"
→ Redirect URI di Google Cloud Console tidak cocok dengan env variable.

---

## Build Status: ✅ SUCCESS
