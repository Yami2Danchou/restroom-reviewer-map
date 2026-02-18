import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { authMiddleware } from '@/app/lib/middleware'
import prisma from '@/app/lib/prisma'

export const dynamic = 'force-dynamic'

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
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    await mkdir(uploadDir, { recursive: true })

    // Save file
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Save to database
    const photo = await prisma.photo.create({
      data: {
        url: `/uploads/${filename}`,
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
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

export const POST = authMiddleware(handler)