'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import Image from 'next/image'
import { Testimonial } from '@/types'

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
  onTestimonialClick?: (testimonial: Testimonial) => void
}

export default function TestimonialCarousel({ 
  testimonials,
  onTestimonialClick
}: TestimonialCarouselProps) {
  if (!testimonials.length) return null

  // Split testimonials into three rows for the scrolling effect
  const splitTestimonials = {
    top: testimonials.slice(0, Math.ceil(testimonials.length / 3)),
    middle: testimonials.slice(Math.ceil(testimonials.length / 3), Math.ceil(testimonials.length * 2 / 3)),
    bottom: testimonials.slice(Math.ceil(testimonials.length * 2 / 3))
  }

  return (
    <div className="bg-gradient-to-br from-[#0a4373] via-[#083455] to-slate-900 py-20 overflow-hidden">
      <div className="mb-16 px-4">
        <div className="text-center">
          <Quote className="w-16 h-16 mx-auto mb-6 text-blue-300" />
          <h2 className="text-white text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Trusted by the world&rsquo;s
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              best teams
            </span>
          </h2>
          <p className="text-center text-blue-100 text-xl max-w-3xl mx-auto leading-relaxed">
            Get inspired, learn and read firsthand feedback from teams around the globe 
            on how they are getting value from our platform.
          </p>
        </div>
      </div>

      <div className="relative -mx-4 md:-mx-8 lg:-mx-16">
        {/* Left gradient fade */}
        <div className="absolute top-0 bottom-0 left-0 w-40 z-10 bg-gradient-to-r from-[#0a4373] via-[#083455] to-transparent" />
        
        {/* Right gradient fade */}
        <div className="absolute top-0 bottom-0 right-0 w-40 z-10 bg-gradient-to-l from-[#0a4373] via-[#083455] to-transparent" />

        <div className="flex flex-col gap-8">
          {/* Top row - moving right */}
          <div className="flex">
            <TestimonialList 
              list={[...splitTestimonials.top, ...splitTestimonials.top, ...splitTestimonials.top]} 
              duration={120} 
              onTestimonialClick={onTestimonialClick}
            />
          </div>

          {/* Middle row - moving left (slower for harmony) */}
          <div className="flex">
            <TestimonialList 
              list={[...splitTestimonials.middle, ...splitTestimonials.middle, ...splitTestimonials.middle]} 
              duration={140} 
              reverse 
              onTestimonialClick={onTestimonialClick}
            />
          </div>

          {/* Bottom row - moving right (medium speed) */}
          <div className="flex">
            <TestimonialList 
              list={[...splitTestimonials.bottom, ...splitTestimonials.bottom, ...splitTestimonials.bottom]} 
              duration={100} 
              onTestimonialClick={onTestimonialClick}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const TestimonialList = ({ 
  list, 
  reverse = false, 
  duration = 50, 
  onTestimonialClick 
}: { 
  list: Testimonial[]
  reverse?: boolean
  duration?: number
  onTestimonialClick?: (testimonial: Testimonial) => void
}) => {
  return (
    <motion.div
      initial={{ translateX: reverse ? "-50%" : "0%" }}
      animate={{ translateX: reverse ? "0%" : "-50%" }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        ease: "linear",
        repeatType: "loop"
      }}
      className="flex gap-6 px-3"
      style={{
        willChange: 'transform'
      }}
    >
      {list.map((testimonial, index) => (
        <motion.div
          key={`${testimonial.id}-${index}`}
          className="shrink-0 w-[420px] bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-blue-300/50 hover:bg-white/15 transition-all duration-300 cursor-pointer group shadow-xl"
          onClick={() => onTestimonialClick?.(testimonial)}
          whileHover={{ 
            y: -8, 
            scale: 1.04,
            rotateY: 5,
            transition: { duration: 0.3, ease: "easeOut" }
          }}
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 4 + (index * 0.5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2
          }}
        >
          <div className="grid grid-cols-[120px,_1fr] h-full">
            {/* Avatar section */}
            <div className="relative bg-gradient-to-br from-[#0a4373] to-[#083455] p-4 flex items-center justify-center overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
              >
                {testimonial.avatar ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white/30 shadow-lg">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-3 border-white/30 shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                )}
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              
              {/* Subtle animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.1
                }}
              />
            </div>

            {/* Content section */}
            <div className="p-6 flex flex-col justify-between relative">
              <div>
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-white mb-1 group-hover:text-blue-300 transition-colors">
                    {testimonial.author}
                  </h3>
                  <p className="text-sm font-medium text-blue-200 mb-1">
                    {testimonial.position}
                  </p>
                  <p className="text-xs text-blue-300">
                    {testimonial.company.name}
                  </p>
                </div>
                
                                            <blockquote className="text-sm text-white/90 leading-relaxed line-clamp-4">
                              &ldquo;{testimonial.quote}&rdquo;
                            </blockquote>
              </div>

              {/* Company badge */}
              <div className="mt-4 flex items-center gap-2">
                {testimonial.company.logo ? (
                  <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                    <Image
                      src={testimonial.company.logo}
                      alt={testimonial.company.name}
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {testimonial.company.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-xs text-blue-200 font-medium">
                  {testimonial.company.industry}
                </span>
              </div>

                                        {/* Quote mark */}
                          <Quote className="absolute top-4 right-4 w-8 h-8 text-white/20 opacity-50" />
                          
                          {/* Click indicator */}
                          <div className="absolute bottom-2 right-2 text-xs text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view case study →
                          </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}