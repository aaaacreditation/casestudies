'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock, MapPin, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { CaseStudy } from '@/types'

interface CaseStudyCardProps {
  caseStudy: CaseStudy
  index?: number
}

export default function CaseStudyCard({ caseStudy, index = 0 }: CaseStudyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:border-[#0a4373]/30 hover:-translate-y-2 max-w-sm mx-auto"
    >
      {/* Compact Header with Company Info */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          {caseStudy.company.logo ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-[#0a4373]/20 transition-colors">
              <Image
                src={caseStudy.company.logo}
                alt={caseStudy.company.name}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0a4373] to-[#083455] flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {caseStudy.company.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0a4373] transition-colors truncate">
              {caseStudy.company.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium">{caseStudy.company.industry}</span>
              <span>•</span>
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {caseStudy.company.location}
              </span>
            </div>
          </div>
        </div>

        {/* Case Study Title - Compact */}
        <h2 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-[#0a4373] transition-colors leading-tight line-clamp-2">
          {caseStudy.title}
        </h2>

        {/* Excerpt - Shorter */}
        <p className="text-slate-600 mb-4 line-clamp-2 text-sm leading-relaxed">{caseStudy.excerpt}</p>

        {/* Metrics - Compact */}
        {caseStudy.metrics && (
          <div className="flex gap-2 mb-4">
            {Object.entries(caseStudy.metrics).slice(0, 2).map(([key, value]) => (
              <div key={key} className="bg-gradient-to-r from-[#0a4373]/10 to-[#083455]/10 text-[#0a4373] px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#0a4373]/20 flex-1 text-center">
                {value}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Image - Smaller and Inset */}
      {caseStudy.featuredImage && (
        <div className="relative h-32 overflow-hidden mx-5 rounded-xl mb-4">
          <Image
            src={caseStudy.featuredImage}
            alt={caseStudy.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Footer - Compact */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between">
          {/* Tags - Minimal */}
          <div className="flex gap-1 flex-1 mr-3">
            {caseStudy.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-medium truncate"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Read Time & CTA */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{caseStudy.readTime || 5}min</span>
            </div>

            <Link
              href={`/case-studies/${caseStudy.slug}`}
              className="inline-flex items-center gap-1 bg-[#0a4373] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#083455] hover:gap-2 transition-all group-hover:scale-105"
            >
              Read
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}