import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id },
      include: {
        company: true,
        media: true,
        testimonials: true
      }
    })

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(caseStudy)
  } catch (error) {
    console.error('Error fetching case study:', error)
    return NextResponse.json(
      { error: 'Failed to fetch case study' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const body = await request.json()

    // Extract company data if present
    const { company: companyData, ...caseStudyData } = body

    // Update case study
    const caseStudy = await prisma.caseStudy.update({
      where: { id },
      data: caseStudyData,
      include: {
        company: true,
        media: true
      }
    })

    // Update company data if provided
    if (companyData && caseStudy.companyId) {
      await prisma.company.update({
        where: { id: caseStudy.companyId },
        data: companyData
      })
    }

    // Fetch updated case study with company data
    const updatedCaseStudy = await prisma.caseStudy.findUnique({
      where: { id },
      include: {
        company: true,
        media: true,
        testimonials: true
      }
    })

    return NextResponse.json(updatedCaseStudy)
  } catch (error) {
    console.error('Error updating case study:', error)
    return NextResponse.json(
      { error: 'Failed to update case study' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.caseStudy.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting case study:', error)
    return NextResponse.json(
      { error: 'Failed to delete case study' },
      { status: 500 }
    )
  }
}
