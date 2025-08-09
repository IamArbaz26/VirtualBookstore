"use client"

import { useState } from "react"
import { X, Star, ThumbsUp, MessageCircle } from "lucide-react"

export default function BookRatingModal({ book, isOpen, onClose }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock existing reviews
  const existingReviews = [
    {
      id: 1,
      user: "Sarah Johnson",
      userType: "reader",
      rating: 5,
      review: "Absolutely loved this book! The characters were well-developed and the plot kept me engaged throughout.",
      date: "2024-01-15",
      helpful: 12,
    },
    {
      id: 2,
      user: "Michael Chen",
      userType: "author",
      rating: 4,
      review: "Great storytelling technique. The author's use of metaphors really enhanced the narrative.",
      date: "2024-01-10",
      helpful: 8,
    },
    {
      id: 3,
      user: "Emma Davis",
      userType: "reader",
      rating: 5,
      review: "Couldn't put it down! Highly recommend to anyone who enjoys this genre.",
      date: "2024-01-08",
      helpful: 15,
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setRating(0)
      setReview("")
      onClose()
      alert("Thank you for your review!")
    }, 1500)
  }

  const renderStars = (currentRating, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1
      return (
        <Star
          key={index}
          className={`h-6 w-6 cursor-pointer transition-colors ${
            starValue <= (interactive ? hoverRating || rating : currentRating)
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
          }`}
          onClick={interactive ? () => setRating(starValue) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(starValue) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      )
    })
  }

  if (!isOpen || !book) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Rate & Review</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Book Info */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-sm">
            <img
              src={book.image || "/placeholder.svg"}
              alt={book.title}
              className="w-16 h-20 object-cover rounded-sm"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{book.title}</h3>
              <p className="text-sm text-gray-600">by {book.author}</p>
              <div className="flex items-center mt-1">
                <div className="flex">{renderStars(book.rating)}</div>
                <span className="text-sm text-gray-500 ml-2">({book.reviews} reviews)</span>
              </div>
            </div>
          </div>

          {/* Rating Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
              <div className="flex items-center space-x-1">
                {renderStars(rating, true)}
                <span className="ml-2 text-sm text-gray-600">{rating > 0 && `${rating} out of 5 stars`}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review (Optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts about this book..."
              />
              <div className="text-right text-xs text-gray-500 mt-1">{review.length}/500 characters</div>
            </div>

            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Review...
                </div>
              ) : (
                "Submit Review"
              )}
            </button>
          </form>

          {/* Existing Reviews */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews ({existingReviews.length})</h3>
            <div className="space-y-4">
              {existingReviews.map((reviewItem) => (
                <div key={reviewItem.id} className="border border-gray-200 rounded-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-blue-500 rounded-sm flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{reviewItem.user.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{reviewItem.user}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-sm ${
                              reviewItem.userType === "author"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {reviewItem.userType === "author" ? "Author" : "Reader"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">{renderStars(reviewItem.rating)}</div>
                          <span className="text-xs text-gray-500">
                            {new Date(reviewItem.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{reviewItem.review}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-teal-600 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Helpful ({reviewItem.helpful})</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-teal-600 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
