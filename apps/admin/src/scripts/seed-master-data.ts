/**
 * Seed script for master data
 * Run with: npx ts-node --esm src/scripts/seed-master-data.ts
 * Or: node --loader ts-node/esm src/scripts/seed-master-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const masterData = [
  // JENIS_SAPI
  { category: 'JENIS_SAPI', key: 'LIMOSIN', value: 'Limousin', order: 1 },
  { category: 'JENIS_SAPI', key: 'SIMENTAL', value: 'Simental', order: 2 },
  { category: 'JENIS_SAPI', key: 'BRAHMAN', value: 'Brahman', order: 3 },
  { category: 'JENIS_SAPI', key: 'ANGUS', value: 'Angus', order: 4 },
  { category: 'JENIS_SAPI', key: 'PO', value: 'Peranakan Ongole (PO)', order: 5 },
  { category: 'JENIS_SAPI', key: 'BALI', value: 'Bali', order: 6 },
  { category: 'JENIS_SAPI', key: 'MADURA', value: 'Madura', order: 7 },
  { category: 'JENIS_SAPI', key: 'LAINNYA', value: 'Lainnya', order: 99 },

  // JENIS_PAKAN
  { category: 'JENIS_PAKAN', key: 'RUMPUT_GAJAH', value: 'Rumput Gajah', order: 1 },
  { category: 'JENIS_PAKAN', key: 'RUMPUT_NAPIER', value: 'Rumput Napier', order: 2 },
  { category: 'JENIS_PAKAN', key: 'JERAMI', value: 'Jerami Padi', order: 3 },
  { category: 'JENIS_PAKAN', key: 'KANGKUNG', value: 'Kangkung', order: 4 },
  { category: 'JENIS_PAKAN', key: 'GANDUM', value: 'Gandum', order: 5 },
  { category: 'JENIS_PAKAN', key: 'KEDELAI', value: 'Biji Kedelai', order: 6 },
  { category: 'JENIS_PAKAN', key: 'JAGUNG', value: 'Jagung', order: 7 },
  { category: 'JENIS_PAKAN', key: 'KONSENTRAT', value: 'Konsentrat', order: 8 },
  { category: 'JENIS_PAKAN', key: 'AMPAS_TAHU', value: 'Ampas Tahu', order: 9 },
  { category: 'JENIS_PAKAN', key: 'LAINNYA', value: 'Lainnya', order: 99 },

  // STATUS_SAPI
  { category: 'STATUS_SAPI', key: 'AVAILABLE', value: 'Tersedia', order: 1 },
  { category: 'STATUS_SAPI', key: 'BOOKED', value: 'Dibooking', order: 2 },
  { category: 'STATUS_SAPI', key: 'SOLD', value: 'Terjual', order: 3 },
  { category: 'STATUS_SAPI', key: 'ARCHIVED', value: 'Diarchive', order: 4 },
]

async function main() {
  console.log('🌱 Seeding master data...')

  for (const data of masterData) {
    try {
      await prisma.masterData.upsert({
        where: {
          category_key: {
            category: data.category,
            key: data.key,
          },
        },
        update: {
          value: data.value,
          order: data.order,
          isActive: true,
        },
        create: data,
      })
      console.log(`  ✓ ${data.category}: ${data.value}`)
    } catch (error) {
      console.error(`  ✗ Failed to seed ${data.category}:${data.key}`, error)
    }
  }

  console.log('\n✅ Master data seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
