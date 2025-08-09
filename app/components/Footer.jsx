"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Send, CheckCircle } from "lucide-react"
import { db } from "../../firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export default function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [showSubscriptionSuccess, setShowSubscriptionSuccess] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setIsSubscribing(true)

    try {
      await addDoc(collection(db, "subscribers"), {
        email,
        subscribedAt: serverTimestamp(),
      })
      setEmail("")
      setIsSubscribing(false)
      setShowSubscriptionSuccess(true)
      setTimeout(() => setShowSubscriptionSuccess(false), 3000)
    } catch (err) {
      alert("Error: " + err.message)
    }
    setIsSubscribing(false)
  }

  useEffect(() => {
    if (showSubscriptionSuccess) {
      const timer = setTimeout(() => {
        setShowSubscriptionSuccess(false)
      }, 3000) // Auto-close after 3 seconds

      return () => clearTimeout(timer) // Clear timeout if component unmounts
    }
  }, [showSubscriptionSuccess])

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-teal-400" />
              <span className="text-2xl font-bold">Bookish</span>
            </div>
            <p className="text-gray-300 text-sm">
              Discover, buy, sell, and download the finest collection of Pakistani literature. Connect with fellow book
              lovers and explore stories that define our culture.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-teal-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-300 hover:text-teal-400 transition-colors text-sm">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-teal-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/donation" className="text-gray-300 hover:text-teal-400 transition-colors text-sm">
                  Donation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-teal-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@bookish.pk</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-teal-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+92 300 1234567</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  123 Literature Street,
                  <br />
                  Lahore, Punjab, Pakistan
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-gray-300 text-sm mb-4">
              Get the latest updates on new books, author interviews, and literary events.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSubscribing || !email}
                className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubscribing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Subscribing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Subscribe
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Bookish. All rights reserved. Made by Muhammad Faisal Raza and Arbaz with ❤️ for Pakistani
              Literature.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
                Help Center
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
                Support
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
                Careers
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Success Popup */}
      {showSubscriptionSuccess && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-lg">
            <CheckCircle className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Subscription Successful!</h2>
            <p className="text-gray-600">Thank you for subscribing to our newsletter.</p>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Subscribed Successfully!</h2>
            <p className="text-gray-600">Thank you for subscribing to our newsletter.</p>
          </div>
        </div>
      )}
    </footer>
  )
}
