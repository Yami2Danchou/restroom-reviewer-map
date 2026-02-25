import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { authMiddleware } from '@/app/lib/middleware'
import prisma from '@/app/lib/prisma'

export const dynamic = 'force-dynamic'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function handler(req) {
  try {
    const { photoId, publicId } = await req.json()

    if (!photoId || !publicId) {
      return NextResponse.json(
        { error: 'Photo ID and Public ID are required' },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId)

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Photo deleted successfully' 
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Delete failed: ' + error.message },
      { status: 500 }
    )
  }
}

export const POST = authMiddleware(handler)