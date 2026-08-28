# Task 1.2: Setup Prisma and Database Schema

## Goal
Set up Prisma ORM with PostgreSQL schema and seed data.

## Files to Create
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/db/prisma.ts`

## Database Schema

### Cattle Model
```prisma
model Cattle {
  id           String   @id @default(cuid())
  code         String   @unique
  name         String
  breed        String
  status       Status   @default(AVAILABLE)
  birthDate    DateTime @map("birth_date")
  height       Float?
  price        Decimal  @db.Decimal(15, 2)
  targetWeight Float?   @map("target_weight")
  description  String?   @db.Text
  mainImage   String?   @map("main_image")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  weights       CattleWeight[]
  healthRecords CattleHealthRecord[]
  feedRecords   CattleFeedRecord[]
  media         CattleMedia[]

  @@index([status])
  @@index([breed])
}
```

### Status Enum
```prisma
enum Status {
  AVAILABLE
  SOLD
  RESERVED
  ARCHIVED
}
```

### CattleWeight Model
```prisma
model CattleWeight {
  id              String   @id @default(cuid())
  cattleId        String   @map("cattle_id")
  cattle          Cattle   @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  weight          Float
  measurementDate DateTime @map("measurement_date")
  notes           String?  @db.Text
  createdAt       DateTime @default(now()) @map("created_at")

  media CattleWeightMedia[]

  @@index([cattleId])
  @@index([measurementDate])
}
```

### CattleWeightMedia Model
```prisma
model CattleWeightMedia {
  id        String       @id @default(cuid())
  weightId  String       @map("weight_id")
  weight    CattleWeight @relation(fields: [weightId], references: [id], onDelete: Cascade)
  fileUrl   String       @map("file_url")
  fileType  String       @map("file_type")
  createdAt DateTime     @default(now()) @map("created_at")
}
```

### CattleHealthRecord Model
```prisma
model CattleHealthRecord {
  id         String       @id @default(cuid())
  cattleId   String       @map("cattle_id")
  cattle     Cattle       @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  recordDate DateTime     @map("record_date")
  healthType String       @map("health_type")
  status     HealthStatus @default(SEHAT)
  notes      String?      @db.Text
  createdAt  DateTime     @default(now()) @map("created_at")

  media CattleHealthMedia[]

  @@index([cattleId])
}

enum HealthStatus {
  SEHAT
  DALAM_PERAWATAN
  OBSERVASI
  SAKIT
  SEMBUH
}
```

### CattleHealthMedia Model
```prisma
model CattleHealthMedia {
  id             String             @id @default(cuid())
  healthRecordId String             @map("health_record_id")
  healthRecord   CattleHealthRecord @relation(fields: [healthRecordId], references: [id], onDelete: Cascade)
  fileUrl        String             @map("file_url")
  fileType       String             @map("file_type")
  createdAt      DateTime           @default(now()) @map("created_at")
}
```

### CattleFeedRecord Model
```prisma
model CattleFeedRecord {
  id         String   @id @default(cuid())
  cattleId   String   @map("cattle_id")
  cattle     Cattle   @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  recordDate DateTime @map("record_date")
  feedType   String   @map("feed_type")
  amount     String
  frequency  String
  notes      String?  @db.Text
  createdAt DateTime  @default(now()) @map("created_at")

  @@index([cattleId])
}
```

### CattleMedia Model
```prisma
model CattleMedia {
  id          String        @id @default(cuid())
  cattleId    String        @map("cattle_id")
  cattle      Cattle        @relation(fields: [cattleId], references: [id], onDelete: Cascade)
  category    MediaCategory @default(GENERAL)
  fileUrl     String        @map("file_url")
  fileType    String       @map("file_type")
  title       String?
  description String?
  createdAt   DateTime      @default(now()) @map("created_at")

  @@index([cattleId])
}

enum MediaCategory {
  GENERAL
  WEIGHT
  HEALTH
  OTHER
}
```

### Admin Model
```prisma
model Admin {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  name      String
  role      AdminRole @default(STAFF)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
}

enum AdminRole {
  ADMIN
  STAFF
}
```

## Prisma Client Singleton (src/lib/db/prisma.ts)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Seed Data
Create 10 cattle with:
- Codes: NF-26001 through NF-26010
- Names: Brahman Alpha, Simental Bravo, Angus Charlie, Brahman Beta, Limousin Delta, Simental Echo, Angus Foxtrot, Brahman Gamma, Limousin Hotel, Simental India
- Breeds: Mix of Limousin, Simental, Brahman, Angus
- Status: Mix of AVAILABLE, SOLD, RESERVED, ARCHIVED
- Birth dates: Various 2025 dates
- Heights: 138-160 cm
- Prices: 38-65 million IDR
- Target weights: 580-750 kg
- Main images: Use Unsplash cattle images

Each cattle should have:
- 5 weight records (spaced 10-60 days apart)
- 2 health records
- 2 feed records
- 3 media items

Create admin user: admin@sapikatalog.com / admin123

## Steps
1. Create prisma/schema.prisma with all models
2. Create src/lib/db/prisma.ts
3. Create prisma/seed.ts with comprehensive seed data
4. Run npx prisma generate
5. Note: db push will need DATABASE_URL configured - just generate the client for now

## Verification
- prisma generate completes without errors
- Schema validates correctly
