'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown } from 'lucide-react'
import { FilterOptions } from '@/types'

interface CaseStudyFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  availableOptions: {
    industries: string[]
    sizes: string[]
    locations: string[]
    tags: string[]
  }
}

export default function CaseStudyFilters({ 
  filters, 
  onFiltersChange, 
  availableOptions 
}: CaseStudyFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const activeFiltersCount = Object.values(filters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value
  ).length

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const updateFilter = (key: keyof FilterOptions, value: string | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    updateFilter('tags', newTags.length > 0 ? newTags : undefined as any)
  }

  const FilterDropdown = ({ 
    title, 
    options, 
    value, 
    onChange 
  }: { 
    title: string
    options: string[]
    value?: string
    onChange: (value: string) => void
  }) => (
    <div className="relative">
      <button
        onClick={() => setActiveDropdown(activeDropdown === title ? null : title)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          value 
            ? 'bg-[#0a4373] text-white border-[#0a4373]' 
            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
        }`}
      >
        {value || title}
        <ChevronDown className={`w-4 h-4 transition-transform ${
          activeDropdown === title ? 'rotate-180' : ''
        }`} />
      </button>

      <AnimatePresence>
        {activeDropdown === title && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-full min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <div className="p-2">
              {value && (
                <button
                  onClick={() => onChange('')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded"
                >
                  Clear {title.toLowerCase()}
                </button>
              )}
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option)
                    setActiveDropdown(null)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 ${
                    value === option ? 'bg-[#0a4373]/10 text-[#0a4373] font-medium' : 'text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="mb-8">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-[#0a4373] text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="flex flex-wrap gap-4 items-center">
          {/* Industry Filter */}
          <FilterDropdown
            title="Industry"
            options={availableOptions.industries}
            value={filters.industry}
            onChange={(value) => updateFilter('industry', value || undefined as any)}
          />

          {/* Company Size Filter */}
          <FilterDropdown
            title="Company size"
            options={availableOptions.sizes}
            value={filters.size}
            onChange={(value) => updateFilter('size', value || undefined as any)}
          />

          {/* Location Filter */}
          <FilterDropdown
            title="Location"
            options={availableOptions.locations}
            value={filters.location}
            onChange={(value) => updateFilter('location', value || undefined as any)}
          />

          {/* Clear All Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>

        {/* Tags */}
        {availableOptions.tags.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {availableOptions.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.tags?.includes(tag)
                      ? 'bg-[#0a4373] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.industry && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0a4373]/10 text-[#0a4373] rounded-full text-sm">
              Industry: {filters.industry}
              <button
                onClick={() => updateFilter('industry', undefined as any)}
                className="ml-1 hover:bg-[#0a4373]/20 rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.size && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0a4373]/10 text-[#0a4373] rounded-full text-sm">
              Size: {filters.size}
              <button
                onClick={() => updateFilter('size', undefined as any)}
                className="ml-1 hover:bg-[#0a4373]/20 rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0a4373]/10 text-[#0a4373] rounded-full text-sm">
              Location: {filters.location}
              <button
                onClick={() => updateFilter('location', undefined as any)}
                className="ml-1 hover:bg-[#0a4373]/20 rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#0a4373]/10 text-[#0a4373] rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-1 hover:bg-[#0a4373]/20 rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}