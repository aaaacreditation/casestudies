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

export enum MediaType {
  IMAGE_ONLY = 'IMAGE_ONLY',
  VIDEO_ONLY = 'VIDEO_ONLY',
  IMAGE_AND_VIDEO = 'IMAGE_AND_VIDEO'
}

export interface Media {
  id: string
  url: string
  type: string
  filename: string
  size?: number
  mimetype: string
  createdAt: Date
  caseStudyId: string
}

export interface CaseStudy {
  id: string
  title: string
  subtitle?: string
  slug: string
  content: string
  excerpt: string
  featuredImage?: string
  featuredVideo?: string
  mediaType: MediaType
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
  media?: Media[]
}

export interface User {
  id: string
  name?: string
  email: string
  role: string
  image?: string
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
  type?: string
  country?: string
}