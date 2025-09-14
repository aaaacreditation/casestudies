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
  useSortable,
  arrayMove
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

  // Fetch existing case study data
  const fetchCaseStudy = useCallback(async () => {
    try {
      console.log('🔍 Fetching case study with ID:', params.id)
      const response = await fetch(`/api/case-studies/${params.id}`)
      console.log('📡 API Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Full API response data:', data)
        console.log('📝 Case study title:', data.title)
        console.log('🏢 Company data:', data.company)
        
        // Populate form data
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          excerpt: data.excerpt || '',
          companyName: data.company?.name || '',
          companyIndustry: data.company?.industry || '',
          companyLocation: data.company?.location || '',
          companySize: data.company?.size || '',
          companyWebsite: data.company?.website || '',
          companyDescription: data.company?.description || ''
        })
        console.log('✅ Form data populated:', {
          title: data.title,
          companyName: data.company?.name
        })

        // Parse and populate content blocks
        console.log('📄 Raw content from database:', data.content)
        console.log('📄 Content type:', typeof data.content)
        console.log('📄 Content length:', data.content?.length || 0)
        
        if (data.content) {
          try {
            const parsedContent = JSON.parse(data.content)
            console.log('Parsed content structure:', parsedContent)
            console.log('PageLayout exists:', !!parsedContent.pageLayout)
            console.log('Legacy Layout exists:', !!parsedContent.layout)
            console.log('Available blocks exists:', !!parsedContent.availableBlocks)
            
            // Handle new format with pageLayout structure (sections-based)
            if (parsedContent.pageLayout && parsedContent.pageLayout.sections) {
              console.log('🏗️ Loading pageLayout with sections:', parsedContent.pageLayout.sections.length)
              console.log('🏗️ PageLayout structure:', parsedContent.pageLayout)
              parsedContent.pageLayout.sections.forEach((section: Section, sectionIndex: number) => {
                console.log(`🏗️ Section ${sectionIndex + 1} has ${section.columns?.length || 0} columns`)
                section.columns.forEach((col: LayoutColumn, colIndex: number) => {
                  console.log(`🏗️ Section ${sectionIndex + 1}, Column ${colIndex + 1} has ${col.blocks?.length || 0} blocks:`, col.blocks)
                })
              })
              setPageLayout(parsedContent.pageLayout)
              console.log('✅ PageLayout with sections set successfully')
            }
            // Handle new format with pageLayout structure (columns-based)
            else if (parsedContent.pageLayout && parsedContent.pageLayout.columns) {
              console.log('🏗️ Loading pageLayout with columns:', parsedContent.pageLayout.columns.length)
              console.log('🏗️ PageLayout structure:', parsedContent.pageLayout)
              parsedContent.pageLayout.columns.forEach((col: LayoutColumn, index: number) => {
                console.log(`🏗️ Column ${index + 1} has ${col.blocks?.length || 0} blocks:`, col.blocks)
              })
              setPageLayout(parsedContent.pageLayout)
              console.log('✅ PageLayout with columns set successfully')
            }
            // Handle legacy format with layout structure
            else if (parsedContent.layout && parsedContent.layout.columns) {
              console.log('🏗️ Loading legacy layout with columns:', parsedContent.layout.columns.length)
              console.log('🏗️ Legacy layout structure:', parsedContent.layout)
              parsedContent.layout.columns.forEach((col: LayoutColumn, index: number) => {
                console.log(`🏗️ Column ${index + 1} has ${col.blocks?.length || 0} blocks:`, col.blocks)
              })
              // Convert legacy layout to new pageLayout format
              const convertedPageLayout: PageLayout = {
                id: parsedContent.layout.id || 'layout-1',
                type: parsedContent.layout.type || 1,
                sections: [{
                  id: 'section-1',
                  columns: parsedContent.layout.columns.map((col: LayoutColumn) => ({
                    ...col,
                    blocks: col.blocks.map((block: ContentBlock) => ({
                      ...block,
                      padding: block.padding || 16,
                      margin: block.margin || 8
                    }))
                  }))
                }]
              }
              setPageLayout(convertedPageLayout)
              console.log('✅ Legacy layout converted to pageLayout and set successfully')
            }
            // Handle legacy format - array of blocks
            else if (Array.isArray(parsedContent)) {
              console.log('🔄 Converting legacy format to new layout structure')
              console.log('🔄 Legacy blocks count:', parsedContent.length)
              const convertedLayout: PageLayout = {
                id: 'layout-1',
                sections: [{
                  id: 'section-1',
                  columns: [{
                    id: 'column-1',
                    blocks: parsedContent.map((block: ContentBlock) => ({
                      ...block,
                      padding: block.padding || 16,
                      margin: block.margin || 8
                    }))
                  }]
                }]
              }
              console.log('🔄 Converted layout:', convertedLayout)
              setPageLayout(convertedLayout)
              console.log('✅ Legacy layout converted and set')
            }
            // Handle old format with layoutBlocks
            else if (parsedContent.layoutBlocks && Array.isArray(parsedContent.layoutBlocks)) {
              console.log('🔄 Converting layoutBlocks format to new layout structure')
              const layoutBlocksLayout: PageLayout = {
                id: 'layout-1',
                sections: [{
                  id: 'section-1',
                  columns: [{
                    id: 'column-1',
                    blocks: parsedContent.layoutBlocks.map((block: ContentBlock) => ({
                      ...block,
                      columnId: 'column-1',
                      padding: block.padding || 16,
                      margin: block.margin || 8
                    }))
                  }]
                }]
              }
              setPageLayout(layoutBlocksLayout)
              console.log('✅ Converted', parsedContent.layoutBlocks.length, 'layoutBlocks to layout sections')
            }
            else {
              console.log('No recognizable content structure, using default layout')
              const noContentLayout: PageLayout = {
                id: 'layout-1',
                sections: [{
                  id: 'section-1',
                  columns: [{ id: 'column-1', blocks: [] }]
                }]
              }
              setPageLayout(noContentLayout)
            }
            
            // Handle availableBlocks and layoutBlocks - merge them for editing
            const allContentBlocks: ContentBlock[] = []
            
            // Collect blocks from availableBlocks
            if (parsedContent.availableBlocks && Array.isArray(parsedContent.availableBlocks)) {
              console.log('📦 Found availableBlocks:', parsedContent.availableBlocks.length)
              allContentBlocks.push(...parsedContent.availableBlocks)
            }
            
            // Collect blocks from layoutBlocks (legacy format)
            if (parsedContent.layoutBlocks && Array.isArray(parsedContent.layoutBlocks)) {
              console.log('📦 Found layoutBlocks:', parsedContent.layoutBlocks.length)
              allContentBlocks.push(...parsedContent.layoutBlocks)
            }
            
            // If we have content blocks but empty layout, move them to first section for editing
            if (allContentBlocks.length > 0) {
              let shouldMoveToLayout = false
              let totalBlocksInLayout = 0
              
              // Check pageLayout structure
              if (parsedContent.pageLayout?.sections) {
                totalBlocksInLayout = parsedContent.pageLayout.sections.reduce((total: number, section: Section) => 
                  total + section.columns.reduce((colTotal: number, col: LayoutColumn) => colTotal + (col.blocks?.length || 0), 0), 0)
                shouldMoveToLayout = totalBlocksInLayout === 0
              } else if (parsedContent.pageLayout?.columns) {
                totalBlocksInLayout = parsedContent.pageLayout.columns.reduce((total: number, col: LayoutColumn) => total + (col.blocks?.length || 0), 0)
                shouldMoveToLayout = totalBlocksInLayout === 0
              } else if (parsedContent.layout?.columns) {
                totalBlocksInLayout = parsedContent.layout.columns.reduce((total: number, col: LayoutColumn) => total + (col.blocks?.length || 0), 0)
                shouldMoveToLayout = totalBlocksInLayout === 0
              } else {
                shouldMoveToLayout = true
              }
              
              if (shouldMoveToLayout) {
                console.log('🔄 Moving', allContentBlocks.length, 'content blocks to first section for editing')
                const updatedLayout: PageLayout = {
                  id: 'layout-1',
                  sections: [{
                    id: 'section-1',
                    columns: [{
                      id: 'column-1',
                      blocks: allContentBlocks.map((block: ContentBlock) => ({ 
                        ...block, 
                        columnId: 'column-1',
                        padding: block.padding || 16,
                        margin: block.margin || 8
                      }))
                    }]
                  }]
                }
                setPageLayout(updatedLayout)
                setAvailableBlocks([]) // Clear availableBlocks since they're now in layout
                console.log('✅ Successfully moved all content blocks to pageLayout sections')
              } else {
                setAvailableBlocks(allContentBlocks)
              }
            } else {
              setAvailableBlocks([])
            }
          } catch (error) {
            console.error('Error parsing content JSON:', error)
            console.log('Treating content as plain text or legacy format')
            
            // Try to handle as legacy plain text content
            const legacyTextLayout: PageLayout = {
              id: 'layout-1',
              sections: [{
                id: 'section-1',
                columns: [{
                  id: 'column-1',
                  blocks: [{
                    id: 'legacy-text-1',
                    type: 'text',
                    content: data.content,
                    padding: 16,
                    margin: 8
                  }]
                }]
              }]
            }
            setPageLayout(legacyTextLayout)
            setAvailableBlocks([])
          }
        } else {
          console.log('❌ No content found in database, initializing with default layout')
          const defaultLayout: PageLayout = {
            id: 'layout-1',
            sections: [{
              id: 'section-1',
              columns: [{ id: 'column-1', blocks: [] }]
            }]
          }
          console.log('🔧 Setting default layout:', defaultLayout)
          setPageLayout(defaultLayout)
          setAvailableBlocks([])
          console.log('✅ Default layout set (no content case)')
        }

        // Set media data
        setMediaType(data.mediaType || MediaType.IMAGE_ONLY)
        setFeaturedVideo(data.featuredVideo || '')
        setFeaturedImage(data.featuredImage || '')
        
        console.log('🎬 Media type set:', data.mediaType || MediaType.IMAGE_ONLY)
        console.log('🎥 Featured video:', data.featuredVideo || 'none')
        console.log('🖼️ Featured image:', data.featuredImage || 'none')

      } else {
        console.error('❌ API Error - Case study not found, status:', response.status)
        const errorText = await response.text()
        console.error('❌ API Error response:', errorText)
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('❌ Network/Parse Error fetching case study:', error)
      router.push('/admin/dashboard')
    } finally {
      console.log('🏁 Fetch complete, setting loading to false')
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    if (params.id) {
      console.log('🚀 Starting fetchCaseStudy for ID:', params.id)
      fetchCaseStudy()
    }
  }, [params.id, fetchCaseStudy])

  // Debug current state
  useEffect(() => {
    console.log('🔍 Current State Debug:')
    console.log('  - Loading:', loading)
    console.log('  - Current layout:', pageLayout)
    console.log('  - Layout columns:', pageLayout.columns?.length || 0)
    console.log('  - Total blocks in all columns:', 
      pageLayout.columns?.reduce((total: number, col: LayoutColumn) => total + (col.blocks?.length || 0), 0) || 0
    )
    console.log('  - Available blocks:', availableBlocks.length)
    console.log('  - Form title:', formData.title)
  }, [loading, pageLayout, availableBlocks, formData.title])

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

  const changeLayout = (type: 1 | 2 | 3) => {
    const newColumns: LayoutColumn[] = []
    for (let i = 0; i < type; i++) {
      newColumns.push({
        id: `column-${i + 1}`,
        blocks: pageLayout.columns?.[i]?.blocks || []
      })
    }
    setPageLayout({
      id: generateId(),
      type,
      columns: newColumns
    })
  }

  const addColumn = () => {
    const columnsLength = pageLayout.columns?.length || 0
    const newColumnId = `column-${columnsLength + 1}`
    const newColumn: LayoutColumn = {
      id: newColumnId,
      blocks: []
    }
    setPageLayout(prev => {
      if (prev.columns) {
        return {
          ...prev,
          columns: [...prev.columns, newColumn]
        }
      }
      return prev
    })
  }

  const removeColumn = () => {
    if (pageLayout.columns && pageLayout.columns.length > 1) {
      const lastColumn = pageLayout.columns[pageLayout.columns.length - 1]
      // Move blocks from the last column to the first column
      if (lastColumn.blocks && lastColumn.blocks.length > 0) {
        setPageLayout(prev => {
          if (prev.columns) {
            return {
              ...prev,
              columns: [
                {
                  ...prev.columns[0],
                  blocks: [...(prev.columns[0].blocks || []), ...(lastColumn.blocks || [])]
                },
                ...prev.columns.slice(1, -1)
              ]
            }
          }
          return prev
        })
      } else {
        setPageLayout(prev => {
          if (prev.columns) {
            return {
              ...prev,
              columns: prev.columns.slice(0, -1)
            }
          }
          return prev
        })
      }
    }
  }

  // Drag and Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Don't do anything if we're dropping on the same item
    if (activeId === overId) return

    // Handle dropping palette components - don't interfere with over events
    if (activeId.startsWith('palette-')) return

    // Handle moving blocks between columns
    if (!activeId.startsWith('section-') && !overId.startsWith('section-')) {
      // Find the source column and block
      let sourceColumnId: string | undefined
      let sourceBlockIndex: number = -1
      let blockToMove: ContentBlock | undefined

      for (const section of pageLayout.sections || []) {
        for (const column of section.columns) {
          const blockIndex = column.blocks.findIndex(block => block.id === activeId)
          if (blockIndex !== -1) {
            sourceColumnId = column.id
            sourceBlockIndex = blockIndex
            blockToMove = column.blocks[blockIndex]
            break
          }
        }
        if (blockToMove) break
      }

      if (!sourceColumnId || !blockToMove) return

      // Determine target column
      let targetColumnId: string | undefined
      let targetBlockIndex: number = -1

      // If dropping on a column, add to end
      if (overId.startsWith('column-')) {
        targetColumnId = overId
        // Find target column to get the length for end position
        for (const section of pageLayout.sections || []) {
          const targetColumn = section.columns.find(col => col.id === targetColumnId)
          if (targetColumn) {
            targetBlockIndex = targetColumn.blocks.length
            break
          }
        }
      } else {
        // If dropping on a block, find its position
        for (const section of pageLayout.sections || []) {
          for (const column of section.columns) {
            const blockIndex = column.blocks.findIndex(block => block.id === overId)
            if (blockIndex !== -1) {
              targetColumnId = column.id
              targetBlockIndex = blockIndex
              break
            }
          }
          if (targetColumnId) break
        }
      }

      if (!targetColumnId) return

      // If moving within the same column, don't do anything in dragOver
      if (sourceColumnId === targetColumnId) return

      // Move block between different columns
      if (sourceColumnId !== targetColumnId) {
        setPageLayout(prev => ({
          ...prev,
          sections: prev.sections?.map(section => ({
            ...section,
            columns: section.columns.map(col => {
              if (col.id === sourceColumnId) {
                // Remove from source column
                return { 
                  ...col, 
                  blocks: col.blocks.filter(block => block.id !== activeId) 
                }
              }
              if (col.id === targetColumnId) {
                // Add to target column
                const newBlocks = [...col.blocks]
                newBlocks.splice(targetBlockIndex, 0, { ...blockToMove!, columnId: targetColumnId })
                return { ...col, blocks: newBlocks }
              }
              return col
            })
          }))
        }))
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Handle dropping palette components into columns
    if (activeId.startsWith('palette-')) {
      let targetColumnId: string | undefined

      if (overId.startsWith('column-')) {
        targetColumnId = overId
      } else {
        // If dropped on a block, find its column
        for (const section of pageLayout.sections || []) {
          for (const column of section.columns) {
            if (column.blocks.some(block => block.id === overId)) {
              targetColumnId = column.id
              break
            }
          }
          if (targetColumnId) break
        }
      }

      if (targetColumnId) {
        const componentType = activeId.replace('palette-', '') as 'text' | 'image' | 'video' | 'title'
        
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
      }
      return
    }

    // Handle section reordering
    if (activeId.startsWith('section-') && overId.startsWith('section-')) {
      const activeIndex = pageLayout.sections?.findIndex(section => section.id === activeId) ?? -1
      const overIndex = pageLayout.sections?.findIndex(section => section.id === overId) ?? -1
      
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        setPageLayout(prev => ({
          ...prev,
          sections: arrayMove(prev.sections || [], activeIndex, overIndex)
        }))
      }
      return
    }

    // Handle block reordering within the same column
    let sourceColumnId: string | undefined
    let sourceBlockIndex: number = -1
    let targetColumnId: string | undefined  
    let targetBlockIndex: number = -1

    // Find source position
    for (const section of pageLayout.sections || []) {
      for (const column of section.columns) {
        const blockIndex = column.blocks.findIndex(block => block.id === activeId)
        if (blockIndex !== -1) {
          sourceColumnId = column.id
          sourceBlockIndex = blockIndex
          break
        }
      }
      if (sourceColumnId) break
    }

    // Find target position
    if (overId.startsWith('column-')) {
      targetColumnId = overId
      // Add to end of column
      for (const section of pageLayout.sections || []) {
        const targetColumn = section.columns.find(col => col.id === targetColumnId)
        if (targetColumn) {
          targetBlockIndex = targetColumn.blocks.length
          break
        }
      }
    } else {
      // Find target block position
      for (const section of pageLayout.sections || []) {
        for (const column of section.columns) {
          const blockIndex = column.blocks.findIndex(block => block.id === overId)
          if (blockIndex !== -1) {
            targetColumnId = column.id
            targetBlockIndex = blockIndex
            break
          }
        }
        if (targetColumnId) break
      }
    }

    // If we have valid source and target positions
    if (sourceColumnId && targetColumnId && sourceBlockIndex !== -1 && targetBlockIndex !== -1) {
      // Handle reordering within the same column
      if (sourceColumnId === targetColumnId && sourceBlockIndex !== targetBlockIndex) {
        setPageLayout(prev => ({
          ...prev,
          sections: prev.sections?.map(section => ({
            ...section,
            columns: section.columns.map(col => {
              if (col.id === sourceColumnId) {
                const newBlocks = arrayMove(col.blocks, sourceBlockIndex, targetBlockIndex)
                return { ...col, blocks: newBlocks }
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
    try {
      const formData = new FormData()
      formData.append('featuredImage', file)
      
      const response = await fetch(`/api/case-studies/${params.id}/media`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.featuredImage) {
          setFeaturedImage(result.featuredImage)
          setFeaturedImageFile(null)
          console.log('✅ Featured image uploaded successfully:', result.featuredImage)
        }
      } else {
        console.error('❌ Failed to upload featured image')
      }
    } catch (error) {
      console.error('❌ Error uploading featured image:', error)
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
            pageLayout: pageLayout,
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
                          setFeaturedImageFile(file)
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
                        src={
                          featuredImageFile 
                            ? URL.createObjectURL(featuredImageFile)
                            : featuredImage
                        }
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
                                setFeaturedImageFile(file)
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
                    
                    {/* Upload button for new file */}
                    {featuredImageFile && (
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleFeaturedImageUpload(featuredImageFile)}
                          className="px-4 py-2 bg-[#0a4373] text-white rounded-lg hover:bg-[#083455] transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Image
                        </button>
                      </div>
                    )}
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
              onDragOver={handleDragOver}
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