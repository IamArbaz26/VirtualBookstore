"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { Upload, CreditCard, Smartphone, AlertCircle, CheckCircle, Package, Download, Truck } from "lucide-react"
import { db } from "../../firebase"
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { user, openAuthModal } = useAuth()

  const [paymentMethod, setPaymentMethod] = useState("mobile")
  const [formData, setFormData] = useState({
    transactionId: "",
    phoneNumber: "",
    email: "",
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [mobileWallet, setMobileWallet] = useState(null)
  const [bankAccount, setBankAccount] = useState(null)
  const [selectedItems, setSelectedItems] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [physicalBooks, setPhysicalBooks] = useState([]);
  const [checkboxStates, setCheckboxStates] = useState({});

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      openAuthModal("signin")
      return
    }
  }, [user, openAuthModal])

  // Get payment type from URL params
  const paymentType = searchParams.get("type") || "cart"
  const bookId = searchParams.get("bookId")
  const bookTitle = searchParams.get("title")
  const bookPrice = searchParams.get("price")

  // If cart is empty but bookId, bookTitle, and bookPrice are present, treat as single book checkout
  const singleBook = bookId && bookTitle && bookPrice
  const singleBookItem = singleBook
    ? [{
        id: bookId,
        title: decodeURIComponent(bookTitle),
        price: Number(bookPrice),
        quantity: 1,
        type: "ebook", // or "physical" if you want to support physical single book
      }]
    : []
  // Use selectedItems if available, otherwise fallback to cartItems
  const effectiveCartItems = selectedItems.length > 0 ? selectedItems : cartItems;

  useEffect(() => {
    async function fetchPaymentAccounts() {
      try {
        const mobileDoc = await getDoc(doc(db, "payment_accounts", "mobile_wallet"))
        const bankDoc = await getDoc(doc(db, "payment_accounts", "bank_account"))
        setMobileWallet(mobileDoc.exists() ? mobileDoc.data() : null)
        setBankAccount(bankDoc.exists() ? bankDoc.data() : null)
      } catch (err) {
        console.error("Failed to fetch payment account details", err)
      }
    }
    fetchPaymentAccounts()
  }, [])

  useEffect(() => {
    const checked = sessionStorage.getItem('checkedCartItems');
    if (checked) {
      try {
        const parsed = JSON.parse(checked);
        setSelectedItems(parsed);
      } catch (e) {
        setSelectedItems([]);
      }
    }
  }, []);

  useEffect(() => {
    setPhysicalBooks(selectedItems.filter(item => item.type === 'physical'));
    setEbooks(selectedItems.filter(item => item.type === 'ebook'));
  }, [selectedItems]);

  const isPhysical = selectedItems.length > 0 && selectedItems[0].type === 'physical';
  const isEbook = selectedItems.length > 0 && selectedItems[0].type === 'ebook';
  const total = selectedItems.reduce((sum, item) => sum + item.price * (isPhysical ? item.quantity : 1), 0);
  const shipping = isPhysical ? 150 : 0;
  const subtotal = total;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + tax + shipping;

  // Calculate separate totals for ebooks and physical books
  const ebooksTotal = ebooks.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const physicalBooksTotal = physicalBooks.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({
          ...prev,
          screenshot: "File size must be less than 5MB",
        }))
        return
      }
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          screenshot: "Please upload an image file",
        }))
        return
      }
      setFormData((prev) => ({
        ...prev,
        screenshot: file,
      }))
      setErrors((prev) => ({
        ...prev,
        screenshot: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.transactionId.trim()) {
      newErrors.transactionId = "Transaction ID is required"
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    // Address validation only if physical books are present
    if (physicalBooks.length > 0) {
      if (!formData.address.trim()) {
        newErrors.address = "Address is required for physical book delivery"
      }
      if (!formData.city.trim()) {
        newErrors.city = "City is required for physical book delivery"
      }
      if (!formData.postalCode.trim()) {
        newErrors.postalCode = "Postal code is required for physical book delivery"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (selectedItems.length === 0) {
      // Just return silently if nothing is selected
      return;
    }

    setIsSubmitting(true)

    try {
      // Determine order type and collection
      const isPhysicalOrder = physicalBooks.length > 0;
      const isEbookOrder = ebooks.length > 0;
      const collectionName = isPhysicalOrder ? "physical_orders" : "ebook_orders";
      
      // Generate order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Compose order data with all details
      const orderData = {
        orderId,
        userId: user.uid,
        userEmail: user.email,
        orderType: isPhysicalOrder ? "physical" : "ebook",
        orderStatus: isPhysicalOrder ? "order_placed" : "pending_verification",
        paymentMethod,
        transactionId: formData.transactionId,
        subtotal,
        shipping,
        tax,
        total: grandTotal,
        userDetails: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phoneNumber,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        shippingAddress: isPhysicalOrder ? {
          name: formData.fullName,
          street: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phoneNumber,
        } : null,
        physicalBooks: isPhysicalOrder ? physicalBooks : [],
        ebooks: isEbookOrder ? ebooks.map(book => ({
          ...book,
          pdfUrl: book.pdfUrl || book.downloadUrl || null,
        })) : [],
        downloadUrls: isEbookOrder ? ebooks.map(book => book.pdfUrl || book.downloadUrl || null).filter(url => url) : [],
        estimatedDelivery: isPhysicalOrder ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null,
        timeline: [
          {
            status: "order_placed",
            timestamp: new Date().toISOString(),
            description: "Order placed successfully",
          }
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Store in appropriate collection
      const docRef = await addDoc(collection(db, collectionName), orderData);
      
      // Also store a reference in the main orders collection for easy querying
      const mainOrderRef = {
        orderId: orderId,
        userId: user.uid,
        userEmail: user.email,
        orderType: orderData.orderType,
        collectionName: collectionName,
        documentId: docRef.id,
        total: grandTotal,
        status: orderData.orderStatus,
        createdAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, "orders"), mainOrderRef);
      
      clearCart();
      if (isPhysicalOrder) {
        router.push(`/order/confirmation?orderId=${orderId}`);
      } else {
        router.push(`/payment/verify?orderId=${orderId}&type=${orderData.orderType}`);
      }
    } catch (error) {
      console.error("Payment submission error:", error)
      alert("Failed to submit payment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Please sign in to continue...</p>
        </div>
      </div>
    )
  }

  if (effectiveCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add some books to your cart before proceeding to payment.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-colors font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
            {bookId && bookTitle && bookPrice ? (
              <div className="mt-2 mb-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-800">Book:</span>
                  <span className="text-gray-900">{decodeURIComponent(bookTitle)}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-800">Price:</span>
                  <span className="text-teal-600 font-bold">PKR {bookPrice}</span>
                </div>
              </div>
            ) : (
            <p className="text-gray-600 mt-1">
                {physicalBooks.length > 0 && ebooks.length > 0
                ? "Mixed order: Physical books + E-books"
                  : physicalBooks.length > 0
                  ? "Physical books with delivery"
                    : null}
            </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Order Summary */}
            <div className="order-2 lg:order-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* E-Books Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">E-Books</h3>
                {ebooks.length === 0 ? (
                  <p className="text-gray-500 mb-4">No eBooks selected.</p>
                ) : (
                  <ul className="mb-4">
                    {ebooks.map((item) => (
                      <li key={item.id} className="mb-2 flex justify-between">
                        <span className="font-medium">{item.title}</span>
                        <span>PKR {item.price}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total for E-Books:</span>
                  <span>PKR {ebooksTotal}</span>
                </div>
              </div>

              {/* Physical Books Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Physical Books</h3>
                {physicalBooks.length === 0 ? (
                  <p className="text-gray-500 mb-4">No physical books selected.</p>
                ) : (
                  <ul className="mb-4">
                    {physicalBooks.map((item) => (
                      <li key={item.id} className="mb-2 flex justify-between">
                        <span className="font-medium">{item.title} <span className="text-xs text-gray-500">x{item.quantity}</span></span>
                        <span>PKR {item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total for Physical Books:</span>
                  <span>PKR {physicalBooksTotal}</span>
                </div>
                {physicalBooks.length > 0 && (
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Shipping:</span>
                    <span>PKR {shipping}</span>
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="bg-gray-50 rounded-sm p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium text-gray-900">PKR {subtotal.toFixed(2)}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Truck className="h-4 w-4 mr-1" />
                        Shipping:
                      </span>
                      <span className="text-sm font-medium text-gray-900">PKR {shipping.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tax (8%):</span>
                    <span className="text-sm font-medium text-gray-900">PKR {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t pt-2">
                    <span>Total:</span>
                    <span>PKR {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="order-1 lg:order-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mobile")}
                      className={`p-4 border-2 rounded-sm flex items-center justify-center space-x-2 transition-colors ${
                        paymentMethod === "mobile"
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Smartphone className="h-5 w-5" />
                      <span className="font-medium">Mobile Wallet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 border-2 rounded-sm flex items-center justify-center space-x-2 transition-colors ${
                        paymentMethod === "card"
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Bank Transfer</span>
                    </button>
                  </div>
                </div>

                {/* Account Details */}
                <div className="bg-gray-50 rounded-sm p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {paymentMethod === "mobile" ? "Mobile Wallet Details" : "Bank Account Details"}
                  </h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    {paymentMethod === "mobile" ? (
                      mobileWallet ? (
                      <>
                        <p>
                            <strong>JazzCash:</strong> {mobileWallet.jazzcash}
                        </p>
                        <p>
                            <strong>EasyPaisa:</strong> {mobileWallet.easypaisa}
                        </p>
                        <p>
                            <strong>Account Name:</strong> {mobileWallet.account_name}
                        </p>
                      </>
                      ) : (
                        <p>Loading...</p>
                      )
                    ) : (
                      bankAccount ? (
                      <>
                        <p>
                            <strong>Bank:</strong> {bankAccount.bank}
                        </p>
                        <p>
                            <strong>Account:</strong> {bankAccount.account}
                        </p>
                        <p>
                            <strong>Account Name:</strong> {bankAccount.account_name}
                        </p>
                      </>
                      ) : (
                        <p>Loading...</p>
                      )
                    )}
                  </div>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.phoneNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="03XX-XXXXXXX"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                  </div>
                </div>

                {/* Delivery Address - Only show if physical books are present */}
                {physicalBooks.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-sm p-4">
                    <div className="flex items-center mb-3">
                      <Truck className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-green-800">Delivery Address</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            errors.address ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter your complete address"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                              errors.city ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="City"
                          />
                          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                          <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                              errors.postalCode ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Postal Code"
                          />
                          {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID *</label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.transactionId ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter transaction/reference ID"
                  />
                  {errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    `Submit Payment - PKR ${grandTotal.toFixed(2)}`
                  )}
                </button>

                {/* Security Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Order Processing</p>
                      <div className="space-y-1">
                        <p>• Payment verification: 5 minutes</p>
                        {ebooks.length > 0 && <p>• E-book download: Immediate after verification</p>}
                        {physicalBooks.length > 0 && <p>• Physical book shipping: 2-3 business days</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
