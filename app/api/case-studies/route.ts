import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MediaType } from '@/types'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function GET() {
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      include: {
        company: true,
        media: true,
        testimonials: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(caseStudies)
  } catch (error) {
    console.error('Error fetching case studies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch case studies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      subtitle,
      excerpt,
      content,
      companyName,
      companyIndustry,
      companyLocation,
      companySize,
      companyWebsite,
      companyDescription,
      companyLogo,
      tags,
      metrics,
      mediaType,
      published,
      featured,
      featuredVideo
    } = body

    // Generate slug
    const slug = generateSlug(title)

    // Check if slug already exists
    const existingCaseStudy = await prisma.caseStudy.findUnique({
      where: { slug }
    })

    if (existingCaseStudy) {
      return NextResponse.json(
        { error: 'A case study with this title already exists' },
        { status: 400 }
      )
    }

    // Create or find company
    let company = await prisma.company.findFirst({
      where: { 
        name: companyName,
        industry: companyIndustry 
      }
    })

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          logo: companyLogo || '',
          industry: companyIndustry,
          location: companyLocation,
          size: companySize,
          website: companyWebsite,
          description: companyDescription
        }
      })
    }

    // Create case study
    const caseStudy = await prisma.caseStudy.create({
      data: {
        title,
        subtitle,
        slug,
        excerpt,
        content,
        tags: tags || [],
        metrics: metrics || null,
        mediaType: mediaType as MediaType,
        published: published || false,
        featured: featured || false,
        featuredVideo: featuredVideo || null,
        companyId: company.id
      },
      include: {
        company: true,
        media: true
      }
    })

    return NextResponse.json(caseStudy, { status: 201 })
  } catch (error) {
    console.error('Error creating case study:', error)
    return NextResponse.json(
      { error: 'Failed to create case study' },
      { status: 500 }
    )
  }
}
