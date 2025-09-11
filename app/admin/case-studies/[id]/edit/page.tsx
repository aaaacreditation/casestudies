'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  Youtube,
  GripVertical,
  Trash2,
  Type,
  Columns,
  Grid3X3,
  Square
} from 'lucide-react'
import Link from 'next/link'
import { MediaType } from '@/types'
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
  closestCenter,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
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
  caption?: string
  columnId?: string
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6 // For title blocks
  padding?: number // Padding in pixels
  margin?: number // Margin in pixels
}

// Layout Types
interface LayoutColumn {
  id: string
  blocks: ContentBlock[]
}

interface Layout {
  id: string
  type: 1 | 2 | 3 // number of columns
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
        <div className="flex items-center gap-2">
          {/* Spacing Controls */}
          <div className="flex items-center gap-2 text-xs bg-slate-100 px-2 py-1 rounded">
            <div className="flex items-center gap-1">
              <label className="text-blue-600 font-medium">P:</label>
          <input
                type="number"
                min="0"
                max="100"
                value={block.padding || 16}
                onChange={(e) => onUpdate(block.id, { padding: parseInt(e.target.value) || 0 })}
                className="w-12 px-1 py-0.5 text-xs border border-slate-200 rounded focus:border-blue-400 focus:outline-none"
                title="Internal spacing (padding)"
              />
              <span className="text-slate-400">px</span>
        </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-1">
              <label className="text-green-600 font-medium">M:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={block.margin || 8}
                onChange={(e) => onUpdate(block.id, { margin: parseInt(e.target.value) || 0 })}
                className="w-12 px-1 py-0.5 text-xs border border-slate-200 rounded focus:border-green-400 focus:outline-none"
                title="External spacing (margin)"
              />
              <span className="text-slate-400">px</span>
            </div>
          </div>
          
          {/* Quick spacing presets */}
          <div className="flex items-center gap-1">
        <button
          type="button"
              onClick={() => onUpdate(block.id, { padding: 8, margin: 4 })}
              className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-600 transition-colors"
              title="Compact spacing"
            >
              S
        </button>
            <button
              type="button"
              onClick={() => onUpdate(block.id, { padding: 16, margin: 8 })}
              className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-600 transition-colors"
              title="Default spacing"
            >
              M
            </button>
            <button
              type="button"
              onClick={() => onUpdate(block.id, { padding: 24, margin: 16 })}
              className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-600 transition-colors"
              title="Large spacing"
            >
              L
            </button>
                  </div>
          
