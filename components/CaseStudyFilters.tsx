'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown } from 'lucide-react'
import { FilterOptions } from '@/types'

interface CaseStudyFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  availableOptions: {
    countries: string[]
  }
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function CaseStudyFilters({ 
  filters, 
  onFiltersChange, 
  availableOptions,
  searchQuery,
  onSearchChange
}: CaseStudyFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const activeFiltersCount = Object.values(filters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value
  ).length

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const updateFilter = (key: keyof FilterOptions, value: string | string[] | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
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
          <span className="text-sm font-medium text-gray-700">Filters By:</span>
          
          {/* Type Filter */}
          <FilterDropdown
            title="Type"
            options={['Healthcare', 'Training/Education', 'Laboratories', 'Certification bodies', 'Inspection Bodies']}
            value={filters.type}
            onChange={(value) => updateFilter('type', value || undefined)}
          />

          {/* Country Filter */}
          <FilterDropdown
            title="Country"
            options={availableOptions.countries}
            value={filters.country}
            onChange={(value) => updateFilter('country', value || undefined)}
          />

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a4373]/20 focus:border-[#0a4373] outline-none transition-all text-sm w-48"
            />
          </div>

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
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.type && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0a4373]/10 text-[#0a4373] rounded-full text-sm">
              Type: {filters.type}
              <button
                onClick={() => updateFilter('type', undefined)}
                className="ml-1 hover:bg-[#0a4373]/20 rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.country && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0a4373]/10 text-[#0a4373] rounded-full text-sm">
              Country: {filters.country}
              <button
                onClick={() => updateFilter('country', undefined)}
                className="ml-1 hover:bg-[#0a4373]/20 rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}