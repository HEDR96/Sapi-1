import { PrismaClient, Status, HealthStatus, MediaCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.cattleHealthMedia.deleteMany()
  await prisma.cattleWeightMedia.deleteMany()
  await prisma.cattleMedia.deleteMany()
  await prisma.cattleFeedRecord.deleteMany()
  await prisma.cattleHealthRecord.deleteMany()
  await prisma.cattleWeight.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.cattle.deleteMany()

  console.log('Cleared existing data')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.admin.create({
    data: {
      email: 'admin@sapikatalog.com',
      password: hashedPassword,
      name: 'Admin Sapi Katalog',
      role: 'ADMIN',
    },
  })
  console.log('Created admin user: admin@sapikatalog.com / admin123')

  // Unsplash cattle images
  const cattleImages = [
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800',
    'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=800',
    'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800',
    'https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=800',
    'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800',
    'https://images.unsplash.com/photo-1520116468816-95b69f847357?w=800',
  ]

  // Cattle data configuration with prices
  const cattleData = [
    { code: 'NF-20260001', name: 'Brahman Alpha', breed: 'Brahman', status: Status.AVAILABLE, height: 152, price: 55000000, buyPrice: 35000000, targetWeight: 680, birthDate: new Date('2025-01-15'), mainImage: cattleImages[0] },
    { code: 'NF-20260002', name: 'Simental Bravo', breed: 'Simental', status: Status.AVAILABLE, height: 158, price: 62000000, buyPrice: 40000000, targetWeight: 720, birthDate: new Date('2025-02-20'), mainImage: cattleImages[1] },
    { code: 'NF-20260003', name: 'Angus Charlie', breed: 'Angus', status: Status.SOLD, height: 145, price: 48000000, buyPrice: 30000000, targetWeight: 620, birthDate: new Date('2025-03-10'), mainImage: cattleImages[2] },
    { code: 'NF-20260004', name: 'Brahman Beta', breed: 'Brahman', status: Status.BOOKED, height: 160, price: 65000000, buyPrice: 42000000, targetWeight: 750, birthDate: new Date('2025-01-25'), mainImage: cattleImages[3] },
    { code: 'NF-20260005', name: 'Limousin Delta', breed: 'Limousin', status: Status.AVAILABLE, height: 148, price: 52000000, buyPrice: 33000000, targetWeight: 650, birthDate: new Date('2025-04-05'), mainImage: cattleImages[4] },
    { code: 'NF-20260006', name: 'Simental Echo', breed: 'Simental', status: Status.ARCHIVED, height: 155, price: 42000000, buyPrice: 28000000, targetWeight: 600, birthDate: new Date('2025-02-15'), mainImage: cattleImages[5] },
    { code: 'NF-20260007', name: 'Angus Foxtrot', breed: 'Angus', status: Status.AVAILABLE, height: 142, price: 58000000, buyPrice: 37000000, targetWeight: 700, birthDate: new Date('2025-03-22'), mainImage: cattleImages[6] },
    { code: 'NF-20260008', name: 'Brahman Gamma', breed: 'Brahman', status: Status.BOOKED, height: 138, price: 45000000, buyPrice: 29000000, targetWeight: 580, birthDate: new Date('2025-05-01'), mainImage: cattleImages[7] },
    { code: 'NF-20260009', name: 'Limousin Hotel', breed: 'Limousin', status: Status.AVAILABLE, height: 156, price: 61000000, buyPrice: 39000000, targetWeight: 710, birthDate: new Date('2025-04-18'), mainImage: cattleImages[0] },
    { code: 'NF-20260010', name: 'Simental India', breed: 'Simental', status: Status.SOLD, height: 150, price: 38000000, buyPrice: 25000000, targetWeight: 590, birthDate: new Date('2025-01-08'), mainImage: cattleImages[1] },
  ]

  // Create cattle with all related records
  for (let i = 0; i < cattleData.length; i++) {
    const data = cattleData[i]

    try {
      // Create cattle
      const cattle = await prisma.cattle.create({
        data: {
          code: data.code,
          name: data.name,
          breed: data.breed,
          status: data.status,
          birthDate: data.birthDate,
          height: data.height,
          price: data.price,
          buyPrice: data.buyPrice,
          targetWeight: data.targetWeight,
          mainImage: data.mainImage,
          healthCost: Math.floor(Math.random() * 2000000) + 500000, // 500k - 2.5 juta
          feedCost: Math.floor(Math.random() * 3000000) + 1000000, // 1 - 4 juta
          description: `${data.breed} ${data.name.split(' ')[1]} dengan postur tubuh yang kokoh dan sehat. Bobot target ${data.targetWeight}kg dengan tinggi ${data.height}cm.`,
        },
      })

      console.log(`Created cattle: ${data.code} - ${data.name}`)

      // Create 5 weight records (spaced 10-60 days apart)
      const baseWeight = data.targetWeight - 150
      const weightDates = [
        new Date(data.birthDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        new Date(data.birthDate.getTime() + 60 * 24 * 60 * 60 * 1000),
        new Date(data.birthDate.getTime() + 90 * 24 * 60 * 60 * 1000),
        new Date(data.birthDate.getTime() + 120 * 24 * 60 * 60 * 1000),
        new Date(data.birthDate.getTime() + 150 * 24 * 60 * 60 * 1000),
      ]

      for (let w = 0; w < 5; w++) {
        await prisma.cattleWeight.create({
          data: {
            cattleId: cattle.id,
            weight: baseWeight + (w * 30) + Math.random() * 10,
            measurementDate: weightDates[w],
            notes: w === 0 ? 'Pengukuran awal setelah lahir' : `Pengukuran rutin bulan ke-${w + 1}`,
          },
        })
      }

      // Create 2 health records
      const healthTypes = ['Vaksinasi', 'Pemeriksaan Rutin']
      const healthStatuses = [HealthStatus.SEHAT, HealthStatus.DALAM_PERAWATAN]
      for (let h = 0; h < 2; h++) {
        await prisma.cattleHealthRecord.create({
          data: {
            cattleId: cattle.id,
            recordDate: new Date(data.birthDate.getTime() + (45 + h * 60) * 24 * 60 * 60 * 1000),
            healthType: healthTypes[h],
            status: healthStatuses[h],
            notes: `${healthTypes[h]} ${h === 0 ? 'vaksin lengkap' : 'tanpa temuan'} pada sapi ${data.name}`,
          },
        })
      }

      // Create 2 feed records
      const feedTypes = ['Rumput Segar, Konsentrat', 'Jerami, Dedak Padi']
      const amounts = ['15 kg/hari', '10 kg/hari']
      const frequencies = ['2x sehari', '3x sehari']
      for (let f = 0; f < 2; f++) {
        await prisma.cattleFeedRecord.create({
          data: {
            cattleId: cattle.id,
            recordDate: new Date(data.birthDate.getTime() + (30 + f * 45) * 24 * 60 * 60 * 1000),
            feedType: feedTypes[f],
            amount: amounts[f],
            frequency: frequencies[f],
            notes: `Pemberian pakan ${frequencies[f]} dengan komposisi ${feedTypes[f]}`,
          },
        })
      }

      // Create 3 media items
      const mediaCategories = [MediaCategory.GENERAL, MediaCategory.WEIGHT, MediaCategory.HEALTH]
      for (let m = 0; m < 3; m++) {
        await prisma.cattleMedia.create({
          data: {
            cattleId: cattle.id,
            category: mediaCategories[m],
            fileUrl: `https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&cattle=${cattle.id}&media=${m}`,
            fileType: 'image/jpeg',
            title: `${data.name} - ${mediaCategories[m].toLowerCase()}`,
            description: `Foto ${mediaCategories[m].toLowerCase()} dari ${data.name}`,
          },
        })
      }

      console.log(`  - 5 weight records, 2 health records, 2 feed records, 3 media items`)
    } catch (error: any) {
      console.error(`Error creating cattle ${data.code}:`, error.message)
    }
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
