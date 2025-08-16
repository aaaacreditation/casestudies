'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  X,
  Save
} from 'lucide-react'
import Link from 'next/link'
import { CaseStudy, MediaType } from '@/types'

export default function CaseStudyMedia() {
  const params = useParams()
  const router = useRouter()
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredVideo, setFeaturedVideo] = useState<File | null>(null)
  const [additionalMedia, setAdditionalMedia] = useState<File[]>([])

  useEffect(() => {
    if (params.id) {
      fetchCaseStudy()
    }
  }, [params.id, fetchCaseStudy])

  const fetchCaseStudy = async () => {
    try {
      const response = await fetch(`/api/case-studies/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCaseStudy(data)
      }
    } catch (error) {
      console.error('Error fetching case study:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'additional') => {
    const files = e.target.files
    if (!files) return

    if (type === 'image' && files[0]) {
      setFeaturedImage(files[0])
    } else if (type === 'video' && files[0]) {
      setFeaturedVideo(files[0])
    } else if (type === 'additional') {
      setAdditionalMedia(prev => [...prev, ...Array.from(files)])
    }
  }

  const removeFile = (type: 'image' | 'video' | 'additional', index?: number) => {
    if (type === 'image') {
      setFeaturedImage(null)
    } else if (type === 'video') {
      setFeaturedVideo(null)
    } else if (type === 'additional' && index !== undefined) {
      setAdditionalMedia(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caseStudy) return

    setUploading(true)

    try {
      const formData = new FormData()
      
      if (featuredImage) {
        formData.append('featuredImage', featuredImage)
      }
      
      if (featuredVideo) {
        formData.append('featuredVideo', featuredVideo)
      }
      
      additionalMedia.forEach((file, index) => {
        formData.append(`additionalMedia`, file)
      })

      const response = await fetch(`/api/case-studies/${params.id}/media`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        router.push('/admin/dashboard')
      } else {
        alert('Error uploading media')
      }
    } catch (error) {
      console.error('Error uploading media:', error)
      alert('Error uploading media')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a4373] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading case study...</p>
        </div>
      </div>
    )
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Case study not found</p>
        </div>
      </div>
    )
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
              <h1 className="text-xl font-semibold text-slate-900">Add Media</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{caseStudy.title}</h2>
            <p className="text-slate-600">Media Type: <span className="font-medium">{caseStudy.mediaType.replace('_', ' ')}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Featured Image Upload */}
            {(caseStudy.mediaType === MediaType.IMAGE_ONLY || caseStudy.mediaType === MediaType.IMAGE_AND_VIDEO) && (
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Featured Image
                </h3>
                
                {!featuredImage ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <div className="space-y-2">
                      <p className="text-slate-600">Upload featured image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'image')}
                        className="hidden"
                        id="featured-image"
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
                      onClick={() => removeFile('image')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="mt-2 text-sm text-slate-600">{featuredImage.name}</p>
                  </div>
                )}
              </div>
            )}

            {/* Featured Video Upload */}
            {(caseStudy.mediaType === MediaType.VIDEO_ONLY || caseStudy.mediaType === MediaType.IMAGE_AND_VIDEO) && (
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Featured Video
                </h3>
                
                {!featuredVideo ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <Video className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <div className="space-y-2">
                      <p className="text-slate-600">Upload featured video</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'video')}
                        className="hidden"
                        id="featured-video"
                      />
                      <label
                        htmlFor="featured-video"
                        className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      src={URL.createObjectURL(featuredVideo)}
                      className="w-full h-64 object-cover rounded-lg"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => removeFile('video')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="mt-2 text-sm text-slate-600">{featuredVideo.name}</p>
                  </div>
                )}
              </div>
            )}

            {/* Additional Media */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Media (Optional)</h3>
              
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center mb-4">
                <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-slate-600">Upload additional images or videos</p>
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
                    className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </label>
                </div>
              </div>

              {additionalMedia.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {additionalMedia.map((file, index) => (
                    <div key={index} className="relative">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Additional ${index}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-32 object-cover rounded-lg"
                          controls
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile('additional', index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="mt-1 text-xs text-slate-600 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Skip Media Upload
              </Link>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 bg-[#0a4373] text-white px-6 py-2 rounded-lg hover:bg-[#083455] transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {uploading ? 'Uploading...' : 'Save & Publish'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
