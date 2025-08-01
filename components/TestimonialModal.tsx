'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Testimonial } from '@/types'

interface TestimonialModalProps {
  testimonial: Testimonial | null
  isOpen: boolean
  onClose: () => void
}

export default function TestimonialModal({ 
  testimonial, 
  isOpen, 
  onClose 
}: TestimonialModalProps) {
  if (!testimonial) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {testimonial.company.logo && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        <Image
                          src={testimonial.company.logo}
                          alt={testimonial.company.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {testimonial.company.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {testimonial.company.industry} • {testimonial.company.location}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Quote */}
                <blockquote className="text-xl leading-relaxed text-gray-900 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4 mb-6">
                  {testimonial.avatar && (
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-lg text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-gray-600">
                      {testimonial.position}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.company.name}
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                {testimonial.company.description && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">About {testimonial.company.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {testimonial.company.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Industry: {testimonial.company.industry}</span>
                      <span>•</span>
                      <span>Size: {testimonial.company.size}</span>
                      <span>•</span>
                      <span>Location: {testimonial.company.location}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4">
                  {testimonial.caseStudy && (
                    <Link
                      href={`/case-studies/${testimonial.caseStudy.slug}`}
                      className="inline-flex items-center gap-2 bg-[#0a4373] text-white px-6 py-3 rounded-lg hover:bg-[#083455] transition-colors font-medium"
                      onClick={onClose}
                    >
                      Read full case study
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  
                  {testimonial.company.website && (
                    <Link
                      href={testimonial.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Visit website
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}