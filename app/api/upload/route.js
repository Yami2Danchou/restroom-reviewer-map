import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware } from '@/app/lib/middleware'
import prisma from '@/app/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Increase timeout for large files

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

    // Create unique filename
    const fileExtension = file.name.split('.').pop()
    const filename = `${uuidv4()}.${fileExtension}`
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    await mkdir(uploadDir, { recursive: true })

    // Save file
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Create URL for the image
    const imageUrl = `/uploads/${filename}`

    // Save to database
    const photo = await prisma.photo.create({
      data: {
        url: imageUrl,
        publicId: filename, // Use filename as publicId
        placeId: placeId,
        uploadedById: req.user.id
      }
    })

    return NextResponse.json({ 
      success: true, 
      photo: {
        id: photo.id,
        url: photo.url
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}

export const POST = authMiddleware(handler)

// Handle large file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}