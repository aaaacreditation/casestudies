import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyContent from '@/components/CaseStudyContent'
import { CaseStudy } from '@/types'

// Mock data - replace with actual API calls
const mockCaseStudies: CaseStudy[] = [
  {
    id: '1',
    title: "Atlassian's AI edge for customer-led growth",
    subtitle: "How Atlassian leveraged customer insights to drive product decisions",
    slug: 'atlassian-ai-customer-growth',
    content: 'Detailed case study content here...',
    excerpt: 'Whenever someone comes and brings the customer insight, that really wins the discussion—because it really reflects what our customers think and how they act.',
    featuredImage: 'https://plus.unsplash.com/premium_photo-1661337299739-42a43d7fe618?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dGVzdGltb25pYWx8ZW58MHx8MHx8fDA%3D',
    tags: ['Technology', 'AI', 'Growth'],
    metrics: {
      'insights_shared': '86% more customer insights shared',
      'time_saved': '48+ hours saved per week'
    },
    published: true,
    featured: true,
    readTime: 8,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    companyId: '1',
    company: {
      id: '1',
      name: 'Atlassian',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D',
      website: 'https://atlassian.com',
      industry: 'Technology',
      location: 'Sydney, Australia',
      size: '12,000+',
      description: 'Software development and collaboration tools',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: '2',
    title: "How customer insights power Breville's product innovation",
    subtitle: "Breville combines everything into one single place for customer data analysis",
    slug: 'breville-product-innovation',
    content: 'Detailed case study content here...',
    excerpt: 'At Breville, we previously used multiple programs and platforms to gather and analyze customer data. Now we have everything in one single place.',
    featuredImage: 'https://images.unsplash.com/photo-1713946598467-fcf9332c56ea?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHNtaWxlJTIwcHJvZmVzc2lvbmFsfGVufDB8fDB8fHww',
    tags: ['Consumer goods', 'Innovation', 'Data Analysis'],
    metrics: {
      'efficiency': '94% increase in insight quality',
      'consolidation': 'Unified 5 platforms into 1'
    },
    published: true,
    featured: false,
    readTime: 6,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    companyId: '2',
    company: {
      id: '2',
      name: 'Breville',
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D',
      website: 'https://breville.com',
      industry: 'Consumer goods',
      location: 'Sydney, Australia',
      size: '1,000+',
      description: 'Kitchen appliances and coffee machines',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
]

interface CaseStudyPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params
  
  // In a real app, this would be an API call
  const caseStudy = mockCaseStudies.find(cs => cs.slug === slug)
  
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