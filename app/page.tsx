'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'


import CaseStudyCard from '@/components/CaseStudyCard'
import CaseStudyFilters from '@/components/CaseStudyFilters'


import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CaseStudy, FilterOptions } from '@/types'

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
    tags: [],
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
      industry: 'Healthcare',
      location: 'Australia',
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
    tags: [],
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
      industry: 'Training/Education',
      location: 'United Kingdom',
      size: '1,000+',
      description: 'Kitchen appliances and coffee machines',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
]





// Hero animation components
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return windowSize
}

const HeroBeam = ({ top, left, transition = {} }: { top: number; left: number; transition?: object }) => {
  return (
    <motion.div
      initial={{
        y: 0,
        opacity: 0,
      }}
      animate={{
        opacity: [0, 1, 0],
        y: 32 * 8,
      }}
      transition={{
        ease: "easeInOut",
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatDelay: 1.5,
        ...transition,
      }}
      style={{
        top,
        left,
      }}
      className="absolute z-10 h-[64px] w-[1px] bg-gradient-to-b from-[#024985]/0 to-[#024985]"
    />
  )
}

const HeroBeams = () => {
  const { width } = useWindowSize()
  const GRID_BOX_SIZE = 32
  const BEAM_WIDTH_OFFSET = 1

  const numColumns = width ? Math.floor(width / GRID_BOX_SIZE) : 0

  const placements = [
    {
      top: GRID_BOX_SIZE * 0,
      left: Math.floor(numColumns * 0.05) * GRID_BOX_SIZE,
      transition: {
        duration: 3.5,
        repeatDelay: 5,
        delay: 2,
      },
    },
    {
      top: GRID_BOX_SIZE * 12,
      left: Math.floor(numColumns * 0.15) * GRID_BOX_SIZE,
      transition: {
        duration: 3.5,
        repeatDelay: 10,
        delay: 4,
      },
    },
    {
      top: GRID_BOX_SIZE * 3,
      left: Math.floor(numColumns * 0.25) * GRID_BOX_SIZE,
    },
    {
      top: GRID_BOX_SIZE * 9,
      left: Math.floor(numColumns * 0.75) * GRID_BOX_SIZE,
      transition: {
        duration: 2,
        repeatDelay: 7.5,
        delay: 3.5,
      },
    },
    {
      top: 0,
      left: Math.floor(numColumns * 0.7) * GRID_BOX_SIZE,
      transition: {
        duration: 3,
        repeatDelay: 2,
        delay: 1,
      },
    },
    {
      top: GRID_BOX_SIZE * 2,
      left: Math.floor(numColumns * 1) * GRID_BOX_SIZE - GRID_BOX_SIZE,
      transition: {
        duration: 5,
        repeatDelay: 5,
        delay: 5,
      },
    },
  ]

  return (
    <>
      {placements.map((p, i) => (
        <HeroBeam key={i} top={p.top} left={p.left - BEAM_WIDTH_OFFSET} transition={p.transition || {}} />
      ))}
    </>
  )
}

export default function Home() {
  const [caseStudies] = useState<CaseStudy[]>(mockCaseStudies)
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudy[]>(mockCaseStudies)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [searchQuery, setSearchQuery] = useState('')


  // Extract available filter options from case studies
  const availableOptions = {
    countries: [...new Set(caseStudies.map(cs => cs.company.location))]
  }

  // Filter case studies based on filters and search
  useEffect(() => {
    let filtered = caseStudies

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(cs => cs.company.industry === filters.type)
    }
    if (filters.country) {
      filtered = filtered.filter(cs => cs.company.location === filters.country)
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(cs =>
        cs.title.toLowerCase().includes(query) ||
        cs.company.name.toLowerCase().includes(query) ||
        cs.excerpt.toLowerCase().includes(query)
      )
    }

    setFilteredCaseStudies(filtered)
  }, [caseStudies, filters, searchQuery])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Very Light Grid Background */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
          }}
          className="absolute inset-0 z-0"
        >
          <div
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' strokeWidth='0.5' stroke='%23e2e8f0' strokeOpacity='0.4'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
            }}
            className="absolute inset-0 z-0"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/0 to-white" />
        </motion.div>

        {/* Animated Beams */}
        <HeroBeams />

        {/* Top-right CTA */}
        <div className="absolute right-6 top-6 z-20">
          <button
            onClick={() => {
              const customerStoriesSection = document.getElementById('customer-stories');
              if (customerStoriesSection) {
                customerStoriesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            View Stories
          </button>
        </div>

        <div className="relative z-20 mx-auto grid max-w-7xl grid-cols-1 gap-x-16 gap-y-16 px-6 pb-16 pt-20 md:grid-cols-2 md:pb-24 md:pt-28 lg:px-8">
          {/* Left Column */}
          <motion.div
            initial={{
              y: 50,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
            }}
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Customer Success
            </div>

            <motion.h1
              initial={{
                y: 60,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                duration: 1.5,
                delay: 0.3,
                ease: "easeInOut",
              }}
              className="text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl md:text-7xl"
            >
              Customer Success
              <br className="hidden sm:block" /> Stories
            </motion.h1>

            <motion.p
              initial={{
                y: 40,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                duration: 1.5,
                delay: 0.6,
                ease: "easeInOut",
              }}
              className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl"
            >
              Get inspired, learn and read firsthand feedback from teams around the globe on how they are getting value from our platform.
            </motion.p>
          </motion.div>

          {/* Right Column: Metrics */}
          <motion.div
            initial={{
              y: 50,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              duration: 1.5,
              delay: 0.9,
              ease: "easeInOut",
            }}
            className="md:pl-6"
          >
            <ul className="space-y-12">
              <li className="flex flex-col items-start md:items-end">
                <div className="text-6xl font-extrabold leading-none text-slate-900 md:text-7xl">
                  86%
                </div>
                <p className="mt-3 max-w-xs text-base font-medium leading-7 text-slate-700 md:text-right">
                  more customer insights shared
                </p>
              </li>
              <li className="flex flex-col items-start md:items-end">
                <div className="text-6xl font-extrabold leading-none text-slate-900 md:text-7xl">
                  48+
                </div>
                <p className="mt-3 max-w-xs text-base font-medium leading-7 text-slate-700 md:text-right">
                  hours saved per week
                </p>
              </li>
              <li className="flex flex-col items-start md:items-end">
                <div className="text-6xl font-extrabold leading-none text-slate-900 md:text-7xl">
                  94%
                </div>
                <p className="mt-3 max-w-xs text-base font-medium leading-7 text-slate-700 md:text-right">
                  increase in insight quality
                </p>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

                        {/* Case Studies Section */}
                  <section id="customer-stories" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-[#0a4373]/5 relative overflow-hidden">
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
                          <h2 className="text-5xl md:text-6xl font-black text-[#0a4373] mb-2 relative z-10">
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
                            <span className="font-semibold text-[#0a4373]"> remarkable results </span>
                            with our platform.
                          </p>
                          

                        </motion.div>
                      </motion.div>

          {/* Filters */}
          <CaseStudyFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableOptions={availableOptions}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
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



          {/* Footer */}
          <Footer />
    </div>
      )
}
