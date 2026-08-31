# Plan: Migrasi dari IDRIVE E2 ke Google Drive

## Overview

Migrasi lengkap sistem penyimpanan file dari IDRIVE E2 S3-compatible storage ke Google Drive API untuk hosting gambar dan video.

---

## 1. Analisis Current State

### Files yang perlu diubah:

| File | Fungsi | Status |
|------|--------|--------|
| `src/lib/storage/s3.ts` | S3 Client configuration | DELETE |
| `src/lib/storage/upload.ts` | Upload function | REPLACE |
| `src/lib/storage/delete.ts` | Delete function | REPLACE |
| `src/lib/storage/validate.ts` | Environment validation | UPDATE |
| `src/app/api/upload/route.ts` | Upload API endpoint | UPDATE |
| `src/app/api/admin/media/route.ts` | Media API endpoint | UPDATE |
| `package.json` | Dependencies | UPDATE |
| `docker-compose.yml` | Docker environment | UPDATE |
| `.env` | Environment variables | UPDATE |
| `.env.example` | Environment template | UPDATE |

---

## 2. Google Drive Setup

### Service Account Details:
- **Project ID**: `cattle-storage`
- **Service Account Email**: `cattle-uploader@cattle-storage.iam.gserviceaccount.com`
- **Client ID**: `115051808006187801934`

### Folder Structure:
- **Image Folder ID**: `1STZFsxltjtnZdmr8Omt6Rh1Sf3-5S5K-`
- **Video Folder ID**: `1xfCZL2FUFLpmN1EQabEae2feC_iIjdgc`

---

## 3. Implementation Plan

### Phase 1: Update Dependencies

**File**: `package.json`

**Tambah:**
- `googleapis` - Official Google API client library

**Hapus:**
- `@aws-sdk/client-s3` - AWS S3 SDK (IDRIVE)
- `@aws-sdk/s3-request-presigner` - S3 presigner

### Phase 2: Create Google Drive Storage Module

**New File**: `src/lib/storage/google-drive.ts`

**Fitur:**
- Upload file ke Google Drive folder tertentu
- Set file sebagai publicly accessible (anyone with link)
- Delete file dari Google Drive
- Generate public download URL

**Functionality:**
```typescript
uploadToGoogleDrive(buffer, fileName, mimeType, folderId): Promise<{ webContentLink, id }>
deleteFromGoogleDrive(fileId): Promise<void>
makeFilePublic(fileId): Promise<void>
```

### Phase 3: Create Unified Storage Interface

**New File**: `src/lib/storage/index.ts`

**Exports:**
```typescript
export { uploadFile, deleteFile } from './google-drive'
```

### Phase 4: Update API Endpoints

**File**: `src/app/api/upload/route.ts`
- Import dari Google Drive module
- Mapping folder: `image` → `1STZFsxltjtnZdmr8Omt6Rh1Sf3-5S5K-`
- Mapping folder: `video` → `1xfCZL2FUFLpmN1EQabEae2feC_iIjdgc`

**File**: `src/app/api/admin/media/route.ts`
- Update upload call ke Google Drive

### Phase 5: Update Environment Configuration

**Files**: `.env`, `.env.example`, `docker-compose.yml`

**Hapus:**
- `IDRIVE_ACCESS_KEY_ID`
- `IDRIVE_SECRET_ACCESS_KEY`
- `IDRIVE_BUCKET`
- `IDRIVE_ENDPOINT`
- `IDRIVE_REGION`

**Tambah:**
- `GOOGLE_SERVICE_ACCOUNT_JSON` - Full JSON stringified
- `GOOGLE_DRIVE_IMAGE_FOLDER_ID`
- `GOOGLE_DRIVE_VIDEO_FOLDER_ID`

### Phase 6: Cleanup

**Hapus Files:**
- `src/lib/storage/s3.ts`
- `src/lib/storage/validate.ts`

---

## 4. Google Drive API Configuration

### Required Scopes:
- `https://www.googleapis.com/auth/drive.file` - Manage files created by this app
- `https://www.googleapis.com/auth/drive` - Full drive access (for sharing)

### Public Access Strategy:
Google Drive tidak support "public folder" seperti S3. Strategi:
1. Upload file ke folder tertentu
2. Set file permission: `anyone` dengan `reader` role
3. Gunakan `webContentLink` atau `webViewLink` sebagai public URL

