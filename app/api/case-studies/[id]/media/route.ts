import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadToCloudinary } from '@/lib/cloudinary'

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

    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id }
    })

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      )
    }

    const updateData: { featuredImage?: string; featuredVideo?: string; content?: string } = {}
    const companyUpdateData: { logo?: string } = {}

    // Handle featured image
    const featuredImage = formData.get('featuredImage') as File
    if (featuredImage && featuredImage.size > 0) {
      try {
        const imageUrl = await uploadToCloudinary(featuredImage, `case-studies/${id}/featured`)
        updateData.featuredImage = imageUrl
      } catch (error) {
        console.error('Error uploading featured image:', error)
        return NextResponse.json(
          { error: 'Failed to upload featured image' },
          { status: 500 }
        )
      }
    }

    // Handle featured video
    const featuredVideo = formData.get('featuredVideo') as File
    if (featuredVideo && featuredVideo.size > 0) {
      try {
        const videoUrl = await uploadToCloudinary(featuredVideo, `case-studies/${id}/featured`)
        updateData.featuredVideo = videoUrl
      } catch (error) {
        console.error('Error uploading featured video:', error)
        return NextResponse.json(
          { error: 'Failed to upload featured video' },
          { status: 500 }
        )
      }
    }

    // Handle company logo
    const companyLogo = formData.get('companyLogo') as File
    if (companyLogo && companyLogo.size > 0) {
      try {
        const logoUrl = await uploadToCloudinary(companyLogo, `case-studies/${id}/company`)
        companyUpdateData.logo = logoUrl
      } catch (error) {
        console.error('Error uploading company logo:', error)
        return NextResponse.json(
          { error: 'Failed to upload company logo' },
          { status: 500 }
        )
      }
    }

    // Handle content block files
    const contentBlockFiles: { [key: string]: string } = {}
    
    // Get all form data entries for content blocks
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('contentBlock_') && value instanceof File && value.size > 0) {
        const index = key.replace('contentBlock_', '')
        const blockId = formData.get(`contentBlockId_${index}`) as string
        
        if (blockId) {
          try {
            const fileUrl = await uploadToCloudinary(value, `case-studies/${id}/content`)
            contentBlockFiles[blockId] = fileUrl
          } catch (error) {
            console.error(`Error uploading content block file for ${blockId}:`, error)
            // Continue with other files instead of failing completely
          }
        }
      }
    }

    // Update case study content with file URLs
    if (Object.keys(contentBlockFiles).length > 0) {
      try {
        const contentData = JSON.parse(caseStudy.content || '{}')
        
        // Handle new layout format
        if (contentData.layout) {
          // Update blocks in layout columns
          const updatedLayout = {
            ...contentData.layout,
            columns: contentData.layout.columns.map((col: { id: string; blocks: { id: string; [key: string]: unknown }[] }) => ({
              ...col,
              blocks: col.blocks.map((block: { id: string; [key: string]: unknown }) => {
                if (contentBlockFiles[block.id]) {
                  return { ...block, fileUrl: contentBlockFiles[block.id] }
                }
                return block
              })
            }))
          }
          
          // Update available blocks
          const updatedAvailableBlocks = (contentData.availableBlocks || []).map((block: { id: string; [key: string]: unknown }) => {
            if (contentBlockFiles[block.id]) {
              return { ...block, fileUrl: contentBlockFiles[block.id] }
            }
            return block
          })
          
          updateData.content = JSON.stringify({
            layout: updatedLayout,
            availableBlocks: updatedAvailableBlocks
          })
        } 
        // Handle legacy format (array of blocks)
        else if (Array.isArray(contentData)) {
          const updatedBlocks = contentData.map((block: { id: string; [key: string]: unknown }) => {
            if (contentBlockFiles[block.id]) {
              return { ...block, fileUrl: contentBlockFiles[block.id] }
            }
            return block
          })
          
          updateData.content = JSON.stringify(updatedBlocks)
        }
      } catch (error) {
        console.error('Error parsing content blocks:', error)
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
      contentBlockFiles
    })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
}
