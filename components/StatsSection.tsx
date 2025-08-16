'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Clock, Award } from 'lucide-react'

interface StatsSectionProps {
  stats: {
    label: string
    value: string
    description: string
    icon: 'trending' | 'clock' | 'award'
  }[]
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'trending':
        return <TrendingUp className="w-8 h-8" />
      case 'clock':
        return <Clock className="w-8 h-8" />
      case 'award':
        return <Award className="w-8 h-8" />
      default:
        return <TrendingUp className="w-8 h-8" />
    }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-[#0a4373]/20 hover:-translate-y-2">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#0a4373] to-[#083455] text-white rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  {getIcon(stat.icon)}
                </div>
                
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
                  className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#0a4373] to-[#083455] bg-clip-text text-transparent mb-3 text-center"
                >
                  {stat.value}
                </motion.div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">
                  {stat.label}
                </h3>
                
                <p className="text-slate-600 text-center leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional trust indicators */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-slate-500 text-sm mb-6">Trusted by leading companies worldwide</p>
          <div className="flex items-center justify-center gap-8 opacity-40">
            {/* Placeholder for company logos */}
            <div className="w-24 h-8 bg-slate-200 rounded"></div>
            <div className="w-24 h-8 bg-slate-200 rounded"></div>
            <div className="w-24 h-8 bg-slate-200 rounded"></div>
            <div className="w-24 h-8 bg-slate-200 rounded"></div>
            <div className="w-24 h-8 bg-slate-200 rounded"></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}