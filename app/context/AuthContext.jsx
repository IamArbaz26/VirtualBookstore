"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { auth } from "../../firebase"
import { setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalType, setAuthModalType] = useState("signin")
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const login = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
    setIsAuthModalOpen(false)
    setAuthModalType("signin")
  }

  const openAuthModal = (type = "signin") => {
    setAuthModalType(type)
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  const openProfileModal = () => {
    setIsProfileModalOpen(true)
  }

  const closeProfileModal = () => {
    setIsProfileModalOpen(false)
  }

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          phone: firebaseUser.phoneNumber
        })
      } else {
        // User is signed out
        setUser(null)
      }
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const value = {
    user,
    login,
    logout,
    isAuthModalOpen,
    authModalType,
    openAuthModal,
    closeAuthModal,
    isProfileModalOpen,
    openProfileModal,
    closeProfileModal,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
