"use client"

import Header from "./components/Header"
import Footer from "./components/Footer"
import AuthModal from "./components/AuthModal"
import CartModal from "./components/CartModal"
import ProfileModal from "./components/ProfileModal"
import { useAuth } from "./context/AuthContext"

export default function AppContent({ children }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4 mx-auto"></div>
          <p className="text-gray-600 mb-2">Please wait</p>
          <span className="text-gray-500 text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModal />
      <CartModal />
      <ProfileModal />
    </div>
  )
} 