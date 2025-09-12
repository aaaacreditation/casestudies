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
  fileUrl?: string // For existing uploaded images
  caption?: string
  columnId?: string
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6 // For title blocks
  padding?: number // Padding in pixels
  margin?: number // Margin in pixels
}

// Page Builder Types
interface LayoutColumn {
  id: string
  blocks: ContentBlock[]
  width?: number // percentage width (e.g., 50 for 50%)
}

interface Section {
  id: string
  columns: LayoutColumn[]
}

interface PageLayout {
  id: string
  type?: number
  sections?: Section[]
  columns?: LayoutColumn[]
}

// Layout Templates
const LAYOUT_TEMPLATES = {
  1: { columns: 1, icon: Square, label: '1 Column' },
  2: { columns: 2, icon: Columns, label: '2 Columns' },
  3: { columns: 3, icon: Grid3X3, label: '3 Columns' }
}

// Component Palette Item
interface PaletteComponentProps {
  type: 'text' | 'image' | 'video' | 'title'
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const PaletteComponent: React.FC<PaletteComponentProps> = ({ type, label, icon: Icon, description }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: `palette-${type}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab active:cursor-grabbing p-4 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-[#0a4373] hover:bg-[#0a4373]/5 transition-all ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <div className={`p-2 rounded-lg ${
          type === 'title' ? 'bg-orange-100 text-orange-600' :
          type === 'text' ? 'bg-blue-100 text-blue-600' :
          type === 'image' ? 'bg-green-100 text-green-600' :
          'bg-purple-100 text-purple-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-medium text-slate-900 group-hover:text-[#0a4373]">{label}</h4>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
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
            {!block.file && !block.fileUrl && !block.url ? (
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
                    src={
                      block.file 
                        ? URL.createObjectURL(block.file)
                        : block.fileUrl || block.url || ''
                    }
                    alt={block.caption || "Block content"}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdate(block.id, { 
                      file: undefined, 
                      fileUrl: undefined, 
                      url: undefined 
                    })}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {/* Replace image button */}
                  <div className="absolute bottom-2 left-2">
                    <input
                      type="file"
                      accept="image/*"
                      value=""
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onUpdate(block.id, { file, fileUrl: undefined, url: undefined })
                      }}
                      className="hidden"
                      id={`replace-image-${block.id}`}
                    />
                    <label
                      htmlFor={`replace-image-${block.id}`}
                      className="inline-flex items-center px-2 py-1 text-xs bg-white/90 text-slate-700 rounded border border-slate-300 hover:bg-white cursor-pointer"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Replace
                    </label>
                  </div>
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

// Droppable Section Component  
interface DroppableSectionProps {
  section: Section
  sectionIndex: number
  onUpdateBlock: (id: string, updates: Partial<ContentBlock>) => void
  onDeleteBlock: (id: string) => void
  onAddColumn: (sectionId: string) => void
  onRemoveColumn: (sectionId: string, columnId: string) => void
}

const DroppableSection: React.FC<DroppableSectionProps> = ({ 
  section, 
  sectionIndex,
  onUpdateBlock, 
  onDeleteBlock,
  onAddColumn,
  onRemoveColumn
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 border-slate-200 rounded-lg p-4 mb-4 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 p-2 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded"
        >
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
          <span className="text-sm font-medium text-slate-700">Section {sectionIndex + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAddColumn(section.id)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            <Square className="w-3 h-3" />
            Add Column
          </button>
          {section.columns.length > 1 && (
          <button
            type="button"
              onClick={() => onRemoveColumn(section.id, section.columns[section.columns.length - 1].id)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
              <X className="w-3 h-3" />
              Remove Column
          </button>
          )}
        </div>
      </div>

      {/* Columns Grid */}
      <div 
        className="grid gap-4" 
        style={{ 
          gridTemplateColumns: section.columns.map(col => `${col.width || 100/section.columns.length}fr`).join(' ')
        }}
      >
        {section.columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
          />
        ))}
      </div>
    </div>
  )
}

// Droppable Column Component
interface DroppableColumnProps {
  column: LayoutColumn
  onUpdateBlock: (id: string, updates: Partial<ContentBlock>) => void
  onDeleteBlock: (id: string) => void
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ 
  column, 
  onUpdateBlock, 
  onDeleteBlock 
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[300px] border-2 border-dashed rounded-lg p-3 transition-colors ${
        isOver ? 'border-[#0a4373] bg-[#0a4373]/5' : 'border-slate-300'
      }`}
    >
      <SortableContext items={column.blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
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
        <div className="text-center py-8 text-slate-400">
          <GripVertical className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-xs">Drop components here</p>
      </div>
    )}
  </div>
)
}

export default function NewCaseStudy() {
  const router = useRouter()
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

  // Page Builder State
  const [pageLayout, setPageLayout] = useState<PageLayout>({
    id: 'page-1',
    sections: [{
      id: 'section-1',
      columns: [{ id: 'column-1', blocks: [], width: 100 }]
    }]
  })
  
  const [availableBlocks, setAvailableBlocks] = useState<ContentBlock[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.IMAGE_ONLY)
  const [featuredVideo, setFeaturedVideo] = useState<string>('')
  const [featuredImage, setFeaturedImage] = useState<string>('')
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null)

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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
    
    setPageLayout(prev => {
      // Handle both direct columns and sections with columns
      if (prev.columns) {
        return {
      ...prev,
      columns: prev.columns.map(col => 
        col.id === columnId 
              ? { ...col, blocks: [...(col.blocks || []), newBlock] }
              : col
          )
        }
      } else if (prev.sections) {
        return {
          ...prev,
          sections: prev.sections.map(section => ({
            ...section,
            columns: section.columns.map(col => 
              col.id === columnId 
                ? { ...col, blocks: [...(col.blocks || []), newBlock] }
          : col
      )
    }))
        }
      }
      return prev;
    })
  }

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setPageLayout(prev => ({
      ...prev,
      sections: prev.sections?.map(section => ({
        ...section,
        columns: section.columns.map(column => ({
          ...column,
          blocks: column.blocks.map(block => 
          block.id === id ? { ...block, ...updates } : block
        )
      }))
    }))
    }))

    setAvailableBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ))
  }

  const deleteBlock = (id: string) => {
    setPageLayout(prev => ({
      ...prev,
      sections: prev.sections?.map(section => ({
        ...section,
        columns: section.columns.map(column => ({
          ...column,
          blocks: column.blocks.filter(block => block.id !== id)
      }))
    }))
    }))

    setAvailableBlocks(prev => prev.filter(block => block.id !== id))
  }

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      columns: [{ id: `column-${Date.now()}`, blocks: [], width: 100 }]
    }
    setPageLayout(prev => ({
            ...prev,
      sections: [...(prev.sections || []), newSection]
    }))
  }

  const removeSection = (sectionId: string) => {
    setPageLayout(prev => ({
          ...prev,
      sections: prev.sections?.filter(section => section.id !== sectionId) || []
    }))
  }

  const addColumnToSection = (sectionId: string) => {
    setPageLayout(prev => ({
          ...prev,
      sections: prev.sections?.map(section => {
        if (section.id === sectionId) {
          const newColumn: LayoutColumn = {
            id: `column-${Date.now()}`,
            blocks: [],
            width: 100 / (section.columns.length + 1)
          }
          // Redistribute widths
          const updatedColumns = section.columns.map(col => ({
            ...col,
            width: 100 / (section.columns.length + 1)
          }))
              return {
            ...section,
            columns: [...updatedColumns, newColumn]
              }
            }
        return section
          })
        }))
      }
      
  const removeColumnFromSection = (sectionId: string, columnId: string) => {
    setPageLayout(prev => ({
          ...prev,
      sections: prev.sections?.map(section => {
        if (section.id === sectionId && section.columns.length > 1) {
          const remainingColumns = section.columns.filter(col => col.id !== columnId)
          // Redistribute widths
          const updatedColumns = remainingColumns.map(col => ({
                ...col,
            width: 100 / remainingColumns.length
          }))
              return {
            ...section,
            columns: updatedColumns
              }
            }
        return section
          })
        }))
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

    // Handle dropping palette components into columns
    if (activeId.startsWith('palette-') && overId.startsWith('column-')) {
      const componentType = activeId.replace('palette-', '') as 'text' | 'image' | 'video' | 'title'
      const targetColumnId = overId
      
      const newBlock: ContentBlock = {
        id: Date.now().toString(),
        type: componentType,
        content: componentType === 'text' || componentType === 'title' ? 'Click to edit...' : undefined,
        file: undefined,
        url: undefined,
        fileUrl: undefined,
        caption: undefined,
        titleLevel: componentType === 'title' ? 1 : undefined,
        padding: 16,
        margin: 8,
        columnId: targetColumnId
      }
      
      setPageLayout(prev => ({
        ...prev,
        sections: prev.sections?.map(section => ({
          ...section,
          columns: section.columns.map(col => 
            col.id === targetColumnId 
              ? { ...col, blocks: [...col.blocks, newBlock] }
              : col
          )
        }))
      }))
      return
    }

    // Handle section reordering
    if (activeId.startsWith('section-') && overId.startsWith('section-')) {
      const activeIndex = pageLayout.sections?.findIndex(section => section.id === activeId) ?? -1
      const overIndex = pageLayout.sections?.findIndex(section => section.id === overId) ?? -1
      
      if (activeIndex !== overIndex) {
        const newSections = [...(pageLayout.sections || [])]
        const [removed] = newSections.splice(activeIndex, 1)
        newSections.splice(overIndex, 0, removed)
        
        setPageLayout(prev => ({
          ...prev,
          sections: newSections
        }))
      }
      return
    }

    // Handle dropping into columns (existing block movement)
    if (overId.startsWith('column-')) {
      // Find source column
      let sourceColumnId: string | undefined
      let blockToMove: ContentBlock | undefined
      
      for (const section of pageLayout.sections || []) {
        for (const column of section.columns) {
          const foundBlock = column.blocks.find(block => block.id === activeId)
          if (foundBlock) {
            sourceColumnId = column.id
            blockToMove = foundBlock
            break
          }
        }
        if (blockToMove) break
      }

      if (sourceColumnId && blockToMove && sourceColumnId !== overId) {
        setPageLayout(prev => ({
          ...prev,
          sections: prev.sections?.map(section => ({
            ...section,
            columns: section.columns.map(col => {
              if (col.id === sourceColumnId) {
                return { ...col, blocks: col.blocks.filter(block => block.id !== activeId) }
              }
              if (col.id === overId) {
                return { ...col, blocks: [...col.blocks, { ...blockToMove!, columnId: overId }] }
              }
              return col
            })
          }))
        }))
      }
    }
  }

  // Handle featured image upload
  const handleFeaturedImageUpload = async (file: File) => {
    // For new case studies, we'll store the file and upload it after creation
    setFeaturedImageFile(file)
    setFeaturedImage(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/case-studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle,
          excerpt: formData.excerpt,
          content: JSON.stringify({
            pageLayout: pageLayout,
            availableBlocks: availableBlocks
          }),
          mediaType: mediaType,
          featuredVideo: featuredVideo,
          companyName: formData.companyName,
          companyIndustry: formData.companyIndustry,
          companyLocation: formData.companyLocation,
          companySize: formData.companySize,
          companyWebsite: formData.companyWebsite,
          companyDescription: formData.companyDescription,
          published: false
        })
      })

      if (response.ok) {
        const newCaseStudy = await response.json()
        
        // If we have a featured image, upload it
        if (featuredImageFile && newCaseStudy.id) {
          const formData = new FormData()
          formData.append('featuredImage', featuredImageFile)
          
          await fetch(`/api/case-studies/${newCaseStudy.id}/media`, {
            method: 'POST',
            body: formData
          })
        }

        router.push('/admin/dashboard')
      } else {
        console.error('Failed to create case study')
      }
    } catch (error) {
      console.error('Error creating case study:', error)
    } finally {
      setSaving(false)
    }
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
              <h1 className="text-xl font-semibold text-slate-900">Create New Case Study</h1>
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
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Case Study</span>
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

          {/* Cover Image */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Cover Image</h2>
            <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                  Featured Image
                    </label>
                <p className="text-sm text-slate-500 mb-4">
                  Upload a high-quality image that will be displayed as the main visual for this case study.
                </p>
                
                {!featuredImage && !featuredImageFile ? (
                  // Upload new image
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#0a4373] transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFeaturedImageUpload(file)
                        }
                      }}
                            className="hidden"
                      id="featured-image-upload"
                          />
                          <label
                      htmlFor="featured-image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <ImageIcon className="w-12 h-12 text-slate-400 mb-4" />
                      <span className="text-lg font-medium text-slate-700 mb-2">
                        Choose Cover Image
                      </span>
                      <span className="text-sm text-slate-500">
                        PNG, JPG, GIF up to 10MB
                      </span>
                          </label>
                      </div>
                    ) : (
                  // Show current or selected image
                      <div className="relative">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={featuredImage}
                        alt="Featured image"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleFeaturedImageUpload(file)
                              }
                            }}
                            className="hidden"
                            id="replace-featured-image"
                          />
                          <label
                            htmlFor="replace-featured-image"
                            className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 cursor-pointer flex items-center gap-1"
                          >
                            <Upload className="w-4 h-4" />
                            Replace
                          </label>
                        <button
                          type="button"
                            onClick={() => {
                              setFeaturedImage('')
                              setFeaturedImageFile(null)
                            }}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                            Remove
                        </button>
                        </div>
                      </div>
                    </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

          {/* Content Builder */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Page Builder</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addSection}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  <Square className="w-4 h-4" />
                  Add Section
                </button>
                  </div>
                </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {/* Component Palette and Page Builder */}
              <div className="grid grid-cols-12 gap-6">
                {/* Component Palette */}
                <div className="col-span-3">
                  <div className="sticky top-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-slate-400" />
                      Components
                    </h3>
                    <div className="space-y-3">
                      <SortableContext items={['palette-title', 'palette-text', 'palette-image', 'palette-video']} strategy={verticalListSortingStrategy}>
                        <PaletteComponent
                          type="title"
                          label="Title"
                          icon={Type}
                          description="Add headings and titles"
                        />
                        <PaletteComponent
                      type="text"
                          label="Text"
                          icon={FileText}
                          description="Rich text content"
                        />
                        <PaletteComponent
                          type="image"
                          label="Image"
                          icon={ImageIcon}
                          description="Upload and display images"
                        />
                        <PaletteComponent
                          type="video"
                          label="Video"
                          icon={Video}
                          description="Embed videos and media"
                        />
                      </SortableContext>
                  </div>

                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">
                        💡 <strong>Tip:</strong> Drag components into columns and sections to build your page.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Page Sections */}
                <div className="col-span-9">
                  <SortableContext items={(pageLayout.sections || []).map(section => section.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {pageLayout.sections?.map((section, index) => (
                        <DroppableSection
                          key={section.id}
                          section={section}
                          sectionIndex={index}
                          onUpdateBlock={updateBlock}
                          onDeleteBlock={deleteBlock}
                          onAddColumn={addColumnToSection}
                          onRemoveColumn={removeColumnFromSection}
                        />
                      ))}
                  </div>
                  </SortableContext>
                </div>
              </div>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeId ? (
                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg opacity-90">
                    <div className="p-3 bg-slate-50 rounded-t-lg">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                          {activeId.startsWith('palette-') ? 'New Component' : 'Content Block'}
                        </span>
                </div>
              </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Empty State */}
            {pageLayout.sections?.length === 0 && (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center mt-6">
                <Square className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h4 className="text-lg font-semibold text-slate-700 mb-2">Start Building Your Page</h4>
                <p className="text-slate-500">Click &quot;Add Section&quot; to create your first section, then drag components into columns</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
