"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { User, Mail, MapPin, Calendar, Edit2, Save, Phone } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    address: user?.address || "",
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
          <Link
            href="/"
            className="bg-teal-600 text-white px-6 py-2 rounded-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    const updatedUser = { ...user, ...formData }
    login(updatedUser)
    setIsEditing(false)
    alert("Profile updated successfully!")
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      address: user?.address || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-sm shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-teal-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-black">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phone}
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {user.address}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member since {new Date().getFullYear()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-white rounded-sm shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-2" />
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.name}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                <p className="text-gray-900 py-2">{user.email}</p>
              </div>

              {/* Phone (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                <p className="text-gray-900 py-2">{user.phone || "Not provided"}</p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.address || "No address provided"}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-teal-600 text-white py-2 px-4 rounded-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
