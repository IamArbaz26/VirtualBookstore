"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Star, ArrowRight } from "lucide-react"

export default function SearchBar({ books, searchTerm, setSearchTerm, onBookSelect, className = "" }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Filter suggestions based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = books
        .filter((book) => {
          const searchLower = searchTerm.toLowerCase()
          return (
            book.title.toLowerCase().includes(searchLower) ||
            book.author.toLowerCase().includes(searchLower) ||
            book.category.toLowerCase().includes(searchLower) ||
            book.description.toLowerCase().includes(searchLower)
          )
        })
        .slice(0, 6) // Limit to 6 suggestions

      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
    setSelectedIndex(-1)
  }, [searchTerm, books])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else if (suggestions.length > 0) {
          // If no specific suggestion is selected, select the first one
          handleSuggestionClick(suggestions[0])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        searchRef.current?.blur()
        break
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (book) => {
    setShowSuggestions(false)
    setSelectedIndex(-1)
    onBookSelect(book)
    // Keep the search term for context
    setSearchTerm(book.title)
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !searchRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Highlight matching text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, "gi")
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-medium">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const clearSearch = () => {
    setSearchTerm("")
    setShowSuggestions(false)
    setSelectedIndex(-1)
    searchRef.current?.focus()
  }

  const scrollToResults = () => {
    setShowSuggestions(false)
    const resultsSection = document.getElementById("books-section")
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search books, authors, or topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && searchTerm.length > 0) setShowSuggestions(true)
          }}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Suggestions List */}
          <div className="py-2">
            {suggestions.map((book, index) => (
              <div
                key={book.id}
                onClick={() => handleSuggestionClick(book)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === selectedIndex ? "bg-teal-50 border-l-4 border-teal-600" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Book Cover */}
                  <img
                    src={book.cover || "/placeholder.svg"}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded shadow-sm flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=64&width=48"
                    }}
                  />

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{highlightText(book.title, searchTerm)}</h4>
                    <p className="text-sm text-gray-600 truncate">by {highlightText(book.author, searchTerm)}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {highlightText(book.category, searchTerm)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">{book.rating}</span>
                        </div>
                        <span className="text-sm font-bold text-teal-600">PKR {book.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* View All Results Footer */}
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <button
              onClick={scrollToResults}
              className="w-full text-left text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center justify-between"
            >
              <span>View all {suggestions.length} results</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* No Results State */}
      {showSuggestions && suggestions.length === 0 && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-6 text-center">
            <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No books found for "{searchTerm}"</p>
            <p className="text-gray-500 text-xs mt-1">Try different keywords or check spelling</p>
          </div>
        </div>
      )}
    </div>
  )
}
