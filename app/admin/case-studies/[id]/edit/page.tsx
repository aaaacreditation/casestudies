'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Eye, Edit, X, Plus } from 'lucide-react'
import Link from 'next/link'
import { CaseStudy } from '@/types'

export default function EditCaseStudy() {
  const router = useRouter()
  const params = useParams()
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    companyName: '',
    companyIndustry: '',
    companyLocation: '',
    companySize: '',
    companyWebsite: '',
    companyDescription: '',
    published: false
  })


  useEffect(() => {
    if (params.id) {
      fetchCaseStudy()
    }
  }, [params.id, fetchCaseStudy])

  const fetchCaseStudy = useCallback(async () => {
    try {
      const response = await fetch(`/api/case-studies/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCaseStudy(data)
        // Populate form data
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          excerpt: data.excerpt || '',
          companyName: data.company.name || '',
          companyIndustry: data.company.industry || '',
          companyLocation: data.company.location || '',
          companySize: data.company.size || '',
          companyWebsite: data.company.website || '',
          companyDescription: data.company.description || '',
          published: data.published || false
        })

      } else {
        console.error('Case study not found')
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('Error fetching case study:', error)
      router.push('/admin/dashboard')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveChanges = async () => {
    if (!caseStudy) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/case-studies/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle,
          excerpt: formData.excerpt,
          company: {
            name: formData.companyName,
            industry: formData.companyIndustry,
            location: formData.companyLocation,
            size: formData.companySize,
            website: formData.companyWebsite,
            description: formData.companyDescription
          }
        })
      })

      if (response.ok) {
        const updatedCaseStudy = await response.json()
        setCaseStudy(updatedCaseStudy)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating case study:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!caseStudy) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/case-studies/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          published: !caseStudy.published
        })
      })

      if (response.ok) {
        const updatedCaseStudy = await response.json()
        setCaseStudy(updatedCaseStudy)
        setFormData(prev => ({ ...prev, published: updatedCaseStudy.published }))
      }
    } catch (error) {
      console.error('Error updating case study:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!caseStudy) return
    setIsEditing(false)
    // Reset form data to original values
    setFormData({
      title: caseStudy.title || '',
      subtitle: caseStudy.subtitle || '',
      excerpt: caseStudy.excerpt || '',
      companyName: caseStudy.company.name || '',
      companyIndustry: caseStudy.company.industry || '',
      companyLocation: caseStudy.company.location || '',
      companySize: caseStudy.company.size || '',
      companyWebsite: caseStudy.company.website || '',
      companyDescription: caseStudy.company.description || '',
      published: caseStudy.published || false
    })
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a4373]"></div>
      </div>
    )
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Case Study Not Found</h2>
          <p className="text-slate-600 mb-4">The case study you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 bg-[#0a4373] text-white rounded-lg hover:bg-[#083455] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="mr-4 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-slate-900">Edit Case Study</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href={`/case-studies/${caseStudy.slug}`}
                target="_blank"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Link>
              
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Details</span>
                  </button>

                  <Link
                    href={`/admin/case-studies/${caseStudy.id}/content`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Edit Content</span>
                  </Link>
                  
                  <button
                    onClick={handleStatusToggle}
                    disabled={saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      caseStudy.published
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{caseStudy.published ? 'Unpublish' : 'Publish'}</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0a4373] text-white rounded-lg hover:bg-[#083455] transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {/* Case Study Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{caseStudy.title}</h2>
                {caseStudy.subtitle && (
                  <p className="text-lg text-slate-600 mb-3">{caseStudy.subtitle}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Company: {caseStudy.company.name}</span>
                  <span>•</span>
                  <span>Created: {new Date(caseStudy.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    caseStudy.published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {caseStudy.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              
              {caseStudy.featuredImage && (
                <div className="ml-6">
                  <img
                    src={caseStudy.featuredImage}
                    alt={caseStudy.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Case Study Details */}
          <div className="p-6">
            {!isEditing ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                        <p className="text-sm text-slate-900">{caseStudy.title}</p>
                      </div>
                      {caseStudy.subtitle && (
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Subtitle</label>
                          <p className="text-sm text-slate-900">{caseStudy.subtitle}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Excerpt</label>
                        <p className="text-sm text-slate-900">{caseStudy.excerpt}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Media Type</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {caseStudy.mediaType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Company Name</label>
                        <p className="text-sm text-slate-900">{caseStudy.company.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Industry</label>
                        <p className="text-sm text-slate-900">{caseStudy.company.industry}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Location</label>
                        <p className="text-sm text-slate-900">{caseStudy.company.location}</p>
                      </div>
                      {caseStudy.company.size && (
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Company Size</label>
                          <p className="text-sm text-slate-900">{caseStudy.company.size}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      Note: Full content editing with the drag & drop builder is available when creating new case studies.
                    </p>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/admin/dashboard"
                        className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Back to Dashboard
                      </Link>
                      <Link
                        href={`/case-studies/${caseStudy.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-[#0a4373] text-white rounded-lg hover:bg-[#083455] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Case Study
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle</label>
                        <input
                          type="text"
                          name="subtitle"
                          value={formData.subtitle}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Excerpt *</label>
                        <textarea
                          name="excerpt"
                          value={formData.excerpt}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                          placeholder="Brief description for case study cards"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Company Name *</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Industry *</label>
                        <input
                          type="text"
                          name="companyIndustry"
                          value={formData.companyIndustry}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
                        <input
                          type="text"
                          name="companyLocation"
                          value={formData.companyLocation}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Company Size</label>
                        <input
                          type="text"
                          name="companySize"
                          value={formData.companySize}
                          onChange={handleInputChange}
                          placeholder="e.g., 50-100 employees"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                        <input
                          type="url"
                          name="companyWebsite"
                          value={formData.companyWebsite}
                          onChange={handleInputChange}
                          placeholder="https://example.com"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <textarea
                          name="companyDescription"
                          value={formData.companyDescription}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Brief company description"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
