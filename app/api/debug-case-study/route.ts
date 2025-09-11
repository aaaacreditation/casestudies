import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug API: Starting case study data comparison')
    
    // Get all case studies (like the public page does)
    const allCaseStudies = await prisma.caseStudy.findMany({
      include: {
        company: true,
        media: true,
        testimonials: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('📊 Found', allCaseStudies.length, 'case studies total')
    
    // Get the first case study for detailed comparison
    if (allCaseStudies.length > 0) {
      const firstCaseStudy = allCaseStudies[0]
      console.log('🎯 First case study ID:', firstCaseStudy.id)
      console.log('📝 First case study title:', firstCaseStudy.title)
      console.log('📄 First case study content length:', firstCaseStudy.content?.length || 0)
      console.log('📄 First case study content preview:', firstCaseStudy.content?.substring(0, 200) || 'No content')
      
      // Now fetch the same case study by ID
      const singleCaseStudy = await prisma.caseStudy.findUnique({
        where: { id: firstCaseStudy.id },
        include: {
          company: true,
          media: true,
          testimonials: true
        }
      })
      
      console.log('🔍 Single fetch - ID:', singleCaseStudy?.id)
      console.log('📝 Single fetch - title:', singleCaseStudy?.title)
      console.log('📄 Single fetch - content length:', singleCaseStudy?.content?.length || 0)
      console.log('📄 Single fetch - content preview:', singleCaseStudy?.content?.substring(0, 200) || 'No content')
      
      // Compare content
      const contentMatch = firstCaseStudy.content === singleCaseStudy?.content
      console.log('✅ Content matches:', contentMatch)
      
      return NextResponse.json({
        message: 'Debug data comparison',
        totalCaseStudies: allCaseStudies.length,
        firstCaseStudy: {
          id: firstCaseStudy.id,
          title: firstCaseStudy.title,
          contentLength: firstCaseStudy.content?.length || 0,
          contentPreview: firstCaseStudy.content?.substring(0, 200) || 'No content',
          hasContent: !!firstCaseStudy.content,
          company: firstCaseStudy.company?.name
        },
        singleFetch: {
          id: singleCaseStudy?.id,
          title: singleCaseStudy?.title,
          contentLength: singleCaseStudy?.content?.length || 0,
          contentPreview: singleCaseStudy?.content?.substring(0, 200) || 'No content',
          hasContent: !!singleCaseStudy?.content,
          company: singleCaseStudy?.company?.name
        },
        contentMatches: contentMatch,
        allCaseStudyIds: allCaseStudies.map(cs => ({ id: cs.id, title: cs.title, hasContent: !!cs.content }))
      })
    }
    
    return NextResponse.json({
      message: 'No case studies found in database',
      totalCaseStudies: 0
    })
    
  } catch (error) {
    console.error('❌ Debug API Error:', error)
    return NextResponse.json(
      { error: 'Debug API failed', details: error },
      { status: 500 }
    )
  }
}