**Note:** Google Drive file URLs mengikuti format:
- View: `https://drive.google.com/file/d/{FILE_ID}/view`
- Download: `https://drive.google.com/uc?export=download&id={FILE_ID}`

---

## 5. Security Considerations

### Service Account:
- Credentials disimpan sebagai environment variable
- Tidak pernah exposure ke client-side
- Hanya digunakan di server-side API routes

### File Access:
- Files设置为 "Anyone with the link can view"
- Tidak ada file yang truly public tanpa link

---

## 6. Docker Configuration

### Changes:
- Hapus IDRIVE environment variables
- Tambah Google Drive environment variables
- Service account JSON bisa di-pass sebagai:
  - Multi-line environment variable, ATAU
  - Mount file ke container

**Option 1 (Recommended):** Environment variable dengan escaped JSON
**Option 2:** Volume mount service account JSON file

---

## 7. Testing Plan

### Test Cases:
1. [ ] Upload image via admin panel
2. [ ] Upload video via media page
3. [ ] Verify file appears in Google Drive folder
4. [ ] Verify public URL works (can access without auth)
5. [ ] Delete file and verify removal
6. [ ] Check Docker logs for upload success
7. [ ] Check Docker logs for errors

### Verification Commands:
```bash
# Check if file exists in Google Drive
# (Manual verification via Drive UI)

# Check Docker logs
docker-compose logs -f app | grep -i "google\|upload\|error"

# Test upload API directly
curl -X POST -F "file=@test.jpg" -F "folder=image" http://localhost:3000/api/upload
```

---

## 8. Rollback Plan

Jika terjadi masalah:
1. Simpan current code di git branch `feature/idrive-backup`
2. Jika perlu rollback, revert ke branch tersebut
3. Update `.env` untuk kembali ke IDRIVE credentials

---

## 9. Files Summary

### New Files:
- `src/lib/storage/google-drive.ts` - Google Drive upload/delete logic
- `src/lib/storage/index.ts` - Unified exports

### Modified Files:
- `package.json` - Update dependencies
- `src/lib/storage/upload.ts` - Redirect to Google Drive
- `src/lib/storage/delete.ts` - Redirect to Google Drive
- `src/app/api/upload/route.ts` - Use Google Drive
- `src/app/api/admin/media/route.ts` - Use Google Drive
- `.env` - Update env vars
- `.env.example` - Update template
- `docker-compose.yml` - Update env vars

### Deleted Files:
- `src/lib/storage/s3.ts`
- `src/lib/storage/validate.ts`

---

## 10. Implementation Order

1. Install `googleapis` package
2. Create `src/lib/storage/google-drive.ts`
3. Create `src/lib/storage/index.ts`
4. Update `src/app/api/upload/route.ts`
5. Update `src/app/api/admin/media/route.ts`
6. Update environment files
7. Update `docker-compose.yml`
8. Update `package.json` (remove AWS SDK)
9. Delete old files
10. Test locally
11. Build and deploy

---

## 11. Estimated Time

- Setup & Implementation: ~30 minutes
- Testing: ~15 minutes
- Total: ~45 minutes

---

## 12. Success Criteria

- [x] Build succeeds without errors
- [x] TypeScript compilation passes
- [ ] Images upload successfully to Google Drive
- [ ] Videos upload successfully to Google Drive
- [ ] Public URLs are accessible (no auth required)
- [ ] Files appear in correct folders (image/video)
- [ ] Delete functionality works
- [ ] Docker build succeeds
- [ ] No console errors in production

## 13. Implementation Complete

### Files Created:
- `src/lib/storage/google-drive.ts` - Google Drive API integration
- `src/lib/storage/index.ts` - Unified exports

### Files Deleted:
- `src/lib/storage/s3.ts` - IDRIVE S3 client
- `src/lib/storage/upload.ts` - IDRIVE upload
- `src/lib/storage/delete.ts` - IDRIVE delete
- `src/lib/storage/validate.ts` - IDRIVE validation

### Files Modified:
- `package.json` - Removed AWS SDK, kept googleapis
- `src/app/api/upload/route.ts` - Use Google Drive
- `src/app/api/admin/media/route.ts` - Use Google Drive
- `.env` - Google Drive configuration
- `.env.example` - Google Drive template
- `docker-compose.yml` - Google Drive environment

### Build Status: ✅ SUCCESS
