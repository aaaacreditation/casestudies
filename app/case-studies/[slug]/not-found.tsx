import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-24 h-24 bg-[#0a4373]/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Search className="w-12 h-12 text-[#0a4373]" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Case Study Not Found
          </h1>
          
          <p className="text-lg text-slate-600 mb-8">
            The case study you're looking for doesn't exist or may have been moved.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#0a4373] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#083455] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Case Studies
            </Link>
            
            <div className="text-sm text-slate-500">
              <p>Looking for something specific?</p>
              <Link href="/contact" className="text-[#0a4373] hover:text-[#083455] font-medium">
                Contact us for help
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}