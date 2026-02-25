import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { authMiddleware } from '@/app/lib/middleware'
import prisma from '@/app/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 60
export const runtime = 'nodejs'

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

    // Upload to Vercel Blob
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
    })

    // Save to database with the blob URL
    const photo = await prisma.photo.create({
      data: {
        url: blob.url, // Use the Vercel Blob URL
        publicId: filename,
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