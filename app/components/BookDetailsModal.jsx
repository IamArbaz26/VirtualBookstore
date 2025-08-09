"use client"

import { useState } from "react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { X, ShoppingCart, Heart, Share2, Star, MessageSquare, ThumbsUp } from "lucide-react"
import BookRatingModal from "./BookRatingModal"
import ApplyForDonation from "./ApplyForDonation"
import { useToast } from "../../hooks/use-toast"
import { normalizeBookForCart } from '../../lib/utils'

export default function BookDetailsModal({ book, isOpen, onClose }) {
  const { addToCart } = useCart()
  const { user, openAuthModal } = useAuth()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)

  // Mock reviews data
  const [bookReviews] = useState([
    {
      id: 1,
      userName: "Ahmed Khan",
      userType: "reader",
      rating: 5,
      review:
        "An absolutely brilliant piece of literature. The storytelling is captivating and the characters are well-developed. Highly recommend this masterpiece!",
      date: "2024-01-20",
      helpful: 12,
    },
    {
      id: 2,
      userName: "Fatima Ali",
      userType: "author",
      rating: 4,
      review:
        "A compelling read that beautifully captures the essence of Pakistani culture. The narrative style is engaging and thought-provoking.",
      date: "2024-01-18",
      helpful: 8,
    },
    {
      id: 3,
      userName: "Hassan Sheikh",
      userType: "reader",
      rating: 5,
      review:
        "This book touched my heart. The way the author has portrayed the characters and their struggles is remarkable. A must-read for everyone.",
      date: "2024-01-15",
      helpful: 15,
    },
    {
      id: 4,
      userName: "Ayesha Malik",
      userType: "reader",
      rating: 4,
      review:
        "Great storytelling with deep cultural insights. Some parts were a bit slow, but overall an excellent read.",
      date: "2024-01-12",
      helpful: 6,
    },
  ])

  const averageRating = bookReviews.reduce((sum, review) => sum + review.rating, 0) / bookReviews.length

  if (!isOpen || !book) return null

  const handleAddToCart = () => {
    const isEbook = book.type && book.type.toLowerCase() === "ebook";
    const normalizedBook = normalizeBookForCart(book, quantity);
    const result = addToCart(normalizedBook);
    if (isEbook) {
      if (result === 'already_in_cart') {
        toast({ title: 'E-book already in cart', description: 'You can only order one copy of an e-book.' })
      } else if (result === 'added') {
        toast({ title: 'E-book added to cart', description: 'E-book added to cart.' })
      }
    } else {
      if (result === 'increased') {
        toast({ title: 'Quantity increased', description: 'Book quantity increased in cart.' })
      } else if (result === 'added') {
        toast({ title: 'Added to cart', description: 'Book added to cart.' })
      }
    }
    onClose()
  }

  const handleDownload = () => {
    if (!user) {
      openAuthModal("signin")
      return
    }
    const normalizedBook = normalizeBookForCart({ ...book, type: "ebook" }, 1);
    const result = addToCart(normalizedBook);
    if (result === 'already_in_cart') {
      toast({ title: 'E-book already in cart', description: 'You can only order one copy of an e-book.' })
    } else if (result === 'added') {
      toast({ title: 'E-book added to cart', description: 'E-book added to cart.' })
    }
    onClose()
  }

  const handleRateBook = () => {
    if (!user) {
      openAuthModal("signin")
      return
    }
    setIsRatingModalOpen(true)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/book/${book.id}?action=add-to-cart`;
    if (navigator.share) {
      navigator.share({
        title: 'Check out this book!',
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: 'Shareable link copied!', description: 'You can send this link to others.' });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-sm max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Book Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Book Details Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Book Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Book Image */}
                <div className="flex justify-center">
                  <img
                    src={book.image || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full max-w-sm h-auto object-cover rounded-sm shadow-lg"
                  />
                </div>

                {/* Book Info */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                    <p className="text-xl text-gray-600">by {book.author}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {averageRating.toFixed(1)} ({bookReviews.length} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-3xl font-bold text-teal-600">PKR {book.price}</div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {book.description ||
                        "This is an amazing book that will captivate readers with its compelling storyline and well-developed characters. Perfect for anyone looking for an engaging read that combines entertainment with meaningful themes."}
                    </p>
                  </div>

                  {/* Book Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Genre:</span>
                      <p className="text-gray-600">{book.genre || "Fiction"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Pages:</span>
                      <p className="text-gray-600">{book.pages || "320"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Language:</span>
                      <p className="text-gray-600">{book.language || "English"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Publisher:</span>
                      <p className="text-gray-600">{book.publisher || "Bookish Publishing"}</p>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-sm">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-x border-gray-300">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row space-x-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart - PKR {(book.price * quantity).toFixed(2)}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Share
                    </button>
                  </div>
                  {book.type === "ebook" && (
                    <button
                      onClick={handleDownload}
                      className="w-full border border-teal-600 text-teal-600 py-3 px-4 rounded-sm font-medium hover:bg-teal-50 transition-colors flex items-center justify-center mt-3"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Ratings & Reviews Section */}
            <div className="border-t pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h3>
                <button
                  onClick={handleRateBook}
                  className="bg-teal-600 text-white px-4 py-2 rounded-sm font-medium hover:bg-teal-700 transition-colors flex items-center"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Write a Review
                </button>
              </div>

              {/* Rating Summary */}
              <div className="bg-gray-50 rounded-sm p-6 mb-6">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                    <div className="flex justify-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">{bookReviews.length} reviews</div>
                  </div>

                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = bookReviews.filter((review) => review.rating === rating).length
                      const percentage = (count / bookReviews.length) * 100
                      return (
                        <div key={rating} className="flex items-center space-x-2 mb-1">
                          <span className="text-sm w-8">{rating}</span>
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {bookReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-blue-500 rounded-sm flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{review.userName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{review.userName}</h4>
                          <span
                            className={`px-2 py-1 rounded-sm text-xs font-medium ${
                              review.userType === "author"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {review.userType === "author" ? "Author" : "Reader"}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.review}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{new Date(review.date).toLocaleDateString()}</span>
                          <button className="flex items-center space-x-1 hover:text-teal-600 transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Helpful ({review.helpful})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <BookRatingModal book={book} isOpen={isRatingModalOpen} onClose={() => setIsRatingModalOpen(false)} />
    </>
  )
}

