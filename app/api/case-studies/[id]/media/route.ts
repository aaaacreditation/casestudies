import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const formData = await request.formData()

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'case-studies', id)
    await mkdir(uploadsDir, { recursive: true })

    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id }
    })

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      )
    }

    const updateData: { featuredImage?: string; featuredVideo?: string } = {}
    const companyUpdateData: { logo?: string } = {}

    // Handle featured image
    const featuredImage = formData.get('featuredImage') as File
    if (featuredImage) {
      const bytes = await featuredImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filename = `featured-image-${Date.now()}.${featuredImage.name.split('.').pop()}`
      const filepath = join(uploadsDir, filename)
      
      await writeFile(filepath, buffer)
      updateData.featuredImage = `/uploads/case-studies/${id}/${filename}`
    }

    // Handle featured video
    const featuredVideo = formData.get('featuredVideo') as File
    if (featuredVideo) {
      const bytes = await featuredVideo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filename = `featured-video-${Date.now()}.${featuredVideo.name.split('.').pop()}`
      const filepath = join(uploadsDir, filename)
      
      await writeFile(filepath, buffer)
      updateData.featuredVideo = `/uploads/case-studies/${id}/${filename}`
    }

    // Handle company logo
    const companyLogo = formData.get('companyLogo') as File
    if (companyLogo) {
      const bytes = await companyLogo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filename = `company-logo-${Date.now()}.${companyLogo.name.split('.').pop()}`
      const filepath = join(uploadsDir, filename)
      
      await writeFile(filepath, buffer)
      companyUpdateData.logo = `/uploads/case-studies/${id}/${filename}`
    }

    // Handle additional media
    const additionalMediaFiles = formData.getAll('additionalMedia') as File[]
    const mediaRecords = []

    for (const file of additionalMediaFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const filename = `${Date.now()}-${file.name}`
        const filepath = join(uploadsDir, filename)
        
        await writeFile(filepath, buffer)
        
        const mediaRecord = await prisma.media.create({
          data: {
            url: `/uploads/case-studies/${id}/${filename}`,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            filename: file.name,
            size: file.size,
            mimetype: file.type,
            caseStudyId: id
          }
        })
        
        mediaRecords.push(mediaRecord)
      }
    }

    // Update case study with featured media
    const updatedCaseStudy = await prisma.caseStudy.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        media: true
      }
    })

    // Update company logo if provided
    if (companyUpdateData.logo) {
      await prisma.company.update({
        where: { id: caseStudy.companyId },
        data: companyUpdateData
      })
    }

    return NextResponse.json({
      caseStudy: updatedCaseStudy,
      mediaRecords
    })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
}
