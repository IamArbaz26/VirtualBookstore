"use client"

import { useState, useEffect } from "react"
import { Book, Calendar, X, CheckCircle, User, Lock } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { db } from "../../firebase"
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore"
import Link from "next/link"
import { useRouter } from "next/navigation"

const DonationPage = () => {
  const { user, openAuthModal } = useAuth()
  const [selectedBook, setSelectedBook] = useState(null)
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
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [donatedBooks, setDonatedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter();

  useEffect(() => {
    const fetchDonatedBooks = async () => {
      setLoading(true)
      try {
        const querySnapshot = await getDocs(collection(db, "books"))
        const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        // Only show books marked as donated (isDonated: true)
        const filtered = booksData.filter(book => book.isDonated)
        setDonatedBooks(filtered)
      } catch (err) {
        setDonatedBooks([])
      }
      setLoading(false)
    }
    fetchDonatedBooks()
  }, [])

  const handleApplyNow = (book) => {
    if (!user) {
      openAuthModal("signin")
      return
    }

    setSelectedBook(book)
    // Pre-fill form with user data
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
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
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
        setSelectedBook(null)
      }, 5000)
    } catch (err) {
      setSubmitting(false)
      alert("Error: " + err.message)
    }
  }

  const closeModal = () => {
    setShowApplicationForm(false)
    setSelectedBook(null)
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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your application for "<strong>{selectedBook?.title}</strong>" has been submitted successfully.
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
            onClick={() => (window.location.href = "/donation")}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Browse More Books
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Book className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Free Book Donation Program</h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              Apply for free books donated by Bookish company. First Come, First Serve basis - limited quantities
              available!
            </p>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Available Donated Books</h2>
          </div>
          <p className="text-gray-600 mt-2">
            {donatedBooks.length} books available for application
          </p>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent mb-4"></div>
            <span className="text-gray-500 text-lg">Loading donated books...</span>
          </div>
        ) : (
        <div className="grid gap-4 justify-center" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
        }}>
          {donatedBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full min-w-0 mx-auto cursor-pointer"
              style={{ minHeight: 320, maxWidth: 320 }}
              onClick={() => router.push(`/book/${book.id}`)}
            >
              <div className="relative overflow-hidden aspect-[2/3] bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center">
                <img
                  src={book.cover || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=300&width=200"
                  }}
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors text-base">{book.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mb-3 w-fit">{book.category}</span>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{book.description}</p>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (!user) {
                      openAuthModal("signin");
                      return;
                    }
                    setSelectedBook(book);
                    setApplicationData({
                      name: user.name || "",
                      email: user.email || "",
                      phone: user.phone || "",
                      address: "",
                      city: "",
                      postalCode: "",
                      reason: "",
                    });
                    setShowApplicationForm(true);
                  }}
                  className="w-full flex items-center justify-center px-3 py-2 font-medium transition-colors text-sm mt-auto bg-teal-600 text-white hover:bg-teal-700"
                  style={{ borderRadius: 0 }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationForm && selectedBook && user && (
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
                    src={selectedBook.cover || "/placeholder.svg"}
                    alt={selectedBook.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedBook.title}</h3>
                    <p className="text-sm text-gray-600">{selectedBook.author}</p>
                    <p className="text-xs text-green-600 font-medium">
                      {selectedBook.availableQuantity} copies available
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Form */}
              <form className="space-y-4" onSubmit={(e) => handleSubmitApplication(e)}>
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

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Important Information:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Applications are processed on First Come, First Serve basis</li>
                    <li>• We'll contact you within 2-3 business days if selected</li>
                    <li>• Books will be delivered to your provided address free of cost</li>
                    <li>• Please ensure all information is accurate</li>
                  </ul>
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
                    onClick={handleSubmitApplication}
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
    </div>
  )
}

export default DonationPage
