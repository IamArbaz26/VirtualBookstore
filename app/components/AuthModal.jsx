"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { X, User, FileText, Mail, Eye, EyeOff } from "lucide-react"
import { auth } from "../../firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, deleteUser } from "firebase/auth"
import { setDoc, getDoc, doc } from "firebase/firestore"
import { db } from "../../firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "../../firebase"

export default function AuthModal() {
  const { isAuthModalOpen, authModalType, closeAuthModal, login, openAuthModal } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    emailOrPhone: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "user",
    authorCertification: null,
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Format phone number for Pakistan
    if (name === "phone" || (name === "emailOrPhone" && /^\d/.test(value))) {
      let formattedValue = value.replace(/\D/g, "")
      if (formattedValue.startsWith("92")) {
        formattedValue = "+" + formattedValue
      } else if (formattedValue.startsWith("03")) {
        formattedValue = "+92" + formattedValue.substring(1)
      } else if (formattedValue.length > 0 && !formattedValue.startsWith("92")) {
        formattedValue = "+92" + formattedValue
      }
      setFormData((prev) => ({ ...prev, [name]: formattedValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, authorCertification: e.target.files[0] }))
  }

  const validateForm = () => {
    const newErrors = {}

    // Password strength validation
    const validatePassword = (password) => {
      const minLength = 8
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumbers = /\d/.test(password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

      if (password.length < minLength) {
        return "Password must be at least 8 characters long"
      }
      if (!hasUpperCase) {
        return "Password must contain at least one uppercase letter"
      }
      if (!hasLowerCase) {
        return "Password must contain at least one lowercase letter"
      }
      if (!hasNumbers) {
        return "Password must contain at least one number"
      }
      if (!hasSpecialChar) {
        return "Password must contain at least one special character (!@#$%^&*)"
      }
      return null
    }

    if (authModalType === "signin") {
      if (!formData.emailOrPhone) newErrors.emailOrPhone = "Email is required"
      if (formData.emailOrPhone && !formData.emailOrPhone.includes("@")) newErrors.emailOrPhone = "Please enter a valid email address"
    } else {
      if (!formData.name) newErrors.name = "Name is required"
      if (!formData.email) newErrors.email = "Email is required"
      if (!formData.phone) newErrors.phone = "Phone number is required"

      // Strong password validation for signup
      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        newErrors.password = passwordError
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
      if (formData.userType === "author" && !formData.authorCertification) {
        newErrors.authorCertification = "Author certification is required"
      }
    }

    if (!formData.password) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (authModalType === "signin") {
        // Sign in with email and password
        if (!formData.emailOrPhone.includes("@")) {
          setErrors({ emailOrPhone: "Please enter a valid email address for sign in." });
          return;
        }
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.emailOrPhone,
          formData.password
        );
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists()) {
          login(userDoc.data());
        } else {
          login({
            email: userCredential.user.email,
            uid: userCredential.user.uid,
            userType: "user", // fallback
          });
        }
        closeAuthModal();
      } else {
        // Sign up with email and password
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        let certificateUrl = "";
        if (formData.userType === "author") {
          if (!formData.authorCertification) {
            setErrors({ authorCertification: "Author certification is required" });
            return;
          }
          // Validate file type and size (max 10MB)
          const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
          if (!allowedTypes.includes(formData.authorCertification.type)) {
            setErrors({ authorCertification: "File must be PDF, JPG, or PNG" });
            return;
          }
          if (formData.authorCertification.size > 10 * 1024 * 1024) {
            setErrors({ authorCertification: "File size must be less than 10MB" });
            return;
          }
          try {
            const certRef = ref(
              storage,
              `author_certificates/${userCredential.user.uid}/${formData.authorCertification.name}`
            );
            await uploadBytes(certRef, formData.authorCertification);
            certificateUrl = await getDownloadURL(certRef);
          } catch (uploadError) {
            await deleteUser(userCredential.user);
            setErrors({ authorCertification: "Failed to upload certificate. Please try again." });
            return;
          }
        }
    const userData = {
          name: formData.name,
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          phone: formData.phone,
          userType: formData.userType === "author" ? "author" : "user",
          createdAt: new Date(),
          authorCertificateUrl: certificateUrl || null,
        };
        try {
          await setDoc(doc(db, "users", userCredential.user.uid), userData);
        } catch (firestoreError) {
          await deleteUser(userCredential.user);
          setErrors({ password: "Failed to save user data. Please try again." });
          return;
        }
        login(userData);
        closeAuthModal();
      }
    } catch (error) {
      setErrors({ password: error.message });
      return;
    }
    // Only reset form if successful
    setFormData({
      name: "",
      emailOrPhone: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      userType: "user",
      authorCertification: null,
    });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmailOrPhone) {
      alert("Please enter your email address");
      return;
    }
    // Only allow email for password reset
    if (!forgotEmailOrPhone.includes("@")) {
      alert("Password reset is only available via email address.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, forgotEmailOrPhone);
      alert("Password reset email sent! Please check your inbox.");
      setShowForgotPassword(false);
      setForgotEmailOrPhone("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
    const userData = {
        name: user.displayName,
        email: user.email,
        uid: user.uid,
      };
      login(userData);
      closeAuthModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const closeAndResetModal = () => {
    setShowForgotPassword(false);
    setErrors({});
    closeAuthModal();
  };

  const switchToSignIn = () => {
    setShowForgotPassword(false);
    setErrors({});
    setFormData({
      name: "",
      emailOrPhone: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      userType: "user",
      authorCertification: null,
    });
    openAuthModal("signin");
  };

  const switchToSignUp = () => {
    setShowForgotPassword(false);
    setErrors({});
    setFormData({
      name: "",
      emailOrPhone: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      userType: "user",
      authorCertification: null,
    });
    openAuthModal("signup");
  };

  if (!isAuthModalOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {showForgotPassword ? "Reset Password" : authModalType === "signin" ? "Sign In" : "Sign Up"}
          </h2>
          <button onClick={closeAndResetModal} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Forgot Password Form */}
        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
            <div className="text-center mb-4">
              <Mail className="h-12 w-12 text-teal-600 mx-auto mb-2" />
              <p className="text-gray-600">
                Enter your email address or phone number and we'll send you a link to reset your password.
              </p>
            </div>

            <div>
              <label htmlFor="forgot-contact" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address or Phone Number *
              </label>
              <input
                type="text"
                id="forgot-contact"
                value={forgotEmailOrPhone}
                onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter your email or phone"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-colors font-medium"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-teal-600 hover:text-teal-700 transition-colors"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          /* Main Auth Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {authModalType === "signup" && (
              <>
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* User Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border rounded-sm p-4 cursor-pointer transition-colors ${
                        formData.userType === "user" ? "border-teal-600 bg-teal-50" : "border-gray-300"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, userType: "user" }))}
                    >
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-600 mr-2" />
                        <div>
                          <div className="font-medium">User</div>
                          <div className="text-sm text-gray-600">Browse and buy books</div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`border rounded-sm p-4 cursor-pointer transition-colors ${
                        formData.userType === "author" ? "border-teal-600 bg-teal-50" : "border-gray-300"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, userType: "author" }))}
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-600 mr-2" />
                        <div>
                          <div className="font-medium">Author</div>
                          <div className="text-sm text-gray-600">Upload and sell books</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Pakistan) *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="+92 300 1234567"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                {/* Author Certification */}
                {formData.userType === "author" && (
                  <div>
                    <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-1">
                      Author Certification/ID *
                    </label>
                    <input
                      type="file"
                      id="certification"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className={`w-full px-3 py-2 border rounded-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.authorCertification ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload valid ID or certification document (PDF, JPG, PNG)
                    </p>
                    {errors.authorCertification && (
                      <p className="text-red-500 text-sm mt-1">{errors.authorCertification}</p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Email or Phone for Sign In */}
            {authModalType === "signin" && (
              <div>
                <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="emailOrPhone"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.emailOrPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.emailOrPhone && <p className="text-red-500 text-sm mt-1">{errors.emailOrPhone}</p>}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Password strength indicator */}
            {authModalType === "signup" && formData.password && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">Password strength:</div>
                <div className="flex space-x-1">
                  <div
                    className={`h-1 w-1/4 rounded-sm ${formData.password.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                  <div
                    className={`h-1 w-1/4 rounded-sm ${/[A-Z]/.test(formData.password) ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                  <div
                    className={`h-1 w-1/4 rounded-sm ${/[a-z]/.test(formData.password) && /\d/.test(formData.password) ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                  <div
                    className={`h-1 w-1/4 rounded-sm ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Must contain: 8+ chars, uppercase, lowercase, number, special character
                </div>
              </div>
            )}

            {/* Confirm Password */}
            {authModalType === "signup" && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Forgot Password Link */}
            {authModalType === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-colors font-medium"
            >
              {authModalType === "signin" ? "Sign In" : "Create Account"}
            </button>

            {/* Toggle */}
            <div className="text-center">
              <button
                type="button"
                onClick={authModalType === "signin" ? switchToSignUp : switchToSignIn}
                className="text-teal-600 hover:text-teal-700 transition-colors"
              >
                {authModalType === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
