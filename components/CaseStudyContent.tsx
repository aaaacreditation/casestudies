'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Users, Share2, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { CaseStudy } from '@/types'
import dynamic from 'next/dynamic'

// Dynamically import the markdown viewer to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => ({ default: mod.default.Markdown })),
  { ssr: false }
)

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

// Helper function to check if URL is a YouTube URL
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

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

// Component to render content blocks
function ContentBlocks({ content }: { content: string }) {
  let structuredContent: { 
    pageLayout?: PageLayout; 
    layout?: PageLayout; 
    availableBlocks?: ContentBlock[] 
  } = {}
  
  try {
    structuredContent = JSON.parse(content || '{}')
    // Debug log to see the content structure
    console.log('Parsed content structure:', structuredContent)
  } catch (error) {
    console.error('Error parsing content:', error)
    // Fallback to treating content as markdown
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <MDEditor 
          source={content} 
          style={{ 
            backgroundColor: 'transparent',
            color: '#334155'
          }}
        />
      </div>
    )
  }

  // Handle legacy content (array of blocks)
  if (Array.isArray(structuredContent)) {
    const contentBlocks = structuredContent as ContentBlock[]
    return (
      <div className="space-y-3">
        {contentBlocks.map((block, index) => (
          <ContentBlockRenderer key={block.id} block={block} index={index} />
        ))}
      </div>
    )
  }

  // Get layout from either pageLayout (new structure) or layout (legacy)
  const pageLayout = structuredContent.pageLayout || structuredContent.layout
  const { availableBlocks } = structuredContent

  // Handle new section-based structure
  if (pageLayout?.sections && pageLayout.sections.length > 0) {
    return (
      <div className="space-y-6">
        {pageLayout.sections.map((section, sectionIndex) => (
          <div key={section.id} className="section">
            <div 
              className={`grid gap-6 ${
                section.columns.length === 1 ? 'grid-cols-1' :
                section.columns.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                section.columns.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                `grid-cols-1 md:grid-cols-${Math.min(section.columns.length, 4)}`
              }`}
              style={{
                gridTemplateColumns: section.columns.length > 4 
                  ? `repeat(${section.columns.length}, 1fr)` 
                  : undefined
              }}
            >
              {section.columns.map((column, columnIndex) => (
                <div 
                  key={column.id} 
                  className="space-y-3"
                  style={{ 
                    width: column.width ? `${column.width}%` : undefined 
                  }}
                >
                  {column.blocks.map((block, blockIndex) => (
                    <ContentBlockRenderer 
                      key={block.id} 
                      block={block} 
                      index={sectionIndex * 100 + columnIndex * 10 + blockIndex} 
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Render Available Blocks (if any) */}
        {availableBlocks && availableBlocks.length > 0 && (
          <div className="mt-8 space-y-3">
            {availableBlocks.map((block, index) => (
              <ContentBlockRenderer key={block.id} block={block} index={index + 1000} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Handle legacy column-based structure
  if (pageLayout?.columns && pageLayout.columns.length > 0) {
    const hasContent = pageLayout.columns.some(col => col.blocks.length > 0)
    
    if (!hasContent) {
      // Check if there are available blocks but no layout - show them without warning for public view
      if (availableBlocks && availableBlocks.length > 0) {
        return (
          <div className="space-y-3">
            {availableBlocks.map((block, index) => (
              <ContentBlockRenderer key={block.id} block={block} index={index} />
            ))}
          </div>
        )
      }
      
      // Only show "no content" if there's truly no content at all
      return null
    }

    return (
      <>
        {/* Render Layout - maintaining the same structure as editor but with clean display */}
        <div className={`grid gap-6 ${
          pageLayout.type === 1 || pageLayout.columns.length === 1 ? 'grid-cols-1' :
          pageLayout.type === 2 || pageLayout.columns.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {pageLayout.columns.map((column, columnIndex) => (
            <div 
              key={column.id} 
              className="space-y-3"
            >
              {/* Render blocks in the same order as they appear in the editor */}
              {column.blocks.map((block, blockIndex) => (
                <ContentBlockRenderer 
                  key={block.id} 
                  block={block} 
                  index={columnIndex * 10 + blockIndex} 
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Render Available Blocks (if any) */}
        {availableBlocks && availableBlocks.length > 0 && (
          <div className="mt-8 space-y-3">
            {availableBlocks.map((block, index) => (
              <ContentBlockRenderer key={block.id} block={block} index={index + 100} />
            ))}
          </div>
        )}
      </>
    )
  }

  // Fallback: show available blocks if no layout structure
  if (availableBlocks && availableBlocks.length > 0) {
    return (
      <div className="space-y-3">
        {availableBlocks.map((block, index) => (
          <ContentBlockRenderer key={block.id} block={block} index={index} />
        ))}
      </div>
    )
  }
  
  // No content at all
  return null
}

// Component to render individual content blocks as clean article content
function ContentBlockRenderer({ block, index }: { block: ContentBlock; index: number }) {
  const customPadding = block.padding || 16
  const customMargin = block.margin || 8
  
  // Use custom spacing if provided, otherwise use minimal default spacing
  const hasCustomSpacing = (block.padding && block.padding !== 16) || (block.margin && block.margin !== 8)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: (index % 10) * 0.1 }}
      style={{ 
        paddingTop: customPadding > 0 ? `${customPadding}px` : undefined, 
        paddingBottom: customPadding > 0 ? `${customPadding}px` : undefined,
        marginTop: customMargin > 0 ? `${customMargin}px` : undefined,
        marginBottom: customMargin > 0 ? `${customMargin}px` : undefined
      }}
    >
      {block.type === 'title' && block.content && (
        <>
          {block.titleLevel === 1 && <h1 className={`text-4xl font-bold text-slate-900 leading-tight ${hasCustomSpacing ? '' : 'mb-2'}`}>{block.content}</h1>}
          {block.titleLevel === 2 && <h2 className={`text-3xl font-semibold text-slate-900 leading-tight ${hasCustomSpacing ? '' : 'mb-2'}`}>{block.content}</h2>}
          {block.titleLevel === 3 && <h3 className={`text-2xl font-medium text-slate-900 leading-tight ${hasCustomSpacing ? '' : 'mb-2'}`}>{block.content}</h3>}
          {block.titleLevel === 4 && <h4 className={`text-xl font-medium text-slate-900 leading-tight ${hasCustomSpacing ? '' : 'mb-1'}`}>{block.content}</h4>}
          {block.titleLevel === 5 && <h5 className={`text-lg font-medium text-slate-900 leading-tight ${hasCustomSpacing ? '' : 'mb-1'}`}>{block.content}</h5>}
          {block.titleLevel === 6 && <h6 className={`text-base font-medium text-slate-900 leading-tight ${hasCustomSpacing ? '' : 'mb-1'}`}>{block.content}</h6>}
        </>
      )}

      {block.type === 'text' && block.content && (
        <div className={`prose prose-lg max-w-none text-slate-700 leading-relaxed ${hasCustomSpacing ? '' : 'mb-2'}`}>
          <MDEditor 
            source={block.content} 
            style={{ 
              backgroundColor: 'transparent',
              color: '#374151'
            }}
          />
        </div>
      )}
      
      {block.type === 'image' && (block.fileUrl || block.url) && (
        <div className={hasCustomSpacing ? '' : 'mb-4'}>
          <div className="relative w-full">
            <Image
              src={block.fileUrl || block.url || ''}
              alt={block.caption || 'Content image'}
              width={1200}
              height={800}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
              style={{ maxHeight: '500px' }}
              priority={false}
            />
          </div>
          {block.caption && (
            <div className="mt-2 text-sm text-slate-500 text-center italic">
              {block.caption}
            </div>
          )}
        </div>
      )}
      
      {block.type === 'video' && (
        <div className={hasCustomSpacing ? '' : 'mb-4'}>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-slate-100">
            {block.url && isYouTubeUrl(block.url) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(block.url)}`}
                className="w-full h-full"
                allowFullScreen
                title="YouTube video player"
              />
            ) : block.fileUrl ? (
              <video
                src={block.fileUrl}
                controls
                className="w-full h-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            ) : null}
          </div>
          {block.caption && (
            <div className="mt-2 text-sm text-slate-500 text-center italic">
              {block.caption}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

interface CaseStudyContentProps {
  caseStudy: CaseStudy
}

export default function CaseStudyContent({ caseStudy }: CaseStudyContentProps) {
  return (
    <>
      {/* Back Navigation */}
      <div className="bg-slate-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#0a4373] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Case Studies
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Company Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-between mb-8"
              >
                <div className="flex items-center gap-4">
                  {caseStudy.company.logo ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-200">
                      <Image
                        src={caseStudy.company.logo}
                        alt={caseStudy.company.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0a4373] to-[#083455] flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {caseStudy.company.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {caseStudy.company.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {caseStudy.company.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {caseStudy.company.scope}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share Button */}
                <button className="flex items-center gap-2 text-sm text-[#0a4373] hover:text-[#083455] transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </motion.div>

              {/* Title and Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                  {caseStudy.title}
                </h1>
                {caseStudy.subtitle && (
                  <p className="text-xl text-slate-600 leading-relaxed">
                    {caseStudy.subtitle}
                  </p>
                )}
              </motion.div>



              {/* Featured Media */}
              {(caseStudy.featuredImage || caseStudy.featuredVideo) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mb-12"
                >
                  {caseStudy.mediaType === 'VIDEO_ONLY' && caseStudy.featuredVideo ? (
                    <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg">
                      {isYouTubeUrl(caseStudy.featuredVideo) ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeVideoId(caseStudy.featuredVideo)}`}
                          className="w-full h-full"
                          allowFullScreen
                          title="YouTube video player"
                        />
                      ) : (
                        <video
                          src={caseStudy.featuredVideo}
                          controls
                          className="w-full h-full object-cover"
                          poster={caseStudy.featuredImage}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  ) : caseStudy.mediaType === 'IMAGE_AND_VIDEO' ? (
                    <div className="space-y-6">
                      {caseStudy.featuredImage && (
                        <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-lg">
                          <Image
                            src={caseStudy.featuredImage}
                            alt={caseStudy.title}
                            width={1200}
                            height={675}
                            className="w-full h-auto object-cover"
                            style={{ maxHeight: '500px', minHeight: '300px' }}
                            priority={true}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                      )}
                      {caseStudy.featuredVideo && (
                        <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg">
                          {isYouTubeUrl(caseStudy.featuredVideo) ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${getYouTubeVideoId(caseStudy.featuredVideo)}`}
                              className="w-full h-full"
                              allowFullScreen
                              title="YouTube video player"
                            />
                          ) : (
                            <video
                              src={caseStudy.featuredVideo}
                              controls
                              className="w-full h-full object-cover"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      )}
                    </div>
                  ) : caseStudy.featuredImage ? (
                    <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={caseStudy.featuredImage}
                        alt={caseStudy.title}
                        width={1200}
                        height={675}
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: '500px', minHeight: '300px' }}
                        priority={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  ) : null}
                </motion.div>
              )}

              {/* Content Sections */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="prose prose-lg max-w-none"
              >
                {/* Dynamic Content Blocks */}
                <div className="space-y-8 mb-8">
                  <ContentBlocks content={caseStudy.content} />
                </div>

                {/* Metrics Section */}
                {caseStudy.metrics && (
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-green-900 mb-6">Key Results</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(caseStudy.metrics).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-xl p-4 border border-green-200">
                          <div className="text-2xl font-bold text-green-600 mb-1">{value}</div>
                          <div className="text-sm text-green-700 capitalize">{key.replace('_', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="sticky top-8 space-y-8"
              >
                {/* Company Details */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Company Details</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Industry</div>
                      <div className="text-slate-900">{caseStudy.company.industry}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Location</div>
                      <div className="text-slate-900">{caseStudy.company.location}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Title Scope</div>
                      <div className="text-slate-900">{caseStudy.company.scope}</div>
                    </div>
                    {caseStudy.company.website && (
                      <div>
                        <div className="text-sm font-medium text-slate-600 mb-1">Website</div>
                        <a 
                          href={caseStudy.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0a4373] hover:text-[#083455] transition-colors inline-flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>



                {/* CTA */}
                <div className="bg-gradient-to-br from-[#0a4373] to-[#083455] rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-bold mb-3">Ready to get started?</h3>
                  <p className="text-blue-100 mb-4 text-sm">
                    See how our platform can transform your customer insights process.
                  </p>
                  <button className="w-full bg-white text-[#0a4373] font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                    Get Started Today
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}