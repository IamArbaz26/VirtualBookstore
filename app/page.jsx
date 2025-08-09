"use client"

import { useState, useEffect } from "react"
import { Star, Download, ShoppingCart, TrendingUp, BookOpen, Eye, Search, X } from "lucide-react"
import { useAuth } from "./context/AuthContext"
import { useCart } from "./context/CartContext"
import Link from "next/link"
import { useRouter } from "next/navigation"
import BookList from "./components/BookList"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase"

const categories = [
  "All",
  "Classic Fiction",
  "Contemporary Fiction",
  "Historical Fiction",
  "Short Stories",
  "Social Fiction",
  "Classic Literature",
]

export default function Home() {
  const [allBooks, setAllBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [priceSort, setPriceSort] = useState("")
  const router = useRouter();

  useEffect(() => {
    const fetchBooks = async () => {
      const querySnapshot = await getDocs(collection(db, "books"))
      const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // Only show books with cover in /images/ and not faisal.jpg or arbaz.jpg
      const filtered = booksData.filter(book => {
        const hasValidCover = book.cover && book.cover.startsWith("/images/") &&
          !book.cover.includes("faisal.jpg") &&
          !book.cover.includes("arbaz.jpg")
        return hasValidCover
      })
      setAllBooks(filtered)
      setFilteredBooks(filtered)
      // Extract unique genres from books
      const genreSet = new Set(filtered.map(book => book.genre).filter(Boolean))
      setGenres(["All", ...Array.from(genreSet)])
    }
    fetchBooks()
  }, [])

  // Handle search and filters
  useEffect(() => {
    let books = [...allBooks]
    // Filter by genre
    if (selectedGenre !== "All") {
      books = books.filter(book => book.genre === selectedGenre)
    }
    // Do NOT filter by searchTerm here
    // Sort by price
    if (priceSort === "low-high") {
      books.sort((a, b) => a.price - b.price)
    } else if (priceSort === "high-low") {
      books.sort((a, b) => b.price - a.price)
    }
    setFilteredBooks(books)
  }, [allBooks, selectedGenre, priceSort])

  // Live suggestions
  useEffect(() => {
    if (searchTerm.trim()) {
      const sugg = allBooks.filter(book =>
        (book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 5)
      setSuggestions(sugg)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchTerm, allBooks])

  const handleSuggestionClick = (book) => {
    setSearchTerm("");
    setShowSuggestions(false);
    router.push(`/book/${book.id}`);
  }

  const clearSearch = () => {
    setSearchTerm("")
    setShowSuggestions(false)
  }

  return (
    <div>
      {/* Hero/Banner Section */}
      <section className="bg-gradient-to-r from-teal-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-teal-600">Bookish</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover, buy, sell, and download the finest collection of Pakistani literature. Connect with fellow book lovers and explore stories that define our culture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#books-section"
                className="px-8 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium text-center"
              >
                Explore Books
              </a>
              <Link
                href="/community"
                className="px-8 py-3 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors font-medium text-center"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Search and Filters Section */}
      <section className="bg-gradient-to-r from-teal-50 to-blue-50 py-12 flex flex-col items-center justify-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">Search for Books</h2>
        <div className="relative w-full max-w-xl mx-auto">
                <input
                  type="text"
            placeholder="Search for books or authors..."
                  value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => searchTerm && setShowSuggestions(true)}
            className="w-full h-12 text-base pl-12 pr-10 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-lg bg-white"
            style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)' }}
                />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
              <X className="h-5 w-5" />
                  </button>
                )}
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
              {suggestions.map((book) => (
                    <button
                      key={book.id}
                  onClick={() => handleSuggestionClick(book)}
                      className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                    >
                      <img
                        src={book.cover || "/placeholder.svg"}
                        alt={book.title}
                    className="w-12 h-16 object-cover rounded shadow-sm"
                      />
                      <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-lg">{book.title}</h4>
                        <p className="text-sm text-gray-600">{book.author}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </div>
      </section>
      {/* Genre and Price Filters */}
      <section className="bg-white border-b shadow-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            {/* Genre Filter */}
            <div className="flex gap-2 flex-wrap">
              {genres.map((genre) => (
              <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedGenre === genre
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                  {genre}
                </button>
              ))}
            </div>
            {/* Price Sort */}
            <div className="flex gap-2">
              <select
                value={priceSort}
                onChange={e => setPriceSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Sort by Price</option>
                <option value="low-high">Low to High</option>
                <option value="high-low">High to Low</option>
              </select>
                </div>
          </div>
        </div>
      </section>
      {/* Book List Section */}
      <section id="books-section" className="py-8 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookList books={filteredBooks} />
        </div>
      </section>
    </div>
  );
}
