export interface Company {
  id: string
  name: string
  logo?: string
  website?: string
  industry: string
  location: string
  size: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface CaseStudy {
  id: string
  title: string
  subtitle?: string
  slug: string
  content: string
  excerpt: string
  featuredImage?: string
  tags: string[]
  metrics?: Record<string, string>
  published: boolean
  featured: boolean
  readTime?: number
  createdAt: Date
  updatedAt: Date
  companyId: string
  company: Company
  testimonials?: Testimonial[]
}

export interface Testimonial {
  id: string
  quote: string
  author: string
  position: string
  avatar?: string
  featured: boolean
  createdAt: Date
  updatedAt: Date
  companyId: string
  company: Company
  caseStudyId?: string
  caseStudy?: CaseStudy
}

export interface FilterOptions {
  industry?: string
  size?: string
  location?: string
  tags?: string[]
}