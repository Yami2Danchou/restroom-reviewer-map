import prisma from './prisma'
import { hashPassword } from './auth'

export async function ensureDefaultUsers() {
  try {
    console.log('Checking for default users...')
    
    // Create admin user if doesn't exist
    const adminEmail = 'admin@example.com'
    let admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      const hashedPassword = await hashPassword('admin123')
      admin = await prisma.user.create({
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

    // Create guest/demo user if doesn't exist
    const guestEmail = 'guest@example.com'
    let guest = await prisma.user.findUnique({
      where: { email: guestEmail }
    })

    if (!guest) {
      const hashedPassword = await hashPassword('guest123')
      guest = await prisma.user.create({
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

    // Create a sample restroom in Davao City if none exist
    const placesCount = await prisma.place.count()
    if (placesCount === 0) {
      const samplePlace = await prisma.place.create({
        data: {
          name: 'SM Lanang Restroom',
          description: 'Clean public restroom at SM Lanang Premier',
          latitude: 7.0972,
          longitude: 125.6125,
          address: 'SM Lanang Premier, Davao City'
        }
      })
      console.log('✅ Sample restroom created')

      // Add a sample review from admin
      if (admin) {
        await prisma.review.create({
          data: {
            rating: 4,
            comment: 'Very clean and well-maintained. Has free tissue paper.',
            smellLevel: 2,
            placeId: samplePlace.id,
            userId: admin.id
          }
        })
        console.log('✅ Sample review created')
      }
    }

    return { success: true, admin, guest }
  } catch (error) {
    console.error('Error ensuring default users:', error)
    return { success: false, error }
  }
}