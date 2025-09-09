'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Edit, 
  X, 
  Plus,
  Image, 
  Video, 
  ImageIcon,
  FileText,
  Upload,
  Youtube,
  GripVertical,
  Trash2,
  Type,
  Columns,
  Grid3X3,
  Square
} from 'lucide-react'
import Link from 'next/link'
import { CaseStudy, MediaType } from '@/types'
import RichTextEditor from '@/components/RichTextEditor'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Content Block Types
interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'video' | 'title'
  content?: string
  file?: File
  url?: string
  fileUrl?: string
  caption?: string
  columnId?: string
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6
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

// Draggable Block Component
interface DraggableBlockProps {
  block: ContentBlock
  onUpdate: (id: string, updates: Partial<ContentBlock>) => void
  onDelete: (id: string) => void
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ block, onUpdate, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-slate-200 rounded-lg bg-white ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded"
          >
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>
          {block.type === 'text' && <Type className="w-4 h-4 text-blue-600" />}
          {block.type === 'title' && <Type className="w-4 h-4 text-orange-600" />}
          {block.type === 'image' && <ImageIcon className="w-4 h-4 text-green-600" />}
          {block.type === 'video' && <Video className="w-4 h-4 text-purple-600" />}
          <span className="text-sm font-medium text-slate-700 capitalize">
            {block.type === 'title' ? `Title H${block.titleLevel || 1}` : `${block.type} Block`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onDelete(block.id)}
          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4">
        {block.type === 'title' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Heading Level
              </label>
              <select
                value={block.titleLevel || 1}
                onChange={(e) => onUpdate(block.id, { titleLevel: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
              >
                <option value={1}>H1 - Main Title</option>
                <option value={2}>H2 - Section Title</option>
                <option value={3}>H3 - Subsection</option>
                <option value={4}>H4 - Minor Heading</option>
                <option value={5}>H5 - Small Heading</option>
                <option value={6}>H6 - Tiny Heading</option>
              </select>
            </div>
            <textarea
              value={block.content || ''}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Enter title text..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm resize-none"
              rows={2}
            />
          </div>
        )}

        {block.type === 'text' && (
          <div className="h-48">
            <RichTextEditor
              value={block.content || ''}
              onChange={(content) => onUpdate(block.id, { content })}
              placeholder="Enter your text content..."
            />
          </div>
        )}

        {block.type === 'image' && (
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  onUpdate(block.id, { file })
                }
              }}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#0a4373] file:text-white hover:file:bg-[#083455]"
            />
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
              placeholder="Image caption (optional)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
            />
          </div>
        )}

        {block.type === 'video' && (
          <div className="space-y-3">
            <input
              type="url"
              value={block.url || ''}
              onChange={(e) => onUpdate(block.id, { url: e.target.value })}
              placeholder="YouTube URL or video file URL"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
            />
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
              placeholder="Video caption (optional)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Droppable Column Component
interface DroppableColumnProps {
  column: LayoutColumn
  blocks: ContentBlock[]
  onUpdate: (id: string, updates: Partial<ContentBlock>) => void
  onDelete: (id: string) => void
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ column, blocks, onUpdate, onDelete }) => {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
  })

  const {
    attributes: columnAttributes,
    listeners: columnListeners,
    setNodeRef: setSortableRef,
    transform: columnTransform,
    transition: columnTransition,
    isDragging: isColumnDragging
  } = useSortable({ 
    id: `column-draggable-${column.id}`,
    data: { type: 'column', column }
  })

  const columnStyle = {
    transform: CSS.Transform.toString(columnTransform),
    transition: columnTransition,
    opacity: isColumnDragging ? 0.5 : 1
  }

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node)
    setSortableRef(node)
  }

  return (
    <div
      ref={setNodeRef}
      style={columnStyle}
      className={`w-full min-h-[400px] border-2 border-dashed rounded-lg p-4 transition-colors ${
        isOver 
          ? 'border-[#0a4373] bg-[#0a4373]/5' 
          : isColumnDragging
          ? 'border-blue-300 bg-blue-50/50'
          : 'border-slate-200 bg-slate-50/50'
      }`}
    >
      <div className="flex items-center justify-center mb-4">
        <div
          {...columnAttributes}
          {...columnListeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-200 rounded-lg transition-colors"
          title="Drag to reorder column"
        >
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-center text-sm text-slate-500 flex-1">
          {blocks.length === 0 ? 'Drop content blocks here' : `Column ${column.id.split('-')[1]}`}
        </div>
      </div>
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {blocks.map((block) => (
            <DraggableBlock
              key={block.id}
              block={block}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

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

  // Content Block Management State
  const [availableBlocks, setAvailableBlocks] = useState<ContentBlock[]>([])
  const [currentLayout, setCurrentLayout] = useState<Layout>({
    id: 'layout-1',
    type: 1,
    columns: [{ id: 'column-1', blocks: [] }]
  })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>('IMAGE_ONLY')
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string>('')
  const [featuredVideo, setFeaturedVideo] = useState<string>('')

  // DnD Sensors
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

        // Parse and populate content blocks
        if (data.content) {
          try {
            const parsedContent = JSON.parse(data.content)
            if (parsedContent.layout && parsedContent.layout.columns) {
              setCurrentLayout(parsedContent.layout)
            }
            if (parsedContent.availableBlocks) {
              setAvailableBlocks(parsedContent.availableBlocks)
            }
          } catch (error) {
            console.error('Error parsing content:', error)
          }
        }

        // Set media data
        setMediaType(data.mediaType || 'IMAGE_ONLY')
        setFeaturedImageUrl(data.featuredImage || '')
        setFeaturedVideo(data.featuredVideo || '')

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Content Block Management Functions
  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: type === 'title' ? 'New Title' : type === 'text' ? 'New text content...' : '',
      titleLevel: type === 'title' ? 2 : undefined
    }
    setAvailableBlocks(prev => [...prev, newBlock])
  }

  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    setAvailableBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ))
    setCurrentLayout(prev => ({
      ...prev,
      columns: prev.columns.map(column => ({
        ...column,
        blocks: column.blocks.map(block => 
          block.id === id ? { ...block, ...updates } : block
        )
      }))
    }))
  }

  const deleteContentBlock = (id: string) => {
    setAvailableBlocks(prev => prev.filter(block => block.id !== id))
    setCurrentLayout(prev => ({
      ...prev,
      columns: prev.columns.map(column => ({
        ...column,
        blocks: column.blocks.filter(block => block.id !== id)
      }))
    }))
  }

  const changeLayout = (type: 1 | 2 | 3) => {
    const newColumns: LayoutColumn[] = []
    for (let i = 0; i < type; i++) {
      newColumns.push({
        id: `column-${i + 1}`,
        blocks: i === 0 ? currentLayout.columns[0]?.blocks || [] : []
      })
    }
    setCurrentLayout({
      id: generateId(),
      type,
      columns: newColumns
    })
  }

  // Drag and Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Handle column reordering
    if (activeId.startsWith('column-draggable-') && overId.startsWith('column-draggable-')) {
      const activeColumnId = activeId.replace('column-draggable-', '')
      const overColumnId = overId.replace('column-draggable-', '')
      
      if (activeColumnId !== overColumnId) {
        setCurrentLayout(prev => {
          const columns = [...prev.columns]
          const activeIndex = columns.findIndex(col => col.id === activeColumnId)
          const overIndex = columns.findIndex(col => col.id === overColumnId)
          
          if (activeIndex !== -1 && overIndex !== -1) {
            const [movedColumn] = columns.splice(activeIndex, 1)
            columns.splice(overIndex, 0, movedColumn)
          }
          
          return {
            ...prev,
            columns
          }
        })
      }
      return
    }

    // Find the active block
    let activeBlock = availableBlocks.find(b => b.id === activeId)
    if (!activeBlock) {
      // Look in columns
      for (const column of currentLayout.columns) {
        const found = column.blocks.find(b => b.id === activeId)
        if (found) {
          activeBlock = found
          break
        }
      }
    }

    if (!activeBlock) return

    // Handle dropping on column
    if (overId.startsWith('column-')) {
      const targetColumnId = overId
      
      // Remove from available blocks
      setAvailableBlocks(prev => prev.filter(b => b.id !== activeId))
      
      // Remove from other columns
      setCurrentLayout(prev => ({
        ...prev,
        columns: prev.columns.map(column => ({
          ...column,
          blocks: column.id === targetColumnId 
            ? [...column.blocks, { ...activeBlock!, columnId: targetColumnId }]
            : column.blocks.filter(b => b.id !== activeId)
        }))
      }))
    }
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
          content: JSON.stringify({
            layout: currentLayout,
            availableBlocks: availableBlocks
          }),
          mediaType: mediaType,
          featuredVideo: featuredVideo,
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

                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Edit Content</span>
                  </button>
                  
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

                {/* Content Editing Section */}
                <div className="mt-8 border-t border-slate-200 pt-8">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">Content Editor</h3>
                        <div className="flex items-center gap-2">
                          {Object.entries(LAYOUT_TEMPLATES).map(([key, template]) => {
                            const Icon = template.icon
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => changeLayout(parseInt(key) as 1 | 2 | 3)}
                                className={`p-2 rounded-lg transition-colors ${
                                  currentLayout.type === parseInt(key)
                                    ? 'bg-[#0a4373] text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title={template.label}
                              >
                                <Icon className="w-4 h-4" />
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Content Block Tools */}
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-3">Add Content Blocks</h4>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => addContentBlock('title')}
                            className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                          >
                            <Type className="w-4 h-4" />
                            Title
                          </button>
                          <button
                            type="button"
                            onClick={() => addContentBlock('text')}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Text
                          </button>
                          <button
                            type="button"
                            onClick={() => addContentBlock('image')}
                            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            <ImageIcon className="w-4 h-4" />
                            Image
                          </button>
                          <button
                            type="button"
                            onClick={() => addContentBlock('video')}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                          >
                            <Video className="w-4 h-4" />
                            Video
                          </button>
                        </div>
                      </div>

                      {/* Available Blocks */}
                      {availableBlocks.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-3">Available Content Blocks</h4>
                          <SortableContext items={availableBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-4">
                              {availableBlocks.map((block) => (
                                <DraggableBlock
                                  key={block.id}
                                  block={block}
                                  onUpdate={updateContentBlock}
                                  onDelete={deleteContentBlock}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </div>
                      )}

                      {/* Layout Grid */}
                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-3">Layout Preview</h4>
                        <SortableContext 
                          items={currentLayout.columns.map(col => `column-draggable-${col.id}`)} 
                          strategy={verticalListSortingStrategy}
                        >
                          <div className={`grid gap-4 items-start ${
                            currentLayout.type === 1 ? 'grid-cols-1' :
                            currentLayout.type === 2 ? 'grid-cols-2' : 'grid-cols-3'
                          }`}>
                            {currentLayout.columns.map((column) => (
                              <DroppableColumn
                                key={column.id}
                                column={column}
                                blocks={column.blocks}
                                onUpdate={updateContentBlock}
                                onDelete={deleteContentBlock}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </div>

                      {/* Empty State */}
                      {availableBlocks.length === 0 && currentLayout.columns.every(col => col.blocks.length === 0) && (
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                          <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                          <h4 className="text-lg font-semibold text-slate-700 mb-2">Start Building Your Content</h4>
                          <p className="text-slate-500 mb-4">Add content blocks and drag them into your layout</p>
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => addContentBlock('title')}
                              className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                            >
                              <Type className="w-4 h-4" />
                              Add Title
                            </button>
                            <button
                              type="button"
                              onClick={() => addContentBlock('text')}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              <FileText className="w-4 h-4" />
                              Add Text
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Drag Overlay */}
                    <DragOverlay>
                      {activeId ? (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-lg opacity-90">
                          <div className="p-3 bg-slate-50 rounded-t-lg">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">Content Block</span>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
