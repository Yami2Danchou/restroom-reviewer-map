const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting production seed...')
  
  // Create admin user if doesn't exist
  const adminEmail = 'admin@example.com'
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        isAdmin: true
      }
    })
    console.log('✅ Admin user created')
  } else {
    console.log('✅ Admin user already exists')
  }

  // Create guest user if doesn't exist
  const guestEmail = 'guest@example.com'
  const guestExists = await prisma.user.findUnique({
    where: { email: guestEmail }
  })

  if (!guestExists) {
    const hashedPassword = await bcrypt.hash('guest123', 10)
    await prisma.user.create({
      data: {
        email: guestEmail,
        password: hashedPassword,
        name: 'Guest User',
        isAdmin: false
      }
    })
    console.log('✅ Guest user created')
  } else {
    console.log('✅ Guest user already exists')
  }

  // Create sample places in different cities
  const samplePlaces = [
    {
      name: 'Central Park Restroom',
      description: 'Public restroom near the fountain',
      latitude: 40.7678,
      longitude: -73.9718,
      address: 'Central Park, New York, NY',
      city: 'New York',
      country: 'USA'
    },
    {
      name: 'Tokyo Station Restroom',
      description: 'Clean restroom inside Tokyo Station',
      latitude: 35.6812,
      longitude: 139.7671,
      address: 'Tokyo Station, Chiyoda City, Tokyo',
      city: 'Tokyo',
      country: 'Japan'
    },
    {
      name: 'London Underground Restroom',
      description: 'Public restroom at Oxford Circus station',
      latitude: 51.5152,
      longitude: -0.1419,
      address: 'Oxford Circus, London',
      city: 'London',
      country: 'UK'
    }
  ]

  for (const placeData of samplePlaces) {
    const existing = await prisma.place.findFirst({
      where: { name: placeData.name }
    })

    if (!existing) {
      await prisma.place.create({
        data: placeData
      })
      console.log(`✅ Sample place created: ${placeData.name}`)
    }
  }

  console.log('\n📝 Demo credentials:')
  console.log('   Admin: admin@example.com / admin123')
  console.log('   Guest: guest@example.com / guest123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })