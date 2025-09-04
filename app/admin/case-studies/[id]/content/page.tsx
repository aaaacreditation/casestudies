'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Save, 
  GripVertical,
  Trash2,
  Type,
  FileText,
  ImageIcon,
  Video,
  Youtube,
  Upload,
  Columns,
  Grid3X3,
  Square,
  X,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { CaseStudy } from '@/types'
import RichTextEditor from '@/components/RichTextEditor'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core'

// Content Block Types
interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'video' | 'title'
  content?: string
  file?: File
  url?: string
  caption?: string
  columnId?: string
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6
  fileUrl?: string
}

// Layout Types
interface LayoutColumn {
  id: string
  blocks: ContentBlock[]
}

interface Layout {
  id: string
  type: 1 | 2 | 3
  columns: LayoutColumn[]
}

// Layout Templates
const LAYOUT_TEMPLATES = {
  1: { columns: 1, icon: Square, label: '1 Column' },
  2: { columns: 2, icon: Columns, label: '2 Columns' },
  3: { columns: 3, icon: Grid3X3, label: '3 Columns' }
}

export default function EditCaseStudyContent() {
  const router = useRouter()
  const params = useParams()
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null)
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null)

  // Layout and content state
  const [currentLayout, setCurrentLayout] = useState<Layout>({
    id: '1',
    type: 1,
    columns: [{ id: 'col-1', blocks: [] }]
  })
  const [availableBlocks, setAvailableBlocks] = useState<ContentBlock[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchCaseStudy = useCallback(async () => {
    try {
      const response = await fetch(`/api/case-studies/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCaseStudy(data)
        
        // Set current image previews
        if (data.featuredImage) {
          setFeaturedImagePreview(data.featuredImage)
        }
        if (data.company?.logo) {
          setCompanyLogoPreview(data.company.logo)
        }

        // Parse and load content structure
        try {
          const contentData = JSON.parse(data.content || '{}')
          if (contentData.layout) {
            setCurrentLayout(contentData.layout)
            setAvailableBlocks(contentData.availableBlocks || [])
          } else if (Array.isArray(contentData)) {
            setAvailableBlocks(contentData)
            setCurrentLayout({
              id: '1',
              type: 1,
              columns: [{ id: 'col-1', blocks: [] }]
            })
          } else {
            setCurrentLayout({
              id: '1',
              type: 1,
              columns: [{ id: 'col-1', blocks: [] }]
            })
            setAvailableBlocks([])
          }
        } catch (contentError) {
          console.error('Error parsing content:', contentError)
          setCurrentLayout({
            id: '1',
            type: 1,
            columns: [{ id: 'col-1', blocks: [] }]
          })
          setAvailableBlocks([])
        }
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

  useEffect(() => {
    if (params.id) {
      fetchCaseStudy()
    }
  }, [params.id, fetchCaseStudy])

  // Content Block Management
  const addContentBlock = (type: 'text' | 'image' | 'video' | 'title') => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'text' || type === 'title' ? '' : undefined,
      file: undefined,
      url: undefined,
      caption: undefined,
      titleLevel: type === 'title' ? 1 : undefined
    }
    setAvailableBlocks(prev => [...prev, newBlock])
  }

  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    setAvailableBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ))
    
    setCurrentLayout(prev => ({
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        blocks: col.blocks.map(block => 
          block.id === id ? { ...block, ...updates } : block
        )
      }))
    }))
  }

  const deleteContentBlock = (id: string) => {
    setAvailableBlocks(prev => prev.filter(block => block.id !== id))
    
    setCurrentLayout(prev => ({
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        blocks: col.blocks.filter(block => block.id !== id)
      }))
    }))
  }

  const changeLayout = (layoutType: 1 | 2 | 3) => {
    const columns: LayoutColumn[] = []
    for (let i = 0; i < layoutType; i++) {
      columns.push({ id: `col-${i + 1}`, blocks: [] })
    }
    
    const allBlocks = currentLayout.columns.flatMap(col => col.blocks)
    setAvailableBlocks(prev => [...prev, ...allBlocks])
    
    setCurrentLayout({
      id: layoutType.toString(),
      type: layoutType,
      columns
    })
  }

  // Simplified drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find source and target
    const sourceBlock = availableBlocks.find(b => b.id === activeId)
    if (!sourceBlock) return

    // Move from available to column
    const targetColumn = currentLayout.columns.find(col => col.id === overId)
    if (targetColumn) {
      setAvailableBlocks(prev => prev.filter(b => b.id !== activeId))
      setCurrentLayout(prev => ({
        ...prev,
        columns: prev.columns.map(col =>
          col.id === overId
            ? { ...col, blocks: [...col.blocks, sourceBlock] }
            : col
        )
      }))
    }
  }

  const moveBlockToAvailable = (blockId: string) => {
    const block = currentLayout.columns.flatMap(col => col.blocks).find(b => b.id === blockId)
    if (!block) return

    setAvailableBlocks(prev => [...prev, block])
    setCurrentLayout(prev => ({
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        blocks: col.blocks.filter(b => b.id !== blockId)
      }))
    }))
  }

  const handleSave = async () => {
    if (!caseStudy) return
    
    setSaving(true)
    try {
      const allBlocks = [
        ...availableBlocks,
        ...currentLayout.columns.flatMap(col => col.blocks)
      ]

      const structuredContent = {
        layout: currentLayout,
        availableBlocks: availableBlocks.map(block => ({
          id: block.id,
          type: block.type,
          content: block.content,
          url: block.url,
          caption: block.caption,
          titleLevel: block.titleLevel,
          fileUrl: block.fileUrl
        }))
      }

      const response = await fetch(`/api/case-studies/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: JSON.stringify(structuredContent)
        })
      })

      if (response.ok) {
        // Handle file uploads
        const uploadFormData = new FormData()
        let hasFiles = false

        // Add featured image and logo
        if (featuredImage) {
          uploadFormData.append('featuredImage', featuredImage)
          hasFiles = true
        }
        
        if (companyLogo) {
          uploadFormData.append('companyLogo', companyLogo)
          hasFiles = true
        }

        allBlocks.forEach((block, index) => {
          if (block.file) {
            uploadFormData.append(`contentBlock_${index}`, block.file)
            uploadFormData.append(`contentBlockId_${index}`, block.id)
            hasFiles = true
          }
        })

        if (hasFiles) {
          await fetch(`/api/case-studies/${caseStudy.id}/media`, {
            method: 'POST',
            body: uploadFormData
          })
        }

        router.push(`/admin/case-studies/${caseStudy.id}/edit`)
      }
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setSaving(false)
    }
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
                href={`/admin/case-studies/${caseStudy.id}/edit`}
                className="mr-4 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-slate-900">Edit Content: {caseStudy.title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
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
                    <span>Save Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200"
        >
          <div className="p-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={(event) => setActiveId(event.active.id as string)}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-6">
                {/* Featured Image & Logo Section */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Featured Image & Company Logo</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Featured Image */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Featured Image
                      </label>
                      <div className="space-y-4">
                        {featuredImagePreview && (
                          <div className="relative">
                            <div className="relative h-40 rounded-lg overflow-hidden border border-slate-200">
                              <Image
                                src={featuredImagePreview}
                                alt="Featured image preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFeaturedImage(null)
                                setFeaturedImagePreview(null)
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#0a4373] transition-colors">
                          <ImageIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setFeaturedImage(file)
                                setFeaturedImagePreview(URL.createObjectURL(file))
                              }
                            }}
                            className="hidden"
                            id="featured-image-upload"
                          />
                          <label
                            htmlFor="featured-image-upload"
                            className="cursor-pointer text-sm text-slate-600 hover:text-[#0a4373]"
                          >
                            {featuredImagePreview ? 'Replace featured image' : 'Upload featured image'}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Company Logo */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Logo
                      </label>
                      <div className="space-y-4">
                        {companyLogoPreview && (
                          <div className="relative">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                              <Image
                                src={companyLogoPreview}
                                alt="Company logo preview"
                                width={60}
                                height={60}
                                className="object-contain"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCompanyLogo(null)
                                setCompanyLogoPreview(null)
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#0a4373] transition-colors">
                          <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setCompanyLogo(file)
                                setCompanyLogoPreview(URL.createObjectURL(file))
                              }
                            }}
                            className="hidden"
                            id="company-logo-upload"
                          />
                          <label
                            htmlFor="company-logo-upload"
                            className="cursor-pointer text-sm text-slate-600 hover:text-[#0a4373]"
                          >
                            {companyLogoPreview ? 'Replace company logo' : 'Upload company logo'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Builder Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Content Builder</h3>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => addContentBlock('title')}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-[#0a4373] hover:bg-[#0a4373]/5 transition-colors text-sm font-medium text-slate-700 hover:text-[#0a4373]"
                    >
                      <Type className="w-4 h-4" />
                      Add Title
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock('text')}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-[#0a4373] hover:bg-[#0a4373]/5 transition-colors text-sm font-medium text-slate-700 hover:text-[#0a4373]"
                    >
                      <FileText className="w-4 h-4" />
                      Add Text
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock('image')}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-[#0a4373] hover:bg-[#0a4373]/5 transition-colors text-sm font-medium text-slate-700 hover:text-[#0a4373]"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Add Image
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock('video')}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-[#0a4373] hover:bg-[#0a4373]/5 transition-colors text-sm font-medium text-slate-700 hover:text-[#0a4373]"
                    >
                      <Video className="w-4 h-4" />
                      Add Video
                    </button>
                  </div>
                </div>

                {/* Layout Selector */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-slate-700">Choose Layout</h4>
                    <div className="flex gap-2">
                      {Object.entries(LAYOUT_TEMPLATES).map(([key, template]) => {
                        const IconComponent = template.icon
                        const layoutType = parseInt(key) as 1 | 2 | 3
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => changeLayout(layoutType)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                              currentLayout.type === layoutType
                                ? 'border-[#0a4373] bg-[#0a4373]/5 text-[#0a4373]'
                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span className="text-sm font-medium">{template.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Available Blocks */}
                {availableBlocks.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Available Blocks (Drag to Layout)</h4>
                    <div className="space-y-3">
                      {availableBlocks.map((block) => (
                        <div key={block.id} className="border border-slate-200 rounded-lg bg-white p-4 cursor-move" draggable>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-slate-400" />
                              {block.type === 'text' && <FileText className="w-4 h-4 text-blue-600" />}
                              {block.type === 'title' && <Type className="w-4 h-4 text-orange-600" />}
                              {block.type === 'image' && <ImageIcon className="w-4 h-4 text-green-600" />}
                              {block.type === 'video' && <Video className="w-4 h-4 text-purple-600" />}
                              <span className="text-sm font-medium text-slate-700 capitalize">
                                {block.type === 'title' ? `Title H${block.titleLevel || 1}` : `${block.type} Block`}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteContentBlock(block.id)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Block Content Editor */}
                          {block.type === 'title' && (
                            <div className="space-y-3">
                              <select
                                value={block.titleLevel || 1}
                                onChange={(e) => updateContentBlock(block.id, { titleLevel: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
                              >
                                <option value={1}>H1 - Main Title</option>
                                <option value={2}>H2 - Section Title</option>
                                <option value={3}>H3 - Subsection</option>
                                <option value={4}>H4 - Minor Heading</option>
                                <option value={5}>H5 - Small Heading</option>
                                <option value={6}>H6 - Smallest Heading</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Enter your title..."
                                value={block.content || ''}
                                onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
                              />
                              {block.content && (
                                <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                                  <div className="text-xs text-slate-500 mb-2">Preview:</div>
                                  {block.titleLevel === 1 && <h1 className="text-2xl font-bold text-slate-800">{block.content}</h1>}
                                  {block.titleLevel === 2 && <h2 className="text-xl font-semibold text-slate-800">{block.content}</h2>}
                                  {block.titleLevel === 3 && <h3 className="text-lg font-medium text-slate-800">{block.content}</h3>}
                                  {block.titleLevel === 4 && <h4 className="text-base font-medium text-slate-800">{block.content}</h4>}
                                  {block.titleLevel === 5 && <h5 className="text-sm font-medium text-slate-800">{block.content}</h5>}
                                  {block.titleLevel === 6 && <h6 className="text-xs font-medium text-slate-800">{block.content}</h6>}
                                </div>
                              )}
                            </div>
                          )}

                          {block.type === 'text' && (
                            <RichTextEditor
                              value={block.content || ''}
                              onChange={(value) => updateContentBlock(block.id, { content: value })}
                              placeholder="Enter your text content..."
                            />
                          )}
                          
                          {block.type === 'image' && (
                            <div className="space-y-3">
                              {/* Show existing uploaded image */}
                              {block.fileUrl && (
                                <div className="relative">
                                  <img
                                    src={block.fileUrl}
                                    alt="Uploaded content"
                                    className="w-full h-48 object-cover rounded-lg border border-slate-200"
                                  />
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Allow replacing with new file
                                        updateContentBlock(block.id, { fileUrl: undefined })
                                      }}
                                      className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 text-xs"
                                      title="Replace image"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateContentBlock(block.id, { fileUrl: undefined, file: undefined })}
                                      className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                      title="Remove image"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    Current Image
                                  </div>
                                </div>
                              )}

                              {/* Show new file being uploaded */}
                              {block.file instanceof File && (
                                <div className="relative">
                                  <img
                                    src={URL.createObjectURL(block.file)}
                                    alt="New upload"
                                    className="w-full h-48 object-cover rounded-lg border-2 border-green-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateContentBlock(block.id, { file: undefined })}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    title="Cancel new upload"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                    New Upload (will replace current)
                                  </div>
                                </div>
                              )}

                              {/* Upload new image section */}
                              {(!(block.file instanceof File) && !block.fileUrl) || block.fileUrl ? (
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                                  <ImageIcon className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    value=""
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) updateContentBlock(block.id, { file })
                                    }}
                                    className="hidden"
                                    id={`image-${block.id}`}
                                  />
                                  <label
                                    htmlFor={`image-${block.id}`}
                                    className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {block.fileUrl ? 'Replace Image' : 'Choose Image'}
                                  </label>
                                  {block.fileUrl && (
                                    <p className="text-xs text-slate-500 mt-1">
                                      Select a new image to replace the current one
                                    </p>
                                  )}
                                </div>
                              ) : null}

                              <input
                                type="text"
                                placeholder="Image caption (optional)"
                                value={block.caption || ''}
                                onChange={(e) => updateContentBlock(block.id, { caption: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
                              />
                            </div>
                          )}
                          
                          {block.type === 'video' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                  <Youtube className="w-4 h-4 inline mr-1" />
                                  YouTube URL
                                </label>
                                <input
                                  type="url"
                                  placeholder="https://youtube.com/watch?v=..."
                                  value={block.url || ''}
                                  onChange={(e) => updateContentBlock(block.id, { url: e.target.value, file: undefined })}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
                                />
                              </div>
                              
                              <div className="text-center text-sm text-slate-500">OR</div>
                              
                              {/* Show existing uploaded video */}
                              {block.fileUrl && !block.url && (
                                <div className="relative">
                                  <video
                                    src={block.fileUrl}
                                    className="w-full h-48 object-cover rounded-lg border border-slate-200"
                                    controls
                                  />
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateContentBlock(block.id, { fileUrl: undefined })}
                                      className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 text-xs"
                                      title="Replace video"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateContentBlock(block.id, { fileUrl: undefined, file: undefined })}
                                      className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                      title="Remove video"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    Current Video
                                  </div>
                                </div>
                              )}

                              {/* Show new file being uploaded */}
                              {block.file instanceof File && (
                                <div className="relative">
                                  <video
                                    src={URL.createObjectURL(block.file)}
                                    className="w-full h-48 object-cover rounded-lg border-2 border-green-300"
                                    controls
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateContentBlock(block.id, { file: undefined })}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    title="Cancel new upload"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                    New Upload (will replace current)
                                  </div>
                                </div>
                              )}

                              {/* Upload new video section */}
                              {(!(block.file instanceof File) && !block.fileUrl && !block.url) || (block.fileUrl && !block.url) ? (
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                                  <Video className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                                  <input
                                    type="file"
                                    accept="video/*"
                                    value=""
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) updateContentBlock(block.id, { file, url: undefined })
                                    }}
                                    className="hidden"
                                    id={`video-${block.id}`}
                                  />
                                  <label
                                    htmlFor={`video-${block.id}`}
                                    className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {block.fileUrl ? 'Replace Video' : 'Upload Video'}
                                  </label>
                                  {block.fileUrl && (
                                    <p className="text-xs text-slate-500 mt-1">
                                      Select a new video to replace the current one
                                    </p>
                                  )}
                                </div>
                              ) : null}
                              
                              <input
                                type="text"
                                placeholder="Video caption (optional)"
                                value={block.caption || ''}
                                onChange={(e) => updateContentBlock(block.id, { caption: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Layout Preview */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Layout Preview</h4>
                  <div className={`grid gap-4 ${
                    currentLayout.type === 1 ? 'grid-cols-1' :
                    currentLayout.type === 2 ? 'grid-cols-2' : 'grid-cols-3'
                  }`}>
                    {currentLayout.columns.map((column) => (
                      <div
                        key={column.id}
                        className="min-h-[300px] border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50/50"
                        onDrop={(e) => {
                          e.preventDefault()
                          const blockId = e.dataTransfer.getData('text/plain')
                          handleDragEnd({ active: { id: blockId }, over: { id: column.id } } as DragEndEvent)
                        }}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <div className="text-center text-sm text-slate-500 mb-4">
                          {column.blocks.length === 0 ? 'Drop content blocks here' : `Column ${column.id.split('-')[1]}`}
                        </div>
                        <div className="space-y-3">
                          {column.blocks.map((block) => (
                            <div key={block.id} className="bg-white border border-slate-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700 capitalize">
                                  {block.type === 'title' ? `Title H${block.titleLevel || 1}` : block.type}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => moveBlockToAvailable(block.id)}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              {/* Show preview based on block type */}
                              {block.type === 'image' && (block.fileUrl || (block.file instanceof File)) && (
                                <div className="mb-2">
                                  <img
                                    src={block.file instanceof File ? URL.createObjectURL(block.file) : block.fileUrl}
                                    alt="Preview"
                                    className="w-full h-16 object-cover rounded border"
                                  />
                                </div>
                              )}
                              
                              {block.type === 'video' && (block.fileUrl || (block.file instanceof File)) && !block.url && (
                                <div className="mb-2 relative">
                                  <video
                                    src={block.file instanceof File ? URL.createObjectURL(block.file) : block.fileUrl}
                                    className="w-full h-16 object-cover rounded border"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                                    <Video className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              )}

                              {block.type === 'video' && block.url && (
                                <div className="mb-2 bg-red-100 p-2 rounded text-xs text-red-700 flex items-center gap-1">
                                  <Youtube className="w-3 h-3" />
                                  YouTube Video
                                </div>
                              )}
                              
                              <div className="text-xs text-slate-500 truncate">
                                {block.content || block.caption || (block.type === 'image' ? 'Image' : block.type === 'video' ? 'Video' : 'No content')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Empty State */}
                {availableBlocks.length === 0 && currentLayout.columns.every(col => col.blocks.length === 0) && (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h4 className="text-lg font-semibold text-slate-700 mb-2">Start Building Your Content</h4>
                    <p className="text-slate-500 mb-4">Add content blocks above and drag them into your layout</p>
                  </div>
                )}
              </div>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeId ? (
                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg opacity-90 p-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">Dragging...</span>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
