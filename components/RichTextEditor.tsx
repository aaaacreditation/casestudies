'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
)

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter content here...",
  required = false 
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-64 border border-slate-200 rounded-lg bg-slate-50 animate-pulse flex items-center justify-center">
        <p className="text-slate-500">Loading editor...</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview="edit"
        hideToolbar={false}
        visibleDragbar={false}
        textareaProps={{
          placeholder,
          required,
          style: {
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'inherit',
          },
        }}
        height={300}
        data-color-mode="light"
      />
      <style jsx global>{`
        .w-md-editor {
          background-color: white;
        }
        .w-md-editor-text-pre, 
        .w-md-editor-text-input, 
        .w-md-editor-text {
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #334155 !important;
        }
        .w-md-editor.w-md-editor-focus {
          border-color: #0a4373 !important;
          box-shadow: 0 0 0 2px rgba(10, 67, 115, 0.2) !important;
        }
        .w-md-editor-toolbar {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .w-md-editor-toolbar button {
          color: #64748b;
        }
        .w-md-editor-toolbar button:hover {
          color: #0a4373;
          background-color: #e2e8f0;
        }
      `}</style>
    </div>
  )
}
