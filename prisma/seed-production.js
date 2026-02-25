const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting Davao City restroom database seed...')
  
  const now = new Date()
  
  // Create users
  const adminEmail = 'admin@mail.com'
  let admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: await bcrypt.hash('qwerty123', 10),
      name: 'Admin User',
      isAdmin: true,
      createdAt: now,
      updatedAt: now
    }
  })

  const userEmail = 'user@mail.com'
  let regularUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      password: await bcrypt.hash('password123', 10),
      name: 'Regular User',
      isAdmin: false,
      createdAt: now,
      updatedAt: now
    }
  })

  // Comprehensive Davao City Restroom Database
  const davaoRestrooms = [
    // SM Malls
    {
      name: 'SM Lanang Premier - Ground Floor Restroom',
      description: 'Modern, clean restroom near the main entrance. Features automatic flush, sensor taps, and hand dryers. Has family room with baby changing station.',
      latitude: 7.0972,
      longitude: 125.6125,
      address: 'Ground Floor, SM Lanang Premier, J.P. Laurel Ave',
      district: 'Buhangin',
      barangay: 'Buhangin',
      category: 'Mall',
      amenities: { wheelchair: true, bidet: true, babyChanging: true, freeTissue: true, aircon: true }
    },
    {
      name: 'SM Lanang Premier - Food Court Restroom',
      description: 'Located near the food court. Busy but well-maintained with 8 stalls. Cleaning staff present during peak hours.',
      latitude: 7.0975,
      longitude: 125.6128,
      address: 'Upper Ground Floor, SM Lanang Premier',
      district: 'Buhangin',
      barangay: 'Buhangin',
      category: 'Mall',
      amenities: { wheelchair: true, bidet: true, babyChanging: false, freeTissue: false, aircon: true }
    },
    {
      name: 'SM Lanang Premier - Cinema Level Restroom',
      description: 'Restroom near the cinemas. Very clean with premium fixtures. Less crowded than ground floor.',
      latitude: 7.0970,
      longitude: 125.6123,
      address: 'Cinema Level, SM Lanang Premier',
      district: 'Buhangin',
      barangay: 'Buhangin',
      category: 'Mall',
      amenities: { wheelchair: true, bidet: true, babyChanging: true, freeTissue: true, aircon: true }
    },
    {
      name: 'SM City Davao - Annex Restroom',
      description: 'Spacious restroom in the annex building. Clean and well-lit. Has nursing station.',
      latitude: 7.0889,
      longitude: 125.6147,
      address: 'SM City Davao Annex, Ecoland',
      district: 'Ecoland',
      barangay: 'Matina',
      category: 'Mall',
      amenities: { wheelchair: true, bidet: true, babyChanging: true, freeTissue: false, aircon: true }
    },
    {
      name: 'SM City Davao - Main Building Restroom',
      description: 'Recently renovated restroom with modern fixtures. Has separate entrance for PWD.',
      latitude: 7.0885,
      longitude: 125.6150,
      address: 'Main Building, SM City Davao',
      district: 'Ecoland',
      barangay: 'Matina',
      category: 'Mall',
      amenities: { wheelchair: true, bidet: true, babyChanging: true, freeTissue: false, aircon: true }
    },

    // Abreeza Mall
    {
      name: 'Abreeza Mall - Ground Floor Restroom',
      description: 'Clean and modern with good lighting. Has family room and wheelchair accessible stall. Free tissue provided.',
      latitude: 7.0644,
      longitude: 125.6078,
      address: 'Ground Floor, Abreeza Mall, J.P. Laurel Ave',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Mall',
      amenities: { wheelchair: true, bidet: true, babyChanging: true, freeTissue: true, aircon: true }
    },
    {
      name: 'Abreeza Mall - Upper Ground Restroom',
      description: 'Less crowded with nice ambiance. Features bidet sprays and hand dryers. Clean throughout.',
      latitude: 7.0646,
      longitude: 125.6080,
      address: 'Upper Ground, Abreeza Mall',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Mall',
      amenities: { wheelchair: true, bidet: true, babyChanging: false, freeTissue: true, aircon: true }
    },
    {
      name: 'Abreeza Mall - Cinema Level Restroom',
      description: 'Restroom near cinemas. Very clean and well-maintained. Has premium soap and tissue.',
      latitude: 7.0648,
      longitude: 125.6082,
      address: 'Cinema Level, Abreeza Mall',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Mall',
      amenities: { wheelchair: true, bidet: true, babyChanging: false, freeTissue: true, aircon: true }
    },

    // Gaisano Malls
    {
      name: 'Gaisano Mall of Davao - Ground Floor',
      description: 'Basic but clean public restroom. Recently renovated with new tiles and fixtures.',
      latitude: 7.0805,
      longitude: 125.6118,
      address: 'Gaisano Mall, C.M. Recto St',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Mall',
      amenities: { wheelchair: true, bidet: true, babyChanging: false, freeTissue: false, aircon: true }
    },
    {
      name: 'Gaisano Grand Citygate',
      description: 'Clean restroom with good maintenance. Has bidet and hand soap.',
      latitude: 7.0867,
      longitude: 125.6161,
      address: 'Gaisano Grand, Citygate, Davao City',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Mall',
      amenities: { wheelchair: false, bidet: true, babyChanging: false, freeTissue: false, aircon: true }
    },

    // Public Parks and Spaces
    {
      name: "People's Park Restroom - Main",
      description: 'Public restroom inside People\'s Park. Well-maintained with plants and good ventilation. Free of charge.',
      latitude: 7.0689,
      longitude: 125.6085,
      address: "People's Park, Davao City",
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Park',
      amenities: { wheelchair: true, bidet: false, babyChanging: false, freeTissue: false, aircon: false }
    },
    {
      name: "People's Park Restroom - Children's Play Area",
      description: 'Restroom near the children\'s playground. Family-friendly with smaller toilets for kids.',
      latitude: 7.0692,
      longitude: 125.6088,
      address: "People's Park (Children's Area), Davao City",
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Park',
      amenities: { wheelchair: true, bidet: false, babyChanging: true, freeTissue: false, aircon: false }
    },
    {
      name: 'Rizal Park Restroom',
      description: 'Public restroom in Rizal Park. Clean with attendant. Minimal fee of ₱5.',
      latitude: 7.0647,
      longitude: 125.6072,
      address: 'Rizal Park, Davao City',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Park',
      amenities: { wheelchair: true, bidet: false, babyChanging: false, freeTissue: false, aircon: false }
    },

    // Public Markets
    {
      name: 'Bankerohan Public Market Restroom',
      description: 'Public market restroom - surprisingly clean! Has attendant 24/7. Minimal fee of ₱5.',
      latitude: 7.0649,
      longitude: 125.6178,
      address: 'Bankerohan Public Market, Davao City',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Market',
      amenities: { wheelchair: false, bidet: false, babyChanging: false, freeTissue: false, aircon: false }
    },
    {
      name: 'Ecoland Public Market Restroom',
      description: 'Well-maintained public market restroom. Has separate sections for men and women.',
      latitude: 7.0467,
      longitude: 125.6033,
      address: 'Ecoland Public Market, Davao City',
      district: 'Ecoland',
      barangay: 'Matina',
      category: 'Market',
      amenities: { wheelchair: true, bidet: false, babyChanging: false, freeTissue: false, aircon: false }
    },
    {
      name: 'Agdao Public Market Restroom',
      description: 'Basic but clean. Attendant on duty. Has bidet spray.',
      latitude: 7.0944,
      longitude: 125.6322,
      address: 'Agdao Public Market, Davao City',
      district: 'Agdao',
      barangay: 'Agdao',
      category: 'Market',
      amenities: { wheelchair: false, bidet: true, babyChanging: false, freeTissue: false, aircon: false }
    },

    // Transportation Hubs
    {
      name: 'Davao International Airport - Departure Area',
      description: 'Very clean, modern airport restroom. Has all amenities: bidet, hand dryer, tissue, soap. Maintained by airport staff.',
      latitude: 7.1258,
      longitude: 125.6467,
      address: 'Davao International Airport (Departure Area), Davao City',
      district: 'Buhangin',
      barangay: 'Buhangin',
      category: 'Airport',
      amenities: { wheelchair: true, bidet: true, babyChanging: true, freeTissue: true, aircon: true }
    },
    {
      name: 'Davao International Airport - Arrival Area',
      description: 'Clean restroom in arrival area. Good for freshening up after long flight.',
      latitude: 7.1255,
      longitude: 125.6464,
      address: 'Davao International Airport (Arrival Area), Davao City',
      district: 'Buhangin',
      barangay: 'Buhangin',
      category: 'Airport',
      amenities: { wheelchair: true, bidet: true, babyChanging: true, freeTissue: true, aircon: true }
    },
    {
      name: 'Ecoland Bus Terminal Restroom',
      description: 'Bus terminal restroom. Cleaner than most terminals. Has attendant, minimal fee.',
      latitude: 7.0461,
      longitude: 125.6028,
      address: 'Ecoland Bus Terminal, Davao City',
      district: 'Ecoland',
      barangay: 'Matina',
      category: 'Terminal',
      amenities: { wheelchair: true, bidet: false, babyChanging: false, freeTissue: false, aircon: false }
    },

    // Restaurants and Cafes
    {
      name: 'McDonald\'s - SM Lanang',
      description: 'Fast food restroom. Clean and well-maintained. Available for customers.',
      latitude: 7.0970,
      longitude: 125.6120,
      address: "McDonald's SM Lanang, Davao City",
      district: 'Buhangin',
      barangay: 'Buhangin',
      category: 'Restaurant',
      amenities: { wheelchair: true, bidet: false, babyChanging: false, freeTissue: true, aircon: true }
    },
    {
      name: 'Jollibee - Abreeza',
      description: 'Fast food restroom. Standard Jollibee cleanliness. Has洗手间.',
      latitude: 7.0642,
      longitude: 125.6075,
      address: 'Jollibee Abreeza, Davao City',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Restaurant',
      amenities: { wheelchair: true, bidet: false, babyChanging: false, freeTissue: false, aircon: true }
    },

    // Hotels
    {
      name: 'Marco Polo Hotel - Lobby Restroom',
      description: 'Luxury hotel restroom. Extremely clean with premium amenities. Open to public.',
      latitude: 7.0744,
      longitude: 125.6112,
      address: 'Marco Polo Hotel, Davao City',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Hotel',
      amenities: { wheelchair: true, bidet: true, babyChanging: true, freeTissue: true, aircon: true }
    },
    {
      name: 'Seda Hotel - Abreeza',
      description: 'Modern hotel restroom. Very clean with good lighting. Open to public.',
      latitude: 7.0640,
      longitude: 125.6072,
      address: 'Seda Hotel, Abreeza, Davao City',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Hotel',
      amenities: { wheelchair: true, bidet: true, babyChanging: true, freeTissue: true, aircon: true }
    },

    // Hospitals
    {
      name: 'Davao Doctors Hospital - Ground Floor',
      description: 'Hospital restroom. Very clean and sanitized regularly. Has wheelchair access.',
      latitude: 7.0717,
      longitude: 125.6108,
      address: 'Davao Doctors Hospital, Davao City',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Hospital',
      amenities: { wheelchair: true, bidet: true, babyChanging: true, freeTissue: true, aircon: true }
    },
    {
      name: 'San Pedro Hospital - Outpatient Dept',
      description: 'Clean hospital restroom near outpatient department. Well-maintained.',
      latitude: 7.0694,
      longitude: 125.6092,
      address: 'San Pedro Hospital, Davao City',
      district: 'Poblacion',
      barangay: 'Poblacion',
      category: 'Hospital',
      amenities: { wheelchair: true, bidet: true, babyChanging: true, freeTissue: true, aircon: true }
    }
  ]

  // Create restrooms and add reviews
  for (const restroomData of davaoRestrooms) {
    const existing = await prisma.place.findFirst({
      where: { name: restroomData.name }
    })

    let place
    if (!existing) {
      place = await prisma.place.create({
        data: {
          name: restroomData.name,
          description: restroomData.description,
          latitude: restroomData.latitude,
          longitude: restroomData.longitude,
          address: restroomData.address,
          city: 'Davao City',
          district: restroomData.district,
          barangay: restroomData.barangay,
          category: restroomData.category,
          amenities: restroomData.amenities,
          status: 'active',
          createdAt: now,
          updatedAt: now
        }
      })
      console.log(`✅ Created: ${restroomData.name}`)
    } else {
      place = existing
    }

    // Add realistic reviews
    const reviewCount = await prisma.review.count({
      where: { placeId: place.id }
    })

    if (reviewCount === 0) {
      // Generate realistic reviews based on category
      const reviews = []
      
      if (restroomData.category === 'Mall') {
        reviews.push(
          { rating: 5, comment: 'Very clean and well-maintained. Has all amenities.', smellLevel: 2, cleanliness: 5, accessibility: 5 },
          { rating: 4, comment: 'Good restroom, but can get busy during weekends.', smellLevel: 3, cleanliness: 4, accessibility: 4 },
          { rating: 5, comment: 'Best restroom in the mall! Always clean.', smellLevel: 1, cleanliness: 5, accessibility: 5 }
        )
      } else if (restroomData.category === 'Park') {
        reviews.push(
          { rating: 4, comment: 'Clean for a public park restroom. Has attendant.', smellLevel: 3, cleanliness: 4, accessibility: 3 },
          { rating: 3, comment: 'Okay for emergency, but could be better.', smellLevel: 4, cleanliness: 3, accessibility: 3 }
        )
      } else if (restroomData.category === 'Airport') {
        reviews.push(
          { rating: 5, comment: 'Very clean airport restroom. Premium experience.', smellLevel: 1, cleanliness: 5, accessibility: 5 },
          { rating: 5, comment: 'Always clean and well-stocked.', smellLevel: 1, cleanliness: 5, accessibility: 5 }
        )
      } else {
        reviews.push(
          { rating: 4, comment: 'Clean and decent.', smellLevel: 3, cleanliness: 4, accessibility: 3 },
          { rating: 3, comment: 'Average restroom.', smellLevel: 4, cleanliness: 3, accessibility: 3 }
        )
      }

      for (const review of reviews) {
        await prisma.review.create({
          data: {
            rating: review.rating,
            comment: review.comment,
            smellLevel: review.smellLevel,
            cleanliness: review.cleanliness,
            accessibility: review.accessibility,
            placeId: place.id,
            userId: regularUser.id,
            createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            updatedAt: now
          }
        })
      }
      console.log(`✅ Added reviews for: ${restroomData.name}`)
    }
  }

  console.log(`\n✅ Successfully seeded ${davaoRestrooms.length} restrooms in Davao City!`)
  console.log('\n📝 Login credentials:')
  console.log('   Admin: admin@mail.com / qwerty123')
  console.log('   User: user@mail.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })