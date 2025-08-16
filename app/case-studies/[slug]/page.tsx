import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyContent from '@/components/CaseStudyContent'




interface CaseStudyPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params
  
  let caseStudy
  
  try {
    // First try to fetch from API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/case-studies`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      const caseStudies = await response.json()
      caseStudy = caseStudies.find((cs: { slug: string; published: boolean }) => cs.slug === slug && cs.published)
    }
  } catch (error) {
    console.error('Error fetching case study:', error)
  }
  

  
  if (!caseStudy) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <CaseStudyContent caseStudy={caseStudy} />
      <Footer />
    </div>
  )
}