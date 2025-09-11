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
                <div className="text-xs text-slate-500 mb-2">Preview:</div>
                {block.titleLevel === 1 && <h1 className="text-3xl font-bold text-slate-800">{block.content}</h1>}
                {block.titleLevel === 2 && <h2 className="text-2xl font-semibold text-slate-800">{block.content}</h2>}
                {block.titleLevel === 3 && <h3 className="text-xl font-medium text-slate-800">{block.content}</h3>}
                {block.titleLevel === 4 && <h4 className="text-lg font-medium text-slate-800">{block.content}</h4>}
                {block.titleLevel === 5 && <h5 className="text-base font-medium text-slate-800">{block.content}</h5>}
                {block.titleLevel === 6 && <h6 className="text-sm font-medium text-slate-800">{block.content}</h6>}
              </div>
            )}
          </div>
        )}

        {block.type === 'text' && (
          <textarea
            value={block.content || ''}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="Click to edit text content..."
            className="w-full min-h-[100px] p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none resize-vertical"
            style={{ fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.5' }}
          />
        )}
        
        {block.type === 'image' && (
          <>
            {!block.file ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
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
                <Youtube className="w-4 h-4 inline mr-1" />
                YouTube URL
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={block.url || ''}
                onChange={(e) => onUpdate(block.id, { url: e.target.value, file: undefined })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
              />
            </div>
            
            <div className="text-center text-sm text-slate-500">OR</div>
            
            {!block.file && !block.url ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                <Video className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                <input
                  type="file"
                  accept="video/*"
                  value=""
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onUpdate(block.id, { file, url: undefined })
                  }}
                  className="hidden"
                  id={`video-${block.id}`}
                />
                <label
                  htmlFor={`video-${block.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </label>
              </div>
            ) : block.file ? (
              <div className="relative">
                <video
                  src={URL.createObjectURL(block.file)}
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                />
                <button
                  type="button"
                  onClick={() => onUpdate(block.id, { file: undefined })}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : null}
            
            <input
              type="text"
              placeholder="Video caption (optional)"
              value={block.caption || ''}
              onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
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
  onAddBlock: (columnId: string, type: 'text' | 'image' | 'video' | 'title') => void
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ column, blocks, onUpdate, onDelete, onAddBlock }) => {
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
      className={`flex-1 min-h-[400px] border-2 border-dashed rounded-lg p-4 transition-colors ${
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
      
      {/* Click-to-Add Component Buttons */}
      <div className="mt-4 p-3 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50">
        <p className="text-xs text-slate-500 mb-2 text-center">Click to add components:</p>
        <div className="flex flex-wrap gap-1 justify-center">
          <button
            type="button"
            onClick={() => onAddBlock(column.id, 'title')}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:border-[#0a4373] hover:text-[#0a4373] transition-colors"
          >
            <Type className="w-3 h-3" />
            Title
          </button>
          <button
            type="button"
            onClick={() => onAddBlock(column.id, 'text')}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:border-[#0a4373] hover:text-[#0a4373] transition-colors"
          >
            <FileText className="w-3 h-3" />
            Text
          </button>
          <button
            type="button"
            onClick={() => onAddBlock(column.id, 'image')}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:border-[#0a4373] hover:text-[#0a4373] transition-colors"
          >
            <ImageIcon className="w-3 h-3" />
            Image
          </button>
          <button
            type="button"
            onClick={() => onAddBlock(column.id, 'video')}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:border-[#0a4373] hover:text-[#0a4373] transition-colors"
          >
            <Video className="w-3 h-3" />
            Video
          </button>
        </div>
      </div>
    </div>
  )
}

// Available Blocks Container
interface AvailableBlocksContainerProps {
  blocks: ContentBlock[]
  onUpdate: (id: string, updates: Partial<ContentBlock>) => void
  onDelete: (id: string) => void
}

const AvailableBlocksContainer: React.FC<AvailableBlocksContainerProps> = ({ blocks, onUpdate, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'available',
  })

  return (
    <div
      ref={setNodeRef}
      className={`bg-white border border-slate-200 rounded-lg p-4 transition-colors ${
        isOver ? 'border-[#0a4373] bg-[#0a4373]/5' : ''
      }`}
    >
      <h3 className="text-sm font-medium text-slate-700 mb-3">
        Available Blocks ({blocks.length})
      </h3>
      {blocks.length > 0 ? (
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
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
      ) : (
        <div className="text-center py-8 text-slate-500">
          <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm">No content blocks yet. Add blocks using the buttons above.</p>
        </div>
      )}
    </div>
  )
}

interface BlockButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

const BlockButton: React.FC<BlockButtonProps> = ({ icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-[#0a4373] hover:bg-[#0a4373]/5 transition-colors text-sm font-medium text-slate-700 hover:text-[#0a4373]"
  >
    {icon}
    {label}
  </button>
)

interface TextBlockProps {
  block: ContentBlock
  onUpdate: (id: string, updates: Partial<ContentBlock>) => void
  onDelete: (id: string) => void
}

const TextBlock: React.FC<TextBlockProps> = ({ block, onUpdate, onDelete }) => (
  <div className="border border-slate-200 rounded-lg p-4 bg-white">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-slate-400" />
        <Type className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-slate-700">Text Block</span>
      </div>
      <button
        type="button"
        onClick={() => onDelete(block.id)}
        className="text-red-500 hover:text-red-700 p-1"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    <RichTextEditor
      value={block.content || ''}
      onChange={(value) => onUpdate(block.id, { content: value })}
      placeholder="Enter your text content..."
    />
  </div>
)

interface ImageBlockProps {
  block: ContentBlock
  onUpdate: (id: string, updates: Partial<ContentBlock>) => void
  onDelete: (id: string) => void
}

const ImageBlock: React.FC<ImageBlockProps> = ({ block, onUpdate, onDelete }) => (
  <div className="border border-slate-200 rounded-lg p-4 bg-white">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-slate-400" />
        <ImageIcon className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-slate-700">Image Block</span>
      </div>
      <button
        type="button"
        onClick={() => onDelete(block.id)}
        className="text-red-500 hover:text-red-700 p-1"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    
    {!block.file ? (
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
        <ImageIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
        <input
          type="file"
          accept="image/*"
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
  </div>
)

interface VideoBlockProps {
  block: ContentBlock
  onUpdate: (id: string, updates: Partial<ContentBlock>) => void
  onDelete: (id: string) => void
}

const VideoBlock: React.FC<VideoBlockProps> = ({ block, onUpdate, onDelete }) => (
  <div className="border border-slate-200 rounded-lg p-4 bg-white">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-slate-400" />
        <Video className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium text-slate-700">Video Block</span>
      </div>
      <button
        type="button"
        onClick={() => onDelete(block.id)}
        className="text-red-500 hover:text-red-700 p-1"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    
    <div className="space-y-3">
      {/* YouTube URL Option */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          <Youtube className="w-4 h-4 inline mr-1" />
          YouTube URL
        </label>
        <input
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={block.url || ''}
          onChange={(e) => onUpdate(block.id, { url: e.target.value, file: undefined })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
        />
      </div>
      
      <div className="text-center text-sm text-slate-500">OR</div>
      
      {/* Video File Upload */}
      {!block.file && !block.url ? (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
          <Video className="mx-auto h-6 w-6 text-slate-400 mb-2" />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpdate(block.id, { file, url: undefined })
            }}
            className="hidden"
            id={`video-${block.id}`}
          />
          <label
            htmlFor={`video-${block.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </label>
        </div>
      ) : block.file ? (
        <div className="relative">
          <video
            src={URL.createObjectURL(block.file)}
            className="w-full h-48 object-cover rounded-lg"
            controls
          />
          <button
            type="button"
            onClick={() => onUpdate(block.id, { file: undefined })}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : null}
      
      {/* Caption for both YouTube and uploaded videos */}
      <input
        type="text"
        placeholder="Video caption (optional)"
        value={block.caption || ''}
        onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none text-sm"
      />
    </div>
  </div>
)

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
    metrics: '',
    published: false,
    featured: false
  })
  
  // Layout and content state
  const [currentLayout, setCurrentLayout] = useState<Layout>({
    id: '1',
    type: 1,
    columns: [{ id: 'col-1', blocks: [] }]
  })
  const [availableBlocks, setAvailableBlocks] = useState<ContentBlock[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // Layout Management
  const changeLayout = (layoutType: 1 | 2 | 3) => {
    const columns: LayoutColumn[] = []
    for (let i = 0; i < layoutType; i++) {
      columns.push({ id: `col-${i + 1}`, blocks: [] })
    }
    
    // Move all existing blocks to available blocks
    const allBlocks = currentLayout.columns.flatMap(col => col.blocks)
    setAvailableBlocks(prev => [...prev, ...allBlocks])
    
    setCurrentLayout({
      id: layoutType.toString(),
      type: layoutType,
      columns
    })
  }

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

  // Add block directly to a specific column
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

  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    // Update in available blocks
    setAvailableBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ))
    
    // Update in layout columns
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
    // Remove from available blocks
    setAvailableBlocks(prev => prev.filter(block => block.id !== id))
    
    // Remove from layout columns
    setCurrentLayout(prev => ({
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        blocks: col.blocks.filter(block => block.id !== id)
      }))
    }))
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

    // Find the containers
    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId) || overId

    if (!activeContainer || !overContainer) return
    if (activeContainer === overContainer) return

    // Don't do anything in dragOver - we'll handle it in dragEnd
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

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId) || overId

    if (!activeContainer || !overContainer) return

    const activeBlock = getBlock(activeId)
    if (!activeBlock) return

    if (activeContainer === overContainer) {
      // Reordering within the same container
      if (activeContainer === 'available') {
        // Reordering in available blocks
        setAvailableBlocks(prev => {
          const activeIndex = prev.findIndex(block => block.id === activeId)
          const overIndex = prev.findIndex(block => block.id === overId)
          
          const newBlocks = [...prev]
          const [movedBlock] = newBlocks.splice(activeIndex, 1)
          newBlocks.splice(overIndex, 0, movedBlock)
          
          return newBlocks
        })
      } else {
        // Reordering within a column
        setCurrentLayout(prev => ({
          ...prev,
          columns: prev.columns.map(col => {
            if (col.id === activeContainer) {
              const activeIndex = col.blocks.findIndex(block => block.id === activeId)
              const overIndex = col.blocks.findIndex(block => block.id === overId)

              const newBlocks = [...col.blocks]
              const [movedBlock] = newBlocks.splice(activeIndex, 1)
              newBlocks.splice(overIndex, 0, movedBlock)

              return {
                ...col,
                blocks: newBlocks
              }
            }
            return col
          })
        }))
      }
    } else {
      // Moving between different containers
      
      // Moving from available blocks to a column
      if (activeContainer === 'available' && overContainer !== 'available') {
        setAvailableBlocks(prev => prev.filter(block => block.id !== activeId))
        
        setCurrentLayout(prev => ({
          ...prev,
          columns: prev.columns.map(col => {
            if (col.id === overContainer) {
              return {
                ...col,
                blocks: [...col.blocks, { ...activeBlock, columnId: overContainer }]
              }
            }
            return col
          })
        }))
      }
      
      // Moving from a column to available blocks
      else if (activeContainer !== 'available' && overContainer === 'available') {
        setCurrentLayout(prev => ({
          ...prev,
          columns: prev.columns.map(col => {
            if (col.id === activeContainer) {
              return {
                ...col,
                blocks: col.blocks.filter(block => block.id !== activeId)
              }
            }
            return col
          })
        }))
        
        setAvailableBlocks(prev => [...prev, { ...activeBlock, columnId: undefined }])
      }
      
      // Moving between columns
      else if (activeContainer !== 'available' && overContainer !== 'available') {
        setCurrentLayout(prev => ({
          ...prev,
          columns: prev.columns.map(col => {
            if (col.id === activeContainer) {
              return {
                ...col,
                blocks: col.blocks.filter(block => block.id !== activeId)
              }
            }
            if (col.id === overContainer) {
              return {
                ...col,
                blocks: [...col.blocks, { ...activeBlock, columnId: overContainer }]
              }
            }
            return col
          })
        }))
      }
    }
  }

  // Helper functions
  const findContainer = (id: string): string | null => {
    if (availableBlocks.some(block => block.id === id)) return 'available'
    
    for (const column of currentLayout.columns) {
      if (column.blocks.some(block => block.id === id)) return column.id
    }
    return null
  }

  const getBlockIndex = (id: string, containerId: string): number => {
    if (containerId === 'available') {
      return availableBlocks.findIndex(block => block.id === id)
    }
    
    const column = currentLayout.columns.find(col => col.id === containerId)
    return column ? column.blocks.findIndex(block => block.id === id) : -1
  }

  const getBlock = (id: string): ContentBlock | null => {
    // Check available blocks first
    const availableBlock = availableBlocks.find(block => block.id === id)
    if (availableBlock) return availableBlock

    // Check layout columns
    for (const column of currentLayout.columns) {
      const block = column.blocks.find(block => block.id === id)
      if (block) return block
    }
    
    return null
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'featuredImage' | 'companyLogo') => {
    const files = e.target.files
    if (!files) return

    if (type === 'featuredImage') {
      setFeaturedImage(files[0])
    } else if (type === 'companyLogo') {
      setCompanyLogo(files[0])
    }
  }

  const removeFile = (type: 'featuredImage' | 'companyLogo') => {
    if (type === 'featuredImage') {
      setFeaturedImage(null)
    } else if (type === 'companyLogo') {
      setCompanyLogo(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    try {
      // Get all blocks from layout and available blocks
      const allBlocks = [
        ...availableBlocks,
        ...currentLayout.columns.flatMap(col => col.blocks)
      ]

      // Convert layout and blocks to structured content
      const structuredContent = {
        layout: currentLayout,
        availableBlocks: availableBlocks.map(block => ({
          id: block.id,
          type: block.type,
          content: block.content,
          url: block.url,
          caption: block.caption,
          titleLevel: block.titleLevel
        }))
      }

      // First create the case study
      const caseStudyData = {
        ...formData,
        content: JSON.stringify(structuredContent), // Store layout as JSON
        tags: [], // Empty tags array since we removed the tags field
        metrics: formData.metrics ? JSON.parse(formData.metrics) : null,
        mediaType: 'IMAGE_ONLY' // Default, will be updated based on content blocks
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

        // Prepare form data for file uploads
        const uploadFormData = new FormData()
        
        if (featuredImage) {
          uploadFormData.append('featuredImage', featuredImage)
        }
        
        if (companyLogo) {
          uploadFormData.append('companyLogo', companyLogo)
        }

        // Add content block files
        allBlocks.forEach((block, index) => {
          if (block.file) {
            uploadFormData.append(`contentBlock_${index}`, block.file)
            uploadFormData.append(`contentBlockId_${index}`, block.id)
          }
        })

        // Upload files if any exist
        if (featuredImage || companyLogo || allBlocks.some(block => block.file)) {
          const uploadResponse = await fetch(`/api/case-studies/${caseStudy.id}/media`, {
            method: 'POST',
            body: uploadFormData
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
              <span className="text-sm text-slate-500">Content Builder</span>
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
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="space-y-6">
                        {/* Content Builder Header */}
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-slate-700">
                            Content Builder *
                          </label>
                          <div className="flex gap-2 flex-wrap">
                            <BlockButton
                              icon={<Type className="w-4 h-4" />}
                              label="Add Title"
                              onClick={() => addContentBlock('title')}
                            />
                            <BlockButton
                              icon={<FileText className="w-4 h-4" />}
                              label="Add Text"
                              onClick={() => addContentBlock('text')}
                            />
                            <BlockButton
                              icon={<ImageIcon className="w-4 h-4" />}
                              label="Add Image"
                              onClick={() => addContentBlock('image')}
                            />
                            <BlockButton
                              icon={<Video className="w-4 h-4" />}
                              label="Add Video"
                              onClick={() => addContentBlock('video')}
                            />
                          </div>
                        </div>

                        {/* Layout Selector */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-700">Choose Layout</h3>
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
                        <AvailableBlocksContainer 
                          blocks={availableBlocks}
                          onUpdate={updateContentBlock}
                          onDelete={deleteContentBlock}
                        />

                        {/* Layout Grid */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-slate-700 mb-3">Layout Preview</h3>
                          <SortableContext 
                            items={currentLayout.columns.map(col => `column-draggable-${col.id}`)} 
                            strategy={horizontalListSortingStrategy}
                          >
                            <div className={`flex gap-4 ${
                              currentLayout.type === 1 ? 'flex-col' : 'flex-row'
                            }`}>
                              {currentLayout.columns.map((column) => (
                                <div 
                                  key={column.id} 
                                  className={`${
                                    currentLayout.type === 1 ? 'w-full' :
                                    currentLayout.type === 2 ? 'flex-1 min-w-0' : 'flex-1 min-w-0'
                                  }`}
                                >
                                  <DroppableColumn
                                    column={column}
                                    blocks={column.blocks}
                                    onUpdate={updateContentBlock}
                                    onDelete={deleteContentBlock}
                                    onAddBlock={addBlockToColumn}
                                  />
                                </div>
                              ))}
                            </div>
                          </SortableContext>
                        </div>

                        {/* Empty State */}
                        {availableBlocks.length === 0 && currentLayout.columns.every(col => col.blocks.length === 0) && (
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                            <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">Start Building Your Content</h3>
                            <p className="text-slate-500 mb-4">Add content blocks and drag them into your layout</p>
                            <div className="flex justify-center gap-2">
                              <BlockButton
                                icon={<Type className="w-4 h-4" />}
                                label="Add Title"
                                onClick={() => addContentBlock('title')}
                              />
                              <BlockButton
                                icon={<FileText className="w-4 h-4" />}
                                label="Add Text"
                                onClick={() => addContentBlock('text')}
                              />
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
                                <span className="text-sm font-medium text-slate-700">Dragging...</span>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
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

              {/* Featured Image & Company Logo */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Media Assets</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Company Logo Upload */}
                  <div>
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
                          className="w-full h-32 object-contain rounded-lg border border-slate-200 bg-white p-4"
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

                  {/* Featured Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Featured Image (Optional)
                    </label>
                    {!featuredImage ? (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <ImageIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <div className="space-y-2">
                          <p className="text-slate-600 text-sm">Upload featured image</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'featuredImage')}
                            className="hidden"
                            id="featured-image"
                          />
                          <label
                            htmlFor="featured-image"
                            className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(featuredImage)}
                          alt="Featured"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile('featuredImage')}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="mt-2 text-sm text-slate-600">{featuredImage.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Additional Information</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
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
              <div className="flex justify-end">
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
                    disabled={loading || (availableBlocks.length === 0 && currentLayout.columns.every(col => col.blocks.length === 0))}
                    className="flex items-center gap-2 bg-[#0a4373] text-white px-4 py-2 rounded-lg hover:bg-[#083455] transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Create Case Study</span>
                      </>
                    )}
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
