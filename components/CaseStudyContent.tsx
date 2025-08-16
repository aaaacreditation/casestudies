'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Users, Share2, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { CaseStudy } from '@/types'

interface CaseStudyContentProps {
  caseStudy: CaseStudy
}

export default function CaseStudyContent({ caseStudy }: CaseStudyContentProps) {
  return (
    <>
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
                className="flex items-center justify-between mb-8"
              >
                <div className="flex items-center gap-4">
                  {caseStudy.company.logo ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-200">
                      <Image
                        src={caseStudy.company.logo}
                        alt={caseStudy.company.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0a4373] to-[#083455] flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {caseStudy.company.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {caseStudy.company.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {caseStudy.company.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {caseStudy.company.size} employees
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share Button */}
                <button className="flex items-center gap-2 text-sm text-[#0a4373] hover:text-[#083455] transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </motion.div>

              {/* Title and Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                  {caseStudy.title}
                </h1>
                {caseStudy.subtitle && (
                  <p className="text-xl text-slate-600 leading-relaxed">
                    {caseStudy.subtitle}
                  </p>
                )}
              </motion.div>



              {/* Featured Image */}
              {caseStudy.featuredImage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mb-12"
                >
                  <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={caseStudy.featuredImage}
                      alt={caseStudy.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </motion.div>
              )}

              {/* Content Sections */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="prose prose-lg max-w-none"
              >
                {/* Challenge Section */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-8 mb-8">
                  <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    The Challenge
                  </h2>
                  <p className="text-red-800 leading-relaxed text-lg">
                    {caseStudy.company.name} faced significant challenges in managing and analyzing customer feedback across multiple platforms. 
                    The scattered data made it difficult to extract actionable insights and make informed product decisions.
                  </p>
                </div>

                {/* Solution Section */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-8">
                  <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    The Solution
                  </h2>
                  <p className="text-blue-800 leading-relaxed text-lg mb-4">
                    By implementing our comprehensive customer insights platform, {caseStudy.company.name} was able to:
                  </p>
                  <ul className="text-blue-800 space-y-2">
                    <li>• Consolidate all customer feedback into a single, unified dashboard</li>
                    <li>• Apply AI-powered analysis to identify trends and patterns</li>
                    <li>• Generate automated reports and actionable recommendations</li>
                    <li>• Enable real-time collaboration across teams</li>
                  </ul>
                </div>

                {/* Results Section */}
                <div className="bg-green-50 border border-green-100 rounded-2xl p-8 mb-8">
                  <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    The Results
                  </h2>
                  <p className="text-green-800 leading-relaxed text-lg mb-6">
                    The implementation delivered remarkable results across key performance indicators:
                  </p>
                  
                  {caseStudy.metrics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {Object.entries(caseStudy.metrics).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-xl p-4 border border-green-200">
                          <div className="text-2xl font-bold text-green-600 mb-1">{value}</div>
                          <div className="text-sm text-green-700 capitalize">{key.replace('_', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quote Section */}
                <div className="bg-slate-100 border-l-4 border-[#0a4373] rounded-r-2xl p-8 mb-8">
                  <blockquote className="text-xl italic text-slate-700 leading-relaxed">
                    &ldquo;{caseStudy.excerpt}&rdquo;
                  </blockquote>
                  <div className="mt-4 text-sm text-slate-600">
                    — Key stakeholder at {caseStudy.company.name}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="sticky top-8 space-y-8"
              >
                {/* Company Details */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Company Details</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Industry</div>
                      <div className="text-slate-900">{caseStudy.company.industry}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Location</div>
                      <div className="text-slate-900">{caseStudy.company.location}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Company Size</div>
                      <div className="text-slate-900">{caseStudy.company.size} employees</div>
                    </div>
                    {caseStudy.company.website && (
                      <div>
                        <div className="text-sm font-medium text-slate-600 mb-1">Website</div>
                        <a 
                          href={caseStudy.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0a4373] hover:text-[#083455] transition-colors inline-flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {caseStudy.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#0a4373]/10 text-[#0a4373] px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-[#0a4373] to-[#083455] rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-bold mb-3">Ready to get started?</h3>
                  <p className="text-blue-100 mb-4 text-sm">
                    See how our platform can transform your customer insights process.
                  </p>
                  <button className="w-full bg-white text-[#0a4373] font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                    Get Started Today
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}