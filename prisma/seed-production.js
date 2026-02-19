const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting production seed...')
  
  const now = new Date()
  
  // Create admin user with new credentials
  const adminEmail = 'admin@mail.com'
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!admin) {
    const hashedPassword = await bcrypt.hash('qwerty123', 10)
    admin = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        isAdmin: true,
        createdAt: now,
        updatedAt: now
      }
    })
    console.log('✅ Admin user created with email: admin@mail.com')
  } else {
    // Update existing admin password if needed
    const hashedPassword = await bcrypt.hash('qwerty123', 10)
    admin = await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        password: hashedPassword,
        updatedAt: now
      }
    })
    console.log('✅ Admin user updated with new password')
  }

  // Create a regular user for testing
  const userEmail = 'user@mail.com'
  let regularUser = await prisma.user.findUnique({
    where: { email: userEmail }
  })

  if (!regularUser) {
    const hashedPassword = await bcrypt.hash('password123', 10)
    regularUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: userEmail,
        password: hashedPassword,
        name: 'Regular User',
        isAdmin: false,
        createdAt: now,
        updatedAt: now
      }
    })
    console.log('✅ Regular user created: user@mail.com / password123')
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
    },
    {
      name: 'SM Mall of Asia Restroom',
      description: 'Modern restroom facilities at MOA',
      latitude: 14.5355,
      longitude: 120.9826,
      address: 'MOA, Pasay City',
      city: 'Manila',
      country: 'Philippines'
    }
  ]

  for (const placeData of samplePlaces) {
    const existing = await prisma.place.findFirst({
      where: { name: placeData.name }
    })

    if (!existing) {
      await prisma.place.create({
        data: {
          id: uuidv4(),
          ...placeData,
          createdAt: now,
          updatedAt: now
        }
      })
      console.log(`✅ Sample place created: ${placeData.name}`)
    } else {
      console.log(`⏭️  Place already exists: ${placeData.name}`)
    }
  }

  // Get all places for reviews
  const places = await prisma.place.findMany()
  
  // Create sample reviews
  for (const place of places) {
    const reviewCount = await prisma.review.count({
      where: { placeId: place.id }
    })

    if (reviewCount === 0 && admin && regularUser) {
      // Add admin review
      await prisma.review.create({
        data: {
          id: uuidv4(),
          rating: 5,
          comment: 'Very clean and well-maintained! Highly recommended.',
          smellLevel: 2,
          placeId: place.id,
          userId: admin.id,
          createdAt: now,
          updatedAt: now
        }
      })

      // Add user review
      await prisma.review.create({
        data: {
          id: uuidv4(),
          rating: 4,
          comment: 'Good facilities, clean and accessible.',
          smellLevel: 3,
          placeId: place.id,
          userId: regularUser.id,
          createdAt: now,
          updatedAt: now
        }
      })
      
      console.log(`✅ Sample reviews created for: ${place.name}`)
    }
  }

  console.log('\n📝 Login credentials:')
  console.log('   Admin: admin@mail.com / qwerty123')
  console.log('   User: user@mail.com / password123')
  console.log('\n✅ Production seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })