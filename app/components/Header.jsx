"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { Menu, X, User, BookOpen, ChevronDown, ShoppingCart, Package } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const { user, openAuthModal, logout } = useAuth()
  const { openCart, getCartItemsCount } = useCart()
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Community", href: "/community" },
    { name: "About Us", href: "/about" },
    { name: "Donation", href: "/donation" },
  ]

  const isActive = (path) => pathname === path
  const cartItemsCount = getCartItemsCount()

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-teal-600" />
              <span className="text-2xl font-bold text-teal-600">Bookish</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors flex items-center ${
                    isActive(item.href)
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-gray-600 hover:text-teal-600"
                  }`}
                >
                  {item.name === "Track Order" && <Package className="h-4 w-4 mr-1" />}
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Auth Section */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-bold text-black">
                      <span className="text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-sm shadow-lg py-1 z-50 border">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs">{user.email}</div>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3" />
                        View Profile
                      </Link>
                      <div className="border-t">
                        <button
                          onClick={() => {
                            logout()
                            setIsUserDropdownOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => openAuthModal("signin")}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal("signup")}
                    className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Cart Button */}
              <button onClick={openCart} className="relative p-2 text-gray-600 hover:text-teal-600 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-3 py-2 text-base font-medium transition-colors rounded-sm ${
                      isActive(item.href)
                        ? "text-teal-600 bg-teal-50"
                        : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.name === "Track Order" && <Package className="h-4 w-4 mr-2" />}
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Cart and Auth */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {/* Mobile Cart Button */}
                <button
                  onClick={() => {
                    openCart()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-sm"
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Cart
                  {cartItemsCount > 0 && (
                    <span className="ml-2 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {cartItemsCount}
                    </span>
                  )}
                </button>

                {user ? (
                  <div className="space-y-2 mt-2">
                    <div className="px-3 py-2 text-sm text-gray-500 border-b">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs flex items-center space-x-2">
                        <span>{user.email}</span>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-sm"
                    >
                      <User className="h-5 w-5 mr-3" />
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    <button
                      onClick={() => {
                        openAuthModal("signin")
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-sm"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal("signup")
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium bg-teal-600 text-white rounded-sm hover:bg-teal-700 mx-3"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
