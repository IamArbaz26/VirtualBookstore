"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { db } from "../../../firebase"
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore"
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, MessageSquare, ThumbsUp, Reply, Send, User, Download, X } from "lucide-react"

export default function BookDetails() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { user, openAuthModal } = useAuth()

  const [book, setBook] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviews, setReviews] = useState([])
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [loading, setLoading] = useState(true)
  const [replies, setReplies] = useState({})
  const [shareCopied, setShareCopied] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    reason: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Fetch book, reviews, and replies from Firestore
  useEffect(() => {
    const fetchBookAndReviews = async () => {
      setLoading(true)
      try {
        const bookRef = doc(db, "books", params.id)
        const bookSnap = await getDoc(bookRef)
        if (bookSnap.exists()) {
          setBook({ id: bookSnap.id, ...bookSnap.data() })
        } else {
          setBook(null)
        }
        // Fetch reviews
        const reviewsRef = collection(db, "books", params.id, "reviews")
        const reviewsSnap = await getDocs(reviewsRef)
        const reviewsData = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        // Fetch replies for each review
        const repliesObj = {};
        await Promise.all(reviewsData.map(async (review) => {
          const repliesRef = collection(db, "books", params.id, "reviews", review.id, "replies")
          const repliesSnap = await getDocs(repliesRef)
          repliesObj[review.id] = repliesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        }))
        setReviews(reviewsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds))
        setReplies(repliesObj)
      } catch (err) {
        setBook(null)
      }
      setLoading(false)
    }
    if (params.id) fetchBookAndReviews()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"></div>
        <span className="text-gray-500 text-lg">Loading book details...</span>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Book not found.</p>
        </div>
      </div>
    )
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length : 0

  const handleAddToCart = () => {
    addToCart({ ...book, quantity })
  }

  const handleDownload = () => {
    if (!user) {
      openAuthModal("signin")
      return
    }
    // Always go to payment for only this ebook, regardless of cart contents
    router.push(`/payment?bookId=${book.id}&bookPrice=${book.price}&bookTitle=${encodeURIComponent(book.title)}`)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) {
      openAuthModal("signin")
      return
    }
    if (userRating === 0) {
      alert("Please select a rating")
      return
    }
    setIsSubmittingReview(true)
    try {
      const review = {
        userId: user.uid,
        userName: user.name || user.displayName || user.email,
        userType: user.type || "reader",
        rating: userRating,
        review: userReview,
        createdAt: serverTimestamp(),
        helpful: 0,
        helpfulUsers: [],
        replies: [],
      }
      await addDoc(collection(db, "books", book.id, "reviews"), review)
      setUserRating(0)
      setUserReview("")
      // Refresh reviews
      const reviewsRef = collection(db, "books", book.id, "reviews")
      const reviewsSnap = await getDocs(reviewsRef)
      const reviewsData = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setReviews(reviewsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds))
      alert("Review submitted successfully!")
    } catch (err) {
      alert("Error submitting review")
    }
    setIsSubmittingReview(false)
  }

  const handleHelpful = (reviewId) => {
    if (!user) {
      openAuthModal("signin")
      return
    }

    setReviews(
      reviews.map((review) => {
        if (review.id === reviewId) {
          const hasVoted = review.helpfulUsers.includes(user.id || "current-user")
          return {
            ...review,
            helpful: hasVoted ? review.helpful - 1 : review.helpful + 1,
            helpfulUsers: hasVoted
              ? review.helpfulUsers.filter((id) => id !== (user.id || "current-user"))
              : [...review.helpfulUsers, user.id || "current-user"],
          }
        }
        return review
      }),
    )
  }

  const handleReply = async (reviewId) => {
    if (!user) {
      openAuthModal("signin")
      return
    }
    if (!replyText.trim()) return
    const newReply = {
      userId: user.uid,
      userName: user.name || user.displayName || user.email,
      userType: user.type || "reader",
      text: replyText,
      createdAt: serverTimestamp(),
    }
    try {
      await addDoc(collection(db, "books", book.id, "reviews", reviewId, "replies"), newReply)
      // Refresh replies for this review
      const repliesRef = collection(db, "books", book.id, "reviews", reviewId, "replies")
      const repliesSnap = await getDocs(repliesRef)
      setReplies(prev => ({
        ...prev,
        [reviewId]: repliesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }))
    } catch (err) {
      alert("Error submitting reply")
    }
    setReplyText("")
    setReplyingTo(null)
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

  const handleApplyNow = () => {
    if (!user) {
      openAuthModal("signin")
      return
    }
    setApplicationData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: "",
      city: "",
      postalCode: "",
      reason: "",
    })
    setShowApplicationForm(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setApplicationData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.startsWith("92")) {
      value = value.substring(2)
    }
    if (value.length > 10) {
      value = value.substring(0, 10)
    }
    setApplicationData((prev) => ({
      ...prev,
      phone: value,
    }))
  }

  const formatPhoneDisplay = (phone) => {
    if (!phone) return ""
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length <= 3) return `+92 ${cleaned}`
    if (cleaned.length <= 6) return `+92 ${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    return `+92 ${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  }

  const validateForm = () => {
    const { name, email, phone, address, city, postalCode, reason } = applicationData
    return name && email && phone && address && city && postalCode && reason && phone.length === 10
  }

  const handleSubmitApplication = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      alert("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    try {
      await addDoc(collection(db, "donation_applications"), {
        ...applicationData,
        userId: user.uid,
        userEmail: user.email,
        bookId: book.id,
        bookTitle: book.title,
        appliedAt: serverTimestamp(),
      })
      setSubmitting(false)
      setShowApplicationForm(false)
      setShowSuccess(true)
      setApplicationData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        reason: "",
      })
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    } catch (err) {
      setSubmitting(false)
      alert("Error: " + err.message)
    }
  }

  const closeModal = () => {
    setShowApplicationForm(false)
    setApplicationData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      reason: "",
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Books
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Book Details Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Book Details</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Book Image */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative aspect-[2/3] bg-gray-100 border border-gray-200 shadow-sm w-full max-w-lg flex items-center justify-center">
                <img
                  src={book.cover || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-sm"
                  style={{ maxWidth: 400 }}
                />
              </div>
            </div>

            {/* Book Information */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{book.title}</h1>
                <p className="text-xl text-gray-600 mb-4">by {book.author}</p>

                {/* Rating */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.floor(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg text-gray-600">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>

                {/* Price - only show if not donated */}
                {!book.isDonated && (
                  <div className="text-4xl font-bold text-teal-600 mb-6">PKR {book.price}</div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{book.description}</p>
              </div>

              {/* Book Specifications */}
              <div className="bg-gray-50 rounded-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Book Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-900">Genre:</span>
                    <p className="text-gray-600">{book.genre}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Pages:</span>
                    <p className="text-gray-600">{book.pages}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Language:</span>
                    <p className="text-gray-600">{book.language}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Publisher:</span>
                    <p className="text-gray-600">{book.publisher}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">ISBN:</span>
                    <p className="text-gray-600">{book.isbn}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Published:</span>
                    <p className="text-gray-600">{book.publishedDate}</p>
                  </div>
                </div>
              </div>

              {/* Quantity and Actions - only show if not donated */}
              {!book.isDonated ? (
                <div className="space-y-4">
                  {/* Quantity selector: show for physical, disable for ebook */}
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-sm">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                        disabled={book.type === "ebook"}
                      >
                        -
                      </button>
                      <span className="px-6 py-2 border-x border-gray-300 font-medium">{book.type === "ebook" ? 1 : quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                        disabled={book.type === "ebook"}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Always show Add to Cart for both types */}
                    <button
                      onClick={() => {
                        addToCart({ ...book, quantity: book.type === "ebook" ? 1 : quantity })
                      }}
                      className="w-full bg-teal-600 text-white py-4 px-6 rounded-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center text-lg"
                    >
                      <ShoppingCart className="h-6 w-6 mr-3" />
                      Add to Cart - PKR {(book.price * (book.type === "ebook" ? 1 : quantity)).toFixed(2)}
                    </button>
                    {/* Download for ebooks only */}
                    {book.type === "ebook" && (
                      <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center px-4 py-3 border border-teal-600 text-teal-600 rounded-sm hover:bg-teal-50 transition-colors text-lg font-medium"
                      >
                        <Download className="h-6 w-6 mr-3" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleApplyNow}
                  className="w-full flex items-center justify-center px-3 py-2 font-medium transition-colors text-lg mt-4 bg-teal-600 text-white hover:bg-teal-700"
                  style={{ borderRadius: 0 }}
                >
                  Apply Now
                </button>
              )}
              {/* Share button always visible */}
              <div className="flex gap-3 mt-4">
                <button
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={async () => {
                    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
                    if (navigator.clipboard) {
                      await navigator.clipboard.writeText(shareUrl);
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }
                  }}
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  {shareCopied ? 'Link Copied!' : 'Share Book'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Ratings & Reviews Section */}
        <section className="border-t pt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Ratings & Reviews</h2>

          {/* Rating Summary */}
          <div className="bg-gray-50 rounded-sm p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center md:text-left">
                <div className="text-6xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center md:justify-start mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-lg text-gray-600">{reviews.length} reviews</div>
              </div>

              <div>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter((review) => review.rating === rating).length
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center space-x-3 mb-2">
                      <span className="text-sm w-8">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Write Review Form */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Write a Review</h3>

            {user ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          i < userRating ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-300"
                        }`}
                        onClick={() => setUserRating(i + 1)}
                      />
                    ))}
                    <span className="ml-3 text-sm text-gray-600">
                      {userRating > 0 && `${userRating} out of 5 stars`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="Share your thoughts about this book..."
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">{userReview.length}/1000 characters</div>
                </div>

                <button
                  type="submit"
                  disabled={userRating === 0 || isSubmittingReview}
                  className="bg-teal-600 text-white py-3 px-6 rounded-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmittingReview ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Please sign in to write a review</p>
                <button
                  onClick={() => openAuthModal("signin")}
                  className="bg-teal-600 text-white py-2 px-6 rounded-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {displayedReviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-sm p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">{review.userName?.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{review.userName}</h4>
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
                      <span className="text-sm text-gray-500">{review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleString() : ""}</span>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">{review.review}</p>

                    <div className="flex items-center space-x-6 mb-4">
                      <button
                        onClick={() => handleHelpful(review.id)}
                        className={`flex items-center space-x-2 text-sm transition-colors ${
                          user && review.helpfulUsers.includes(user.id || "current-user")
                            ? "text-teal-600"
                            : "text-gray-500 hover:text-teal-600"
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                        className="flex items-center space-x-2 text-sm text-gray-500 hover:text-teal-600 transition-colors"
                      >
                        <Reply className="h-4 w-4" />
                        <span>Reply</span>
                      </button>
                    </div>

                    {/* Replies */}
                    {replies[review.id]?.length > 0 && (
                      <div className="ml-6 space-y-4 border-l-2 border-gray-100 pl-6">
                        {replies[review.id].map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-base font-bold text-white">{reply.userName?.charAt(0).toUpperCase() || "U"}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm text-gray-900">{reply.userName}</span>
                                <span className="text-xs text-gray-500">{reply.createdAt?.seconds ? new Date(reply.createdAt.seconds * 1000).toLocaleString() : ""}</span>
                              </div>
                              <p className="text-sm text-gray-700">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === review.id && (
                      <div className="mt-4 ml-6 border-l-2 border-teal-200 pl-6">
                        {user ? (
                          <div className="flex space-x-3">
                            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-base font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                                placeholder="Write your reply..."
                              />
                              <div className="flex space-x-2 mt-2">
                                <button
                                  onClick={() => handleReply(review.id)}
                                  disabled={!replyText.trim()}
                                  className="bg-teal-600 text-white py-2 px-4 rounded-sm text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Reply
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyingTo(null)
                                    setReplyText("")
                                  }}
                                  className="border border-gray-300 text-gray-700 py-2 px-4 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-600 mb-2">Please sign in to reply</p>
                            <button
                              onClick={() => openAuthModal("signin")}
                              className="bg-teal-600 text-white py-1 px-4 rounded-sm text-sm font-medium hover:bg-teal-700 transition-colors"
                            >
                              Sign In
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Show More/Less Reviews */}
            {reviews.length > 3 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="bg-gray-100 text-gray-700 py-3 px-6 rounded-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {showAllReviews ? "Show Less Reviews" : `Show All ${reviews.length} Reviews`}
                </button>
              </div>
            )}

            {reviews.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600">Be the first to review this book!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Application Modal for Donated Books */}
      {showApplicationForm && book.isDonated && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Apply for Book</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              {/* Book Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={book.cover || "/placeholder.svg"}
                    alt={book.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                </div>
              </div>
              {/* Application Form */}
              <form className="space-y-4" onSubmit={handleSubmitApplication}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={applicationData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={applicationData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formatPhoneDisplay(applicationData.phone)}
                    onChange={handlePhoneChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="+92 300-123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complete Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={applicationData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter your complete address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={applicationData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={applicationData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why do you need this book? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={applicationData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Please explain why you need this book and how it will benefit you..."
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!validateForm() || submitting}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      validateForm() && !submitting
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full text-center">
            <X className="h-6 w-6 text-gray-400 absolute top-4 right-4 cursor-pointer" onClick={() => setShowSuccess(false)} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2 mt-6">Application Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your application for "<strong>{book?.title}</strong>" has been submitted successfully.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>What's Next?</strong>
                <br />
                We'll review your application within 2-3 business days. If selected, we'll contact you via email or phone
                to arrange delivery.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors mb-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