                  <button
                    type="button"
            onClick={() => onDelete(block.id)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                  >
            <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                </div>
      
      <div 
        className="border-t border-slate-200 relative" 
        style={{ 
          padding: `${block.padding || 16}px`, 
          margin: `${block.margin || 8}px 0`,
          backgroundColor: (block.padding || 16) > 16 ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
          border: (block.padding || 16) > 16 ? '1px dashed rgba(59, 130, 246, 0.2)' : 'none'
        }}
      >
        {/* Visual padding indicator */}
        {(block.padding || 16) > 16 && (
          <div className="absolute top-1 left-1 text-xs text-blue-500 bg-blue-50 px-1 rounded">
            P: {block.padding}px
          </div>
        )}
        {/* Visual margin indicator */}
        {(block.margin || 8) > 8 && (
          <div className="absolute -top-3 right-1 text-xs text-green-600 bg-green-50 px-1 rounded">
            M: {block.margin}px
        </div>
        )}

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
                <option value={6}>H6 - Smallest Heading</option>
            </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Title Text
              </label>
            <input
              type="text"
                placeholder="Click to edit title..."
              value={block.content || ''}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
              />
            </div>
            {/* Preview */}
            {block.content && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Preview:</p>
                {block.titleLevel === 1 && <h1 className="text-3xl font-bold">{block.content}</h1>}
                {block.titleLevel === 2 && <h2 className="text-2xl font-bold">{block.content}</h2>}
                {block.titleLevel === 3 && <h3 className="text-xl font-bold">{block.content}</h3>}
                {block.titleLevel === 4 && <h4 className="text-lg font-bold">{block.content}</h4>}
                {block.titleLevel === 5 && <h5 className="text-base font-bold">{block.content}</h5>}
                {block.titleLevel === 6 && <h6 className="text-sm font-bold">{block.content}</h6>}
              </div>
            )}
          </div>
        )}

        {block.type === 'text' && (
          <RichTextEditor
            value={block.content || ''}
            onChange={(value) => onUpdate(block.id, { content: value })}
            placeholder="Click to edit text content..."
          />
        )}

        {block.type === 'image' && (
          <>
            {!block.file ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  value=""
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onUpdate(block.id, { file })
                  }}
                  className="hidden"
                  id={`image-${block.id}`}
                />
                <label
                  htmlFor={`image-${block.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </label>
              </div>
            ) : (
          <div className="space-y-3">
              <div className="relative">
                <img
                    src={URL.createObjectURL(block.file)}
                    alt="Block content"
                    className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                    onClick={() => onUpdate(block.id, { file: undefined })}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            <input
              type="text"
                  placeholder="Image caption (optional)"
              value={block.caption || ''}
              onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
            />
          </div>
            )}
          </>
        )}

        {block.type === 'video' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Video URL
              </label>
            <input
              type="url"
                placeholder="Paste YouTube URL or video file URL"
              value={block.url || ''}
              onChange={(e) => onUpdate(block.id, { url: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
            />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Caption (optional)
              </label>
            <input
              type="text"
                placeholder="Video caption"
              value={block.caption || ''}
              onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
              />
            </div>
            {/* Video Preview */}
            {block.url && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-2">Preview:</p>
                {block.url.includes('youtube.com') || block.url.includes('youtu.be') ? (
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    <Youtube className="w-4 h-4" />
                    YouTube Video
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video File
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Droppable Column Component
interface DroppableColumnProps {
  column: LayoutColumn
  onAddBlock: (columnId: string, type: 'text' | 'image' | 'video' | 'title') => void
  onUpdateBlock: (id: string, updates: Partial<ContentBlock>) => void
  onDeleteBlock: (id: string) => void
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ 
  column, 
  onAddBlock, 
  onUpdateBlock, 
  onDeleteBlock 
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[400px] border-2 border-dashed rounded-lg p-4 transition-colors ${
        isOver ? 'border-[#0a4373] bg-[#0a4373]/5' : 'border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600">
          Column {column.id.split('-')[1]}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onAddBlock(column.id, 'title')}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
          >
            <Type className="w-3 h-3" />
            Title
          </button>
          <button
            type="button"
            onClick={() => onAddBlock(column.id, 'text')}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
          >
            <FileText className="w-3 h-3" />
            Text
          </button>
          <button
            type="button"
            onClick={() => onAddBlock(column.id, 'image')}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
          >
            <ImageIcon className="w-3 h-3" />
            Image
          </button>
          <button
            type="button"
            onClick={() => onAddBlock(column.id, 'video')}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors"
          >
            <Video className="w-3 h-3" />
            Video
          </button>
        </div>
      </div>

      <SortableContext items={column.blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {column.blocks.map(block => (
            <DraggableBlock
              key={block.id}
              block={block}
              onUpdate={onUpdateBlock}
              onDelete={onDeleteBlock}
            />
          ))}
        </div>
      </SortableContext>

      {column.blocks.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm">Drop content blocks here or use the buttons above</p>
        </div>
      )}
    </div>
  )
}

export default function EditCaseStudy() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    companyName: '',
    companyIndustry: '',
    companyLocation: '',
    companySize: '',
    companyWebsite: '',
    companyDescription: ''
  })

  // Content Management State
  const [currentLayout, setCurrentLayout] = useState<Layout>({
    id: 'layout-1',
    type: 1,
    columns: [{ id: 'column-1', blocks: [] }]
  })
  
  const [availableBlocks, setAvailableBlocks] = useState<ContentBlock[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.IMAGE_ONLY)
  const [featuredVideo, setFeaturedVideo] = useState<string>('')

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Fetch existing case study data
  const fetchCaseStudy = useCallback(async () => {
    try {
      const response = await fetch(`/api/case-studies/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        
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
          companyDescription: data.company.description || ''
        })

        // Parse and populate content blocks
        if (data.content) {
          try {
            const parsedContent = JSON.parse(data.content)
            console.log('Parsed content:', parsedContent)
            
            if (parsedContent.layout && parsedContent.layout.columns) {
              setCurrentLayout(parsedContent.layout)
            } else {
              // Initialize with default layout
              setCurrentLayout({
                id: 'layout-1',
                type: 1,
                columns: [{ id: 'column-1', blocks: [] }]
              })
            }
            
            if (parsedContent.availableBlocks && Array.isArray(parsedContent.availableBlocks)) {
              setAvailableBlocks(parsedContent.availableBlocks)
            } else {
              setAvailableBlocks([])
            }
          } catch (error) {
            console.error('Error parsing content:', error)
            // Initialize with default layout
            setCurrentLayout({
              id: 'layout-1',
              type: 1,
              columns: [{ id: 'column-1', blocks: [] }]
            })
            setAvailableBlocks([])
          }
        } else {
          // No content yet, initialize with default layout
          setCurrentLayout({
            id: 'layout-1',
            type: 1,
            columns: [{ id: 'column-1', blocks: [] }]
          })
          setAvailableBlocks([])
        }

        // Set media data
        setMediaType(data.mediaType || MediaType.IMAGE_ONLY)
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

  const addBlockToColumn = (columnId: string, type: 'text' | 'image' | 'video' | 'title') => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'text' || type === 'title' ? 'Click to edit...' : undefined,
      file: undefined,
      url: undefined,
      caption: undefined,
      titleLevel: type === 'title' ? 1 : undefined,
      padding: 16,
      margin: 8,
      columnId: columnId
    }
    
    setCurrentLayout(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.id === columnId 
          ? { ...col, blocks: [...col.blocks, newBlock] }
          : col
      )
    }))
  }

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setCurrentLayout(prev => ({
      ...prev,
      columns: prev.columns.map(column => ({
        ...column,
        blocks: column.blocks.map(block => 
          block.id === id ? { ...block, ...updates } : block
        )
      }))
    }))

    setAvailableBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ))
  }

  const deleteBlock = (id: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      columns: prev.columns.map(column => ({
        ...column,
        blocks: column.blocks.filter(block => block.id !== id)
      }))
    }))

    setAvailableBlocks(prev => prev.filter(block => block.id !== id))
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Handle dropping into columns
    if (overId.startsWith('column-')) {
      const sourceColumnId = currentLayout.columns.find(col => 
        col.blocks.some(block => block.id === activeId)
      )?.id

      const targetColumnId = overId

      if (sourceColumnId && sourceColumnId !== targetColumnId) {
        // Move block between columns
        const sourceColumn = currentLayout.columns.find(col => col.id === sourceColumnId)
        const blockToMove = sourceColumn?.blocks.find(block => block.id === activeId)

        if (blockToMove) {
          setCurrentLayout(prev => ({
            ...prev,
            columns: prev.columns.map(col => {
              if (col.id === sourceColumnId) {
                return { ...col, blocks: col.blocks.filter(block => block.id !== activeId) }
              }
              if (col.id === targetColumnId) {
                return { ...col, blocks: [...col.blocks, { ...blockToMove, columnId: targetColumnId }] }
              }
              return col
            })
          }))
        }
      }
    }
  }

  const handleSave = async () => {
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
        router.push('/admin/dashboard')
      } else {
        console.error('Failed to update case study')
      }
    } catch (error) {
      console.error('Error updating case study:', error)
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
                href={`/case-studies/${params.id}`}
                target="_blank"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Link>
              
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
                        <span>Save Changes</span>
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
          className="space-y-8"
        >
                  {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Case Study Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                    placeholder="Enter a compelling case study title"
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
                    placeholder="Optional subtitle for additional context"
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
                          placeholder="Brief description for case study cards"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none resize-vertical"
                          required
                        />
                    </div>
                  </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Company Name *</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                    placeholder="Client company name"
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
                    placeholder="e.g., Technology, Healthcare, Finance"
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
                    placeholder="e.g., New York, USA"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none"
                          required
                        />
                      </div>
                      </div>
                  </div>
                </div>

          {/* Content Builder */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Content Builder</h2>
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

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {/* Layout Grid */}
              <div className={`grid gap-6 ${
                currentLayout.type === 1 ? 'grid-cols-1' :
                currentLayout.type === 2 ? 'grid-cols-2' : 'grid-cols-3'
              }`}>
                {currentLayout.columns.map((column) => (
                  <DroppableColumn
                    key={column.id}
                    column={column}
                    onAddBlock={addBlockToColumn}
                    onUpdateBlock={updateBlock}
                    onDeleteBlock={deleteBlock}
                  />
                ))}
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

            {/* Empty State */}
            {currentLayout.columns.every(col => col.blocks.length === 0) && (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center mt-6">
                <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h4 className="text-lg font-semibold text-slate-700 mb-2">Start Building Your Content</h4>
                <p className="text-slate-500">Use the buttons in each column to add titles, text, images, and videos</p>
                </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}