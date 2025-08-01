'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CaseStudyCard from '@/components/CaseStudyCard'
import CaseStudyFilters from '@/components/CaseStudyFilters'
import TestimonialCarousel from '@/components/TestimonialCarousel'
import TestimonialModal from '@/components/TestimonialModal'
import StatsSection from '@/components/StatsSection'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CaseStudy, Testimonial, FilterOptions } from '@/types'

// Mock data - replace with actual API calls
const mockCaseStudies: CaseStudy[] = [
  {
    id: '1',
    title: "Atlassian's AI edge for customer-led growth",
    subtitle: "How Atlassian leveraged customer insights to drive product decisions",
    slug: 'atlassian-ai-customer-growth',
    content: 'Full case study content...',
    excerpt: 'Whenever someone comes and brings the customer insight, that really wins the discussion—because it really reflects what our customers think and how they act.',
    featuredImage: 'https://plus.unsplash.com/premium_photo-1661337299739-42a43d7fe618?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dGVzdGltb25pYWx8ZW58MHx8MHx8fDA%3D',
    tags: ['Technology', 'AI', 'Growth'],
    metrics: {
      'insights_shared': '86% more customer insights shared',
      'time_saved': '48+ hours saved per week'
    },
    published: true,
    featured: true,
    readTime: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    content: 'Full case study content...',
    excerpt: 'At Breville, we previously used multiple programs and platforms to gather and analyze customer data. Now we have everything in one single place.',
    featuredImage: 'https://images.unsplash.com/photo-1713946598467-fcf9332c56ea?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHNtaWxlJTIwcHJvZmVzc2lvbmFsfGVufDB8fDB8fHww',
    tags: ['Consumer goods', 'Innovation', 'Data Analysis'],
    metrics: {
      'efficiency': '94% increase in insight quality',
      'consolidation': 'Unified 5 platforms into 1'
    },
    published: true,
    featured: false,
    readTime: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
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

const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    quote: 'Whenever someone comes and brings the customer insight, that really wins the discussion—because it really reflects what our customers think and how they act.',
    author: 'Martin Jerkovic',
    position: 'Lead Product Designer',
    avatar: 'https://media.istockphoto.com/id/1961053928/photo/testimonial-portrait-of-a-handsome-mature-man.webp?a=1&b=1&s=612x612&w=0&k=20&c=F0JdjYpSfQi-ZY4fek-xnkl9AB3Ztaa8QlXwPZAovTc=',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    companyId: '1',
    company: mockCaseStudies[0].company
  },
  {
    id: '2',
    quote: 'At Breville, we previously used multiple programs and platforms to gather and analyze customer data. Our platform has allowed us to combine everything into one single place.',
    author: 'Andrew Gregorace',
    position: 'Senior UX Designer',
    avatar: 'https://media.istockphoto.com/id/1384357158/photo/portrait-of-a-beautiful-mexican-woman.webp?a=1&b=1&s=612x612&w=0&k=20&c=gGj-Xj7Rduew9bAhz9mjkV5n77o6-dJcwBCZnsIYJpc=',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    companyId: '2',
    company: mockCaseStudies[1].company
  },
  {
    id: '3',
    quote: 'The platform makes getting started with research analysis more approachable and even fun. Our team has never been more engaged with customer insights.',
    author: 'Sarah Chen',
    position: 'Head of Research',
    avatar: 'https://plus.unsplash.com/premium_photo-1661337299739-42a43d7fe618?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dGVzdGltb25pYWx8ZW58MHx8MHx8fDA%3D',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    companyId: '1',
    company: {
      id: '3',
      name: 'Canva',
      logo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxvZ298ZW58MHx8MHx8fDA%3D',
      website: 'https://canva.com',
      industry: 'Technology',
      location: 'Sydney, Australia',
      size: '4,500+',
      description: 'Online graphic design platform',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: '4',
    quote: 'Everything\'s in one place and the team only needs to remember one link. It\'s absolutely our tool end-to-end. I don\'t know what we\'d do without it.',
    author: 'Jules Lipman',
    position: 'Product Designer',
    avatar: 'https://images.unsplash.com/photo-1713946598467-fcf9332c56ea?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHNtaWxlJTIwcHJvZmVzc2lvbmFsfGVufDB8fDB8fHww',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    companyId: '4',
    company: {
      id: '4',
      name: 'SafetyCulture',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YnJhbmR8ZW58MHx8MHx8fDA%3D',
      website: 'https://safetyculture.com',
      industry: 'Technology',
      location: 'Sydney, Australia',
      size: '600+',
      description: 'Workplace safety and quality solutions',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: '5',
    quote: 'Our platform helps us simplify the process of pouring all our customer data and insights into one spot. The efficiency gains are remarkable.',
    author: 'Roy Olende',
    position: 'Head of UX Research',
    avatar: 'https://media.istockphoto.com/id/1961053928/photo/testimonial-portrait-of-a-handsome-mature-man.webp?a=1&b=1&s=612x612&w=0&k=20&c=F0JdjYpSfQi-ZY4fek-xnkl9AB3Ztaa8QlXwPZAovTc=',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    companyId: '5',
    company: {
      id: '5',
      name: 'Zapier',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YnJhbmR8ZW58MHx8MHx8fDA%3D',
      website: 'https://zapier.com',
      industry: 'Technology',
      location: 'San Francisco, USA',
      size: '1,000+',
      description: 'Automation platform that connects apps',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: '6',
    quote: 'The AI features allow us to analyze at volume at lightning speed with sharp accuracy. It\'s accelerated the speed at which we work.',
    author: 'Katie Rodriguez',
    position: 'Senior Product Manager',
    avatar: 'https://media.istockphoto.com/id/1384357158/photo/portrait-of-a-beautiful-mexican-woman.webp?a=1&b=1&s=612x612&w=0&k=20&c=gGj-Xj7Rduew9bAhz9mjkV5n77o6-dJcwBCZnsIYJpc=',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    companyId: '6',
    company: {
      id: '6',
      name: 'Notion',
      logo: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YnJhbmR8ZW58MHx8MHx8fDA%3D',
      website: 'https://notion.so',
      industry: 'Technology',
      location: 'San Francisco, USA',
      size: '500+',
      description: 'All-in-one workspace for teams',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
]

const statsData = [
  {
    label: 'more customer insights shared',
    value: '86%',
    description: 'Teams share insights more frequently across the organization',
    icon: 'trending' as const
  },
  {
    label: 'hours saved per week',
    value: '48+',
    description: 'Time saved on research analysis and insight generation',
    icon: 'clock' as const
  },
  {
    label: 'increase in insight quality',
    value: '94%',
    description: 'Higher quality insights with better depth and accuracy',
    icon: 'award' as const
  }
]

export default function Home() {
  const router = useRouter()
  const [caseStudies] = useState<CaseStudy[]>(mockCaseStudies)
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudy[]>(mockCaseStudies)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTestimonialClick = (testimonial: Testimonial) => {
    // Find the case study associated with this testimonial
    const associatedCaseStudy = mockCaseStudies.find(cs => 
      cs.companyId === testimonial.companyId || 
      cs.company.name === testimonial.company.name
    )
    
    if (associatedCaseStudy) {
      // Navigate to the case study detail page
      router.push(`/case-studies/${associatedCaseStudy.slug}`)
    } else {
      // Fallback to modal if no case study found
      setSelectedTestimonial(testimonial)
      setIsModalOpen(true)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTestimonial(null)
  }

  // Extract available filter options from case studies
  const availableOptions = {
    industries: [...new Set(caseStudies.map(cs => cs.company.industry))],
    sizes: [...new Set(caseStudies.map(cs => cs.company.size))],
    locations: [...new Set(caseStudies.map(cs => cs.company.location))],
    tags: [...new Set(caseStudies.flatMap(cs => cs.tags))]
  }

  // Filter case studies based on filters and search
  useEffect(() => {
    let filtered = caseStudies

    // Apply filters
    if (filters.industry) {
      filtered = filtered.filter(cs => cs.company.industry === filters.industry)
    }
    if (filters.size) {
      filtered = filtered.filter(cs => cs.company.size === filters.size)
    }
    if (filters.location) {
      filtered = filtered.filter(cs => cs.company.location === filters.location)
    }
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(cs => 
        filters.tags!.some(tag => cs.tags.includes(tag))
      )
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(cs =>
        cs.title.toLowerCase().includes(query) ||
        cs.company.name.toLowerCase().includes(query) ||
        cs.excerpt.toLowerCase().includes(query) ||
        cs.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    setFilteredCaseStudies(filtered)
  }, [caseStudies, filters, searchQuery])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a4373] via-[#083455] to-slate-900 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating orbs */}
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#0a4373]/30 to-blue-600/30 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-[#0a4373]/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400/25 to-[#0a4373]/25 rounded-full blur-3xl"
            animate={{
              x: [0, 120, 0],
              y: [0, -80, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Main heading with stagger effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <motion.h1 
                className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200 mb-4 leading-tight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                Customer Success
              </motion.h1>
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                  Stories
                </h1>
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-[#0a4373]/20 to-blue-600/20 blur-2xl rounded-3xl"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </motion.div>
            
            <motion.p 
              className="text-2xl md:text-3xl text-white/80 max-w-5xl mx-auto mb-16 leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Discover how leading teams transform their customer insights process 
              and drive <span className="font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">meaningful business outcomes</span> with our platform.
            </motion.p>

            {/* Animated stats */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-12 mb-16"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              {[
                { number: "500+", label: "Companies", delay: 0.9 },
                { number: "50+", label: "Countries", delay: 1.0 },
                { number: "98%", label: "Satisfaction", delay: 1.1 }
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center group"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: stat.delay }}
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div 
                    className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2"
                    animate={{ 
                      textShadow: [
                        "0 0 20px rgba(59, 130, 246, 0.5)",
                        "0 0 40px rgba(59, 130, 246, 0.8)",
                        "0 0 20px rgba(59, 130, 246, 0.5)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-lg text-white/60 font-medium group-hover:text-white/80 transition-colors">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              <motion.button
                className="relative px-8 py-4 bg-gradient-to-r from-[#0a4373] to-blue-600 text-white font-bold text-lg rounded-2xl shadow-2xl overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{
                    x: [-100, 400],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
                <span className="relative z-10">Explore Stories</span>
              </motion.button>
              
              <motion.button
                className="px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.6)" }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={statsData} />

      {/* Testimonial Carousel */}
      <section className="w-full">
        <TestimonialCarousel 
          testimonials={mockTestimonials} 
          onTestimonialClick={handleTestimonialClick}
        />
      </section>

                        {/* Case Studies Section */}
                  <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-[#0a4373]/5 relative overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0">
                      <motion.div
                        className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-[#0a4373]/10 to-blue-400/10 rounded-full blur-3xl"
                        animate={{
                          x: [0, 50, 0],
                          y: [0, -30, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 15,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-400/8 to-[#0a4373]/8 rounded-full blur-3xl"
                        animate={{
                          x: [0, -40, 0],
                          y: [0, 40, 0],
                          scale: [1, 0.9, 1],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                      <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        {/* Enhanced heading with gradient and effects */}
                        <motion.div
                          className="relative inline-block mb-6"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 1, delay: 0.2 }}
                        >
                          <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-[#0a4373] via-blue-600 to-[#083455] bg-clip-text text-transparent mb-2 relative z-10">
                            Customer Stories
                          </h2>
                          
                          {/* Animated underline */}
                          <motion.div
                            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-[#0a4373] to-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "60%" }}
                            transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                          />
                          
                          {/* Glow effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-[#0a4373]/20 to-blue-500/20 blur-2xl rounded-3xl"
                            animate={{
                              opacity: [0.3, 0.6, 0.3],
                              scale: [0.95, 1.05, 0.95],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </motion.div>

                        {/* Enhanced description */}
                        <motion.div
                          className="relative"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                        >
                          <p className="text-xl md:text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed mb-4">
                            Real stories from teams who transformed their insights process and achieved
                            <span className="font-semibold bg-gradient-to-r from-[#0a4373] to-blue-600 bg-clip-text text-transparent"> remarkable results </span>
                            with our platform.
                          </p>
                          
                          {/* Subtitle with stats */}
                          <motion.div
                            className="flex flex-wrap items-center justify-center gap-8 mt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                          >
                            {[
                              { number: "500+", label: "Success Stories" },
                              { number: "50+", label: "Industries" },
                              { number: "98%", label: "Customer Satisfaction" }
                            ].map((stat, index) => (
                              <motion.div
                                key={stat.label}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.8 + (index * 0.1) }}
                              >
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0a4373] to-blue-600 bg-clip-text text-transparent">
                                  {stat.number}
                                </div>
                                <div className="text-sm text-slate-600 font-medium">
                                  {stat.label}
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        </motion.div>
                      </motion.div>

                                {/* Enhanced Search Bar */}
                      <motion.div
                        className="relative mb-12 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        <div className="relative group">
                          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a4373] w-5 h-5 transition-colors z-10" />
                          <input
                            type="text"
                            placeholder="Search case studies, companies, or industries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none transition-all shadow-lg hover:shadow-xl hover:bg-white text-lg placeholder:text-slate-400"
                          />
                          
                          {/* Animated border glow */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-[#0a4373]/20 to-blue-500/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"
                            animate={{
                              scale: [1, 1.02, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </div>
                      </motion.div>

          {/* Filters */}
          <CaseStudyFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableOptions={availableOptions}
          />

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredCaseStudies.length} of {caseStudies.length} case studies
            </p>
          </div>

          {/* Case Studies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredCaseStudies.map((caseStudy) => (
              <CaseStudyCard
                key={caseStudy.id}
                caseStudy={caseStudy}
              />
            ))}
          </div>

          {/* No Results */}
          {filteredCaseStudies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                No case studies found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setFilters({})
                  setSearchQuery('')
                }}
                className="text-[#0a4373] hover:text-[#0a4373]/80 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

                {/* Testimonial Modal */}
          <TestimonialModal
            testimonial={selectedTestimonial}
            isOpen={isModalOpen}
            onClose={closeModal}
          />

          {/* Footer */}
          <Footer />
    </div>
      )
}
