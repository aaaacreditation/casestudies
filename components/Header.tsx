'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Instagram, Facebook, Linkedin, Twitter, Phone, Menu, X, ChevronDown } from 'lucide-react'
import AAALogo from './AAALogo'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  return (
    <header className="relative z-50">
      {/* Top Header */}
      <div className="bg-[#0a4373] text-white py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            {/* Left side - Contact info */}
            <div className="flex items-center gap-6">
              <Link 
                href="/contact" 
                className="flex items-center gap-1 hover:text-blue-200 transition-colors"
              >
                <Phone className="w-3 h-3" />
                Contact Us
              </Link>
              <Link 
                href="/quote" 
                className="hover:text-blue-200 transition-colors"
              >
                Get a Quote
              </Link>
              <Link 
                href="/accreditation" 
                className="hover:text-blue-200 transition-colors"
              >
                Apply for Accreditation
              </Link>
              <Link 
                href="/documents" 
                className="hover:text-blue-200 transition-colors"
              >
                Documents
              </Link>
            </div>

            {/* Right side - Social media */}
            <div className="flex items-center gap-3">
              <Link 
                href="#" 
                className="hover:text-blue-200 transition-colors p-1"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </Link>
              <Link 
                href="#" 
                className="hover:text-blue-200 transition-colors p-1"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </Link>
              <Link 
                href="#" 
                className="hover:text-blue-200 transition-colors p-1"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link 
                href="#" 
                className="hover:text-blue-200 transition-colors p-1"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header with Logo and Navigation */}
      <div className="bg-[#0a4373] border-t border-blue-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-1">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-shrink-0"
            >
              <Link href="/" className="flex items-center group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <AAALogo className="w-28 h-28 group-hover:shadow-lg transition-shadow" />
                </motion.div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex items-center space-x-2"
            >
              <nav className="flex items-center space-x-2">
                <Link 
                  href="/" 
                  className="text-white hover:text-blue-200 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  Home
                </Link>
                
                <Link 
                  href="/about" 
                  className="text-white hover:text-blue-200 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  About Us
                </Link>

                {/* Accreditation Programs Dropdown */}
                <div className="relative group">
                  <button 
                    className="flex items-center gap-1 text-white hover:text-blue-200 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                    onMouseEnter={() => setActiveDropdown('programs')}
                  >
                    Accreditation Programs
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === 'programs' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-4 z-50"
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <div className="grid grid-cols-1 gap-1 px-2">
                          <Link href="/programs/training-providers" className="block px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-[#0a4373] rounded-lg transition-colors">
                            <div className="font-medium">Training Providers</div>
                            <div className="text-sm text-slate-500">Educational & training organizations</div>
                          </Link>
                          <Link href="/programs/testing-calibration" className="block px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-[#0a4373] rounded-lg transition-colors">
                            <div className="font-medium">Testing & Calibration Labs</div>
                            <div className="text-sm text-slate-500">Laboratory testing services</div>
                          </Link>
                          <Link href="/programs/medical-laboratories" className="block px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-[#0a4373] rounded-lg transition-colors">
                            <div className="font-medium">Medical Laboratories</div>
                            <div className="text-sm text-slate-500">Healthcare testing facilities</div>
                          </Link>
                          <Link href="/programs/certification-bodies" className="block px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-[#0a4373] rounded-lg transition-colors">
                            <div className="font-medium">Certification Bodies</div>
                            <div className="text-sm text-slate-500">Personnel & system certification</div>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link 
                  href="/membership" 
                  className="text-white hover:text-blue-200 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  Membership
                </Link>

                {/* Accredited Organizations Dropdown */}
                <div className="relative group">
                  <button 
                    className="flex items-center gap-1 text-white hover:text-blue-200 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                    onMouseEnter={() => setActiveDropdown('accredited')}
                  >
                    Accredited
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === 'accredited' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-4 z-50"
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <div className="grid grid-cols-1 gap-1 px-2">
                          <Link href="/accredited-organizations" className="block px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-[#0a4373] rounded-lg transition-colors">
                            <div className="font-medium">Organizations</div>
                            <div className="text-sm text-slate-500">Accredited companies</div>
                          </Link>
                          <Link href="/accredited-personnel" className="block px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-[#0a4373] rounded-lg transition-colors">
                            <div className="font-medium">Personnel</div>
                            <div className="text-sm text-slate-500">Certified individuals</div>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>
            </motion.div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                type="button"
                className="text-white hover:text-blue-200 p-2 transition-colors"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#0a4373] border-t border-blue-400/20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <nav className="space-y-2">
                <Link 
                  href="/" 
                  className="block text-white hover:text-blue-200 font-medium transition-colors px-4 py-3 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                
                <Link 
                  href="/about" 
                  className="block text-white hover:text-blue-200 font-medium transition-colors px-4 py-3 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>

                {/* Mobile Accreditation Programs */}
                <div>
                  <button 
                    className="flex items-center justify-between w-full text-white hover:text-blue-200 font-medium transition-colors px-4 py-3 rounded-lg hover:bg-white/10"
                    onClick={() => toggleDropdown('mobile-programs')}
                  >
                    Accreditation Programs
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-programs' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === 'mobile-programs' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-2 space-y-1"
                      >
                        <Link href="/programs/training-providers" className="block text-blue-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsMobileMenuOpen(false)}>
                          Training Providers
                        </Link>
                        <Link href="/programs/testing-calibration" className="block text-blue-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsMobileMenuOpen(false)}>
                          Testing & Calibration Labs
                        </Link>
                        <Link href="/programs/medical-laboratories" className="block text-blue-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsMobileMenuOpen(false)}>
                          Medical Laboratories
                        </Link>
                        <Link href="/programs/certification-bodies" className="block text-blue-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsMobileMenuOpen(false)}>
                          Certification Bodies
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link 
                  href="/membership" 
                  className="block text-white hover:text-blue-200 font-medium transition-colors px-4 py-3 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Membership
                </Link>

                {/* Mobile Accredited */}
                <div>
                  <button 
                    className="flex items-center justify-between w-full text-white hover:text-blue-200 font-medium transition-colors px-4 py-3 rounded-lg hover:bg-white/10"
                    onClick={() => toggleDropdown('mobile-accredited')}
                  >
                    Accredited
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-accredited' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === 'mobile-accredited' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-2 space-y-1"
                      >
                        <Link href="/accredited-organizations" className="block text-blue-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsMobileMenuOpen(false)}>
                          Organizations
                        </Link>
                        <Link href="/accredited-personnel" className="block text-blue-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsMobileMenuOpen(false)}>
                          Personnel
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Contact Section */}
                <div className="pt-4 mt-4 border-t border-blue-400/20">
                  <div className="space-y-2">
                    <Link 
                      href="/contact" 
                      className="block text-blue-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact Us
                    </Link>
                    <Link 
                      href="/quote" 
                      className="block text-blue-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get a Quote
                    </Link>
                    <Link 
                      href="/accreditation" 
                      className="block text-blue-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Apply for Accreditation
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}