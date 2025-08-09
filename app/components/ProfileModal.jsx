"use client"

import { useState, useEffect } from "react"
import { X, Save, Edit3, User, Mail, Phone, MapPin } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function ProfileModal() {
  const { user, isProfileModalOpen, closeProfileModal, login } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        address: user.address || "",
      })
    }
  }, [user])

  if (!isProfileModalOpen || !user) return null

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setErrors({})

    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update user data
      const updatedUser = {
        ...user,
        name: formData.name.trim(),
        address: formData.address.trim(),
      }

      login(updatedUser)
      setIsEditing(false)

      // Show success message
      alert("✅ Profile updated successfully!")
    } catch (error) {
      console.error("Profile update failed:", error)
      alert("❌ Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: user?.name || "",
      address: user?.address || "",
    })
    setErrors({})
    setIsEditing(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">My Profile</h2>
          <button
            onClick={closeProfileModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Profile Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-black">{user.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing || isSaving}
                  className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone Field (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={user?.phone || "Not provided"}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
              </div>

              {/* Account Type (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <input
                  type="text"
                  value="Reader"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing || isSaving}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                placeholder="Enter your complete address..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center px-6 py-2 bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center px-6 py-2 bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-colors"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
