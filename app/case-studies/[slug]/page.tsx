'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, MapPin, Users, Calendar, Share2, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
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
  params: {
    slug: string
  }
}

export default function CaseStudyPage({ params }: CaseStudyPageProps) {
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be an API call
    const foundCaseStudy = mockCaseStudies.find(cs => cs.slug === params.slug)
    if (foundCaseStudy) {
      setCaseStudy(foundCaseStudy)
    }
    setLoading(false)
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0a4373]"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!caseStudy) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Back Navigation */}
      <div className="bg-slate-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#0a4373] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Case Studies
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Company Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-4 mb-8"
              >
                {caseStudy.company.logo ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-200">
                    <Image
                      src={caseStudy.company.logo}
                      alt={caseStudy.company.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0a4373] to-[#083455] flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {caseStudy.company.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    {caseStudy.company.name}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {caseStudy.company.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {caseStudy.company.size}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  {caseStudy.title}
                </h1>
                {caseStudy.subtitle && (
                  <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                    {caseStudy.subtitle}
                  </p>
                )}
              </motion.div>

              {/* Meta Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-8"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{caseStudy.createdAt.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{caseStudy.readTime} min read</span>
                </div>
                <button className="flex items-center gap-2 hover:text-[#0a4373] transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-slate-50 rounded-2xl p-6 sticky top-24"
              >
                {/* Key Metrics */}
                {caseStudy.metrics && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Key Results</h3>
                    <div className="space-y-4">
                      {Object.entries(caseStudy.metrics).map(([key, value]) => (
                        <div key={key} className="text-center p-4 bg-white rounded-xl">
                          <div className="text-2xl font-bold text-[#0a4373] mb-1">
                            {value.split(' ')[0]}
                          </div>
                          <div className="text-sm text-slate-600">
                            {value.split(' ').slice(1).join(' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {caseStudy.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#0a4373]/10 text-[#0a4373] px-3 py-1 rounded-lg text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Company Details */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Company Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Industry:</span>
                      <span className="text-slate-600 ml-2">{caseStudy.company.industry}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Location:</span>
                      <span className="text-slate-600 ml-2">{caseStudy.company.location}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Size:</span>
                      <span className="text-slate-600 ml-2">{caseStudy.company.size}</span>
                    </div>
                    {caseStudy.company.website && (
                      <div className="pt-2">
                        <Link 
                          href={caseStudy.company.website}
                          className="inline-flex items-center gap-1 text-[#0a4373] hover:text-[#083455] transition-colors font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit Website
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {caseStudy.featuredImage && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative h-96 rounded-2xl overflow-hidden"
            >
              <Image
                src={caseStudy.featuredImage}
                alt={caseStudy.title}
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="prose prose-lg max-w-none"
          >
            {/* Challenge Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">The Challenge</h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                {caseStudy.company.name} was facing significant challenges in managing and analyzing customer feedback across multiple touchpoints. The fragmented approach to customer insights was limiting their ability to make data-driven decisions and respond quickly to customer needs.
              </p>
              <div className="bg-slate-50 border-l-4 border-[#0a4373] p-6 rounded-r-lg">
                <p className="text-slate-700 italic text-lg">
                  "{caseStudy.excerpt}"
                </p>
                <p className="text-slate-600 mt-2 font-medium">
                  — Key stakeholder at {caseStudy.company.name}
                </p>
              </div>
            </div>

            {/* Solution Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">The Solution</h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                We implemented a comprehensive customer insights platform that unified all feedback channels and provided AI-powered analytics to extract actionable insights from customer data.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Data Unification</h3>
                  <p className="text-slate-600">
                    Consolidated feedback from all customer touchpoints into a single, searchable platform.
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">AI Analytics</h3>
                  <p className="text-slate-600">
                    Applied machine learning to identify patterns, sentiment, and actionable insights automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">The Results</h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-8">
                The implementation delivered remarkable results that transformed how {caseStudy.company.name} approaches customer insights and product development.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(caseStudy.metrics).map(([key, value]) => (
                  <div key={key} className="bg-gradient-to-br from-[#0a4373]/5 to-[#083455]/5 border border-[#0a4373]/20 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-[#0a4373] mb-2">
                      {value.split(' ')[0]}
                    </div>
                    <div className="text-slate-700 font-medium">
                      {value.split(' ').slice(1).join(' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#0a4373] to-[#083455] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to transform your customer insights?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join companies like {caseStudy.company.name} in leveraging AI-powered insights to drive growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-[#0a4373] px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Get Started Today
              </Link>
              <Link
                href="/"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                View More Case Studies
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}