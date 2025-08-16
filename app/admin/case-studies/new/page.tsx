'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Image, 
  Video, 
  ImageIcon,
  FileText,
  Building2,
  Tag,
  Save,
  Eye,
  Upload,
  X,
  Youtube
} from 'lucide-react'
import Link from 'next/link'
import { MediaType } from '@/types'

interface MediaTypeOption {
  value: MediaType
  label: string
  description: string
  icon: React.ReactNode
}

const mediaTypeOptions: MediaTypeOption[] = [
  {
    value: MediaType.IMAGE_ONLY,
    label: 'Images Only',
    description: 'Case study with featured image and additional images',
    icon: <Image className="w-8 h-8" />
  },
  {
    value: MediaType.VIDEO_ONLY,
    label: 'Video Only',
    description: 'Case study with featured video content',
    icon: <Video className="w-8 h-8" />
  },
  {
    value: MediaType.IMAGE_AND_VIDEO,
    label: 'Images & Video',
    description: 'Case study with both images and video content',
    icon: <ImageIcon className="w-8 h-8" />
  }
]

export default function NewCaseStudy() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    companyName: '',
    companyIndustry: '',
    companyLocation: '',
    companySize: '',
    companyWebsite: '',
    companyDescription: '',
    tags: '',
    metrics: '',
    published: false,
    featured: false,
    featuredVideoUrl: '' // For YouTube URLs
  })
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredVideo, setFeaturedVideo] = useState<File | null>(null)
  const [additionalMedia, setAdditionalMedia] = useState<File[]>([])
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'featuredImage' | 'featuredVideo' | 'additional' | 'companyLogo') => {
    const files = e.target.files
    if (!files) return

    if (type === 'featuredImage') {
      setFeaturedImage(files[0])
    } else if (type === 'featuredVideo') {
      setFeaturedVideo(files[0])
    } else if (type === 'companyLogo') {
      setCompanyLogo(files[0])
    } else if (type === 'additional') {
      setAdditionalMedia(prev => [...prev, ...Array.from(files)])
    }
  }

  const removeFile = (type: 'featuredImage' | 'featuredVideo' | 'additional' | 'companyLogo', index?: number) => {
    if (type === 'featuredImage') {
      setFeaturedImage(null)
    } else if (type === 'featuredVideo') {
      setFeaturedVideo(null)
    } else if (type === 'companyLogo') {
      setCompanyLogo(null)
    } else if (type === 'additional' && index !== undefined) {
      setAdditionalMedia(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMediaType) return

    setLoading(true)

    try {
      // First create the case study
      const caseStudyData = {
        ...formData,
        mediaType: selectedMediaType,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        metrics: formData.metrics ? JSON.parse(formData.metrics) : null,
        featuredVideo: formData.featuredVideoUrl || undefined
      }

      const response = await fetch('/api/case-studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(caseStudyData)
      })

      if (response.ok) {
        const caseStudy = await response.json()

        // If there are files to upload, upload them
        if (featuredImage || featuredVideo || companyLogo || additionalMedia.length > 0) {
          const formData = new FormData()
          
          if (featuredImage) {
            formData.append('featuredImage', featuredImage)
          }
          
          if (featuredVideo) {
            formData.append('featuredVideo', featuredVideo)
          }
          
          if (companyLogo) {
            formData.append('companyLogo', companyLogo)
          }
          
          additionalMedia.forEach((file) => {
            formData.append('additionalMedia', file)
          })

          const uploadResponse = await fetch(`/api/case-studies/${caseStudy.id}/media`, {
            method: 'POST',
            body: formData
          })

          if (!uploadResponse.ok) {
            console.error('Error uploading media')
          }
        }

        router.push('/admin/dashboard')
      } else {
        alert('Error creating case study')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating case study')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-slate-900">Create New Case Study</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Step {step} of 2</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Media Type</h2>
                <p className="text-slate-600">Select the type of media content for your case study</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mediaTypeOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => setSelectedMediaType(option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedMediaType === option.value
                        ? 'border-[#0a4373] bg-[#0a4373]/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                      selectedMediaType === option.value
                        ? 'bg-[#0a4373] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {option.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{option.label}</h3>
                    <p className="text-sm text-slate-600">{option.description}</p>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedMediaType}
                  className="bg-[#0a4373] text-white px-6 py-2 rounded-lg hover:bg-[#083455] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Case Study Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#0a4373] rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Case Study Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      placeholder="Enter case study title"
                      required
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label htmlFor="subtitle" className="block text-sm font-medium text-slate-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      id="subtitle"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      placeholder="Enter case study subtitle"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700 mb-2">
                      Excerpt *
                    </label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      placeholder="Brief description for case study cards"
                      required
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={8}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      placeholder="Full case study content"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Company Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="companyIndustry" className="block text-sm font-medium text-slate-700 mb-2">
                      Industry *
                    </label>
                    <select
                      id="companyIndustry"
                      name="companyIndustry"
                      value={formData.companyIndustry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      required
                    >
                      <option value="">Select Industry</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Training/Education">Training/Education</option>
                      <option value="Laboratories">Laboratories</option>
                      <option value="Certification bodies">Certification bodies</option>
                      <option value="Inspection Bodies">Inspection Bodies</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="companyLocation" className="block text-sm font-medium text-slate-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="companyLocation"
                      name="companyLocation"
                      value={formData.companyLocation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      placeholder="e.g., United Kingdom"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="companySize" className="block text-sm font-medium text-slate-700 mb-2">
                      Company Size *
                    </label>
                    <input
                      type="text"
                      id="companySize"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      placeholder="e.g., 1,000+"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="companyWebsite" className="block text-sm font-medium text-slate-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      id="companyWebsite"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      placeholder="https://company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="companyDescription" className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      id="companyDescription"
                      name="companyDescription"
                      value={formData.companyDescription}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      placeholder="Brief company description"
                    />
                  </div>
                </div>
              </div>

              {/* Media Upload Section */}
              {selectedMediaType && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Media Content</h3>
                  </div>

                  {/* Company Logo Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Logo *
                    </label>
                    {!companyLogo ? (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <ImageIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <div className="space-y-2">
                          <p className="text-slate-600 text-sm">Upload company logo</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'companyLogo')}
                            className="hidden"
                            id="company-logo"
                            required
                          />
                          <label
                            htmlFor="company-logo"
                            className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Logo
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(companyLogo)}
                          alt="Company Logo"
                          className="w-20 h-20 object-contain rounded-lg border border-slate-200 bg-white p-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile('companyLogo')}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="mt-2 text-sm text-slate-600">{companyLogo.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Featured Image Upload - for IMAGE_ONLY and IMAGE_AND_VIDEO */}
                  {(selectedMediaType === MediaType.IMAGE_ONLY || selectedMediaType === MediaType.IMAGE_AND_VIDEO) && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Featured Image *
                      </label>
                      {!featuredImage ? (
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                          <div className="space-y-2">
                            <p className="text-slate-600">Upload featured image</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'featuredImage')}
                              className="hidden"
                              id="featured-image"
                              required={selectedMediaType === MediaType.IMAGE_ONLY}
                            />
                            <label
                              htmlFor="featured-image"
                              className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(featuredImage)}
                            alt="Featured"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('featuredImage')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="mt-2 text-sm text-slate-600">{featuredImage.name}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Featured Video - for VIDEO_ONLY and IMAGE_AND_VIDEO */}
                  {(selectedMediaType === MediaType.VIDEO_ONLY || selectedMediaType === MediaType.IMAGE_AND_VIDEO) && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-4">
                        Featured Video *
                      </label>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* YouTube URL Option */}
                        <div>
                          <label htmlFor="featuredVideoUrl" className="block text-sm font-medium text-slate-600 mb-2">
                            <Youtube className="w-4 h-4 inline mr-1" />
                            YouTube URL
                          </label>
                          <input
                            type="url"
                            id="featuredVideoUrl"
                            name="featuredVideoUrl"
                            value={formData.featuredVideoUrl}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>

                        {/* OR Video File Upload */}
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">
                            <Video className="w-4 h-4 inline mr-1" />
                            OR Upload Video File
                          </label>
                          {!featuredVideo ? (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                              <Video className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleFileUpload(e, 'featuredVideo')}
                                className="hidden"
                                id="featured-video"
                              />
                              <label
                                htmlFor="featured-video"
                                className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                Choose File
                              </label>
                            </div>
                          ) : (
                            <div className="relative">
                              <video
                                src={URL.createObjectURL(featuredVideo)}
                                className="w-full h-32 object-cover rounded-lg"
                                controls
                              />
                              <button
                                type="button"
                                onClick={() => removeFile('featuredVideo')}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <p className="mt-1 text-xs text-slate-600">{featuredVideo.name}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Choose either a YouTube URL or upload a video file</p>
                    </div>
                  )}

                  {/* Additional Media */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Additional Media (Optional)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center mb-4">
                      <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      <div className="space-y-2">
                        <p className="text-slate-600 text-sm">Upload additional images or videos</p>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'additional')}
                          className="hidden"
                          id="additional-media"
                        />
                        <label
                          htmlFor="additional-media"
                          className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </label>
                      </div>
                    </div>

                    {additionalMedia.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {additionalMedia.map((file, index) => (
                          <div key={index} className="relative">
                            {file.type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Additional ${index}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <video
                                src={URL.createObjectURL(file)}
                                className="w-full h-20 object-cover rounded-lg"
                                controls
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile('additional', index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <p className="mt-1 text-xs text-slate-600 truncate">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Additional Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
                  </div>

                  <div>
                    <label htmlFor="metrics" className="block text-sm font-medium text-slate-700 mb-2">
                      Metrics (JSON)
                    </label>
                    <input
                      type="text"
                      id="metrics"
                      name="metrics"
                      value={formData.metrics}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                      placeholder='{"metric1": "value1", "metric2": "value2"}'
                    />
                    <p className="text-xs text-slate-500 mt-1">JSON format for key metrics</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="published"
                        checked={formData.published}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 text-[#0a4373] focus:ring-[#0a4373]/20"
                      />
                      <span className="ml-2 text-sm text-slate-700">Published</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 text-[#0a4373] focus:ring-[#0a4373]/20"
                      />
                      <span className="ml-2 text-sm text-slate-700">Featured</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, published: false }))}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#0a4373] text-white px-4 py-2 rounded-lg hover:bg-[#083455] transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    Create & Add Media
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}
