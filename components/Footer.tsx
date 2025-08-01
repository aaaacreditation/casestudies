'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Phone, Printer, Mail, MessageCircle } from 'lucide-react'
import AAALogo from './AAALogo'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Contact Us Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-6">CONTACT US</h3>
              
              {/* Address & Phone */}
              <div className="mb-6">
                <h4 className="font-semibold text-blue-300 mb-3">ADDRESS & PHONE</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p>8609 Westwood Center Drive</p>
                      <p>Tysons Corner, VA 22182, USA.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Phone className="w-4 h-4 text-blue-400" />
                    <span>+1 (571) 601 2616</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-blue-400" />
                    <span>Fax: +1 (571) 376 6582</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <a href="mailto:info@aaa-accreditation.org" className="hover:text-blue-300 transition-colors">
                      info@aaa-accreditation.org
                    </a>
                  </div>
                </div>
              </div>

              {/* International Operations */}
              <div className="mb-6">
                <h4 className="font-semibold text-blue-300 mb-3">International Operations</h4>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>Tel./Whatsapp +44 (748) 755 0737</span>
                </div>
              </div>

              {/* Contact Form Link */}
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-[#0a4373] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#083455] transition-all duration-300"
              >
                <Mail className="w-4 h-4" />
                Contact Form
              </Link>
            </motion.div>
          </div>

          {/* Navigate Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-xl font-bold text-white mb-6">NAVIGATE</h3>
              <nav className="space-y-3">
                <Link href="/" className="block text-gray-300 hover:text-blue-300 transition-colors">
                  Home
                </Link>
                <Link href="/about" className="block text-gray-300 hover:text-blue-300 transition-colors">
                  About AAA
                </Link>
                <Link href="/about-accreditation" className="block text-gray-300 hover:text-blue-300 transition-colors">
                  About Accreditation
                </Link>
                <Link href="/membership" className="block text-gray-300 hover:text-blue-300 transition-colors">
                  AAA Membership
                </Link>
                <Link href="/documents" className="block text-gray-300 hover:text-blue-300 transition-colors">
                  Documents
                </Link>
                <Link href="/apply" className="block text-gray-300 hover:text-blue-300 transition-colors">
                  Apply for Accreditation
                </Link>
                <Link href="/quote" className="block text-gray-300 hover:text-blue-300 transition-colors">
                  Get a Quote
                </Link>
                <Link href="/accredited-organizations" className="block text-gray-300 hover:text-blue-300 transition-colors">
                  Accredited Organization
                </Link>
                <Link href="/accredited-personnel" className="block text-gray-300 hover:text-blue-300 transition-colors">
                  Accredited Personnel
                </Link>
              </nav>
            </motion.div>
          </div>

          {/* Accreditation Programs Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-white mb-6">ACCREDITATION PROGRAMS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <nav className="space-y-3">
                  <Link href="/programs/training-providers" className="block text-gray-300 hover:text-blue-300 transition-colors">
                    Training providers
                  </Link>
                  <Link href="/programs/testing-calibration" className="block text-gray-300 hover:text-blue-300 transition-colors">
                    Testing & Calibration Laboratories
                  </Link>
                  <Link href="/programs/medical-laboratories" className="block text-gray-300 hover:text-blue-300 transition-colors">
                    Medical Laboratories
                  </Link>
                  <Link href="/programs/personnel-certification" className="block text-gray-300 hover:text-blue-300 transition-colors">
                    Personnel Certification Bodies
                  </Link>
                </nav>
                <nav className="space-y-3">
                  <Link href="/programs/system-certification" className="block text-gray-300 hover:text-blue-300 transition-colors">
                    System Certification Bodies
                  </Link>
                  <Link href="/programs/product-certification" className="block text-gray-300 hover:text-blue-300 transition-colors">
                    Product Certification Bodies
                  </Link>
                  <Link href="/programs/inspection-bodies" className="block text-gray-300 hover:text-blue-300 transition-colors">
                    Inspection Bodies
                  </Link>
                  <Link href="/programs/proficiency-testing" className="block text-gray-300 hover:text-blue-300 transition-colors">
                    Proficiency Testing Providers
                  </Link>
                </nav>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Logo and Company Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center mb-4 md:mb-0"
            >
              <AAALogo className="w-12 h-12" />
              <div className="ml-3 text-white">
                <div className="text-sm font-bold">AMERICAN ACCREDITATION</div>
                <div className="text-sm font-bold">ASSOCIATION</div>
              </div>
            </motion.div>

            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-400 text-sm text-center md:text-right"
            >
              <p>&copy; {new Date().getFullYear()} American Accreditation Association. All rights reserved.</p>
              <div className="flex items-center justify-center md:justify-end gap-4 mt-2">
                <Link href="/privacy" className="hover:text-blue-300 transition-colors">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-blue-300 transition-colors">
                  Terms of Service
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}