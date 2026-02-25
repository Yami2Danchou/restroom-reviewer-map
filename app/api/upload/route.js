import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { authMiddleware } from '@/app/lib/middleware'
import prisma from '@/app/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 60
export const runtime = 'nodejs'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function handler(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const placeId = formData.get('placeId')

    if (!file || !placeId) {
      return NextResponse.json(
        { error: 'File and placeId are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Check if place exists
    const place = await prisma.place.findUnique({
      where: { id: placeId }
    })

    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'restroom-reviewer', // Organize uploads in a folder
          public_id: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '-')}`,
          resource_type: 'auto',
          transformation: [
            { width: 1000, crop: 'limit' }, // Limit max width
            { quality: 'auto' }, // Auto-optimize quality
            { fetch_format: 'auto' } // Auto-convert to webp when possible
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    // Save to database with Cloudinary URL
    const photo = await prisma.photo.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        placeId: placeId,
        uploadedById: req.user.id
      }
    })

    return NextResponse.json({ 
      success: true, 
      photo: {
        id: photo.id,
        url: photo.url,
        publicId: result.public_id
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed: ' + error.message },
      { status: 500 }
    )
  }
}

export const POST = authMiddleware(handler)