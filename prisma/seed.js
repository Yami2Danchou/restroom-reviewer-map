const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')
  
  // Create admin user
  const adminEmail = 'admin@example.com'
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      isAdmin: true
    }
  })
  
  console.log('✅ Admin user created/verified')
  
  // Create a sample place
  const samplePlace = await prisma.place.upsert({
    where: { 
      id: 'sample-place' // This won't work as ID, but we'll use a different approach
    },
    update: {},
    create: {
      name: 'Central Park Restroom',
      description: 'Public restroom near the fountain',
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'Central Park, New York, NY'
    }
  }).catch(() => {
    // If upsert fails, just create a new one
    return prisma.place.create({
      data: {
        name: 'Central Park Restroom',
        description: 'Public restroom near the fountain',
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'Central Park, New York, NY'
      }
    })
  })
  
  console.log('Sample place created')
  
  // Create a sample review
  await prisma.review.create({
    data: {
      rating: 4,
      comment: 'Clean and well-maintained',
      smellLevel: 3,
      placeId: samplePlace.id,
      userId: admin.id
    }
  }).catch(() => {
    console.log('Review might already exist')
  })
  
  console.log('Sample review created')
  console.log('\nAdmin credentials:')
  console.log('   Email: admin@example.com')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })