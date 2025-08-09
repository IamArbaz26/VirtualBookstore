"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertTriangle,
  RefreshCw,
  Package,
  Truck,
  Copy,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { db } from "../../../firebase"
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs, serverTimestamp, arrayUnion } from "firebase/firestore"

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [verificationStatus, setVerificationStatus] = useState("pending") // pending, verified, failed, timeout
  const [isDownloading, setIsDownloading] = useState(false)
  const [ebookStatus, setEbookStatus] = useState("pending") // pending, ready, downloaded
  const [physicalStatus, setPhysicalStatus] = useState("pending") // pending, processing, shipped
  const [orderId, setOrderId] = useState("")
  const [orderType, setOrderType] = useState("")
  const [showOrderIdCopied, setShowOrderIdCopied] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloaded, setDownloaded] = useState(false)

  const orderIdParam = searchParams.get("orderId")
  const orderTypeParam = searchParams.get("type")

  useEffect(() => {
    if (orderIdParam && orderTypeParam) {
      setOrderId(orderIdParam)
      setOrderType(orderTypeParam)
      
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            if (verificationStatus === "pending") {
              setVerificationStatus("timeout")
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Simulate payment verification process
      const verificationTimer = setTimeout(() => {
        // Simulate random verification result (90% success rate)
        const isVerified = Math.random() > 0.1

        if (isVerified) {
          setVerificationStatus("verified")
          clearInterval(timer)

          // Update order status in Firebase
          updateOrderStatus("verified")
        } else {
          setVerificationStatus("failed")
          clearInterval(timer)
          updateOrderStatus("failed")
        }
      }, Math.random() * 240000 + 60000) // Random time between 1-4 minutes

      return () => {
        clearInterval(timer)
        clearTimeout(verificationTimer)
      }
    } else {
      // Redirect back if no order ID found
      router.push("/payment")
    }
  }, [orderIdParam, orderTypeParam, router, verificationStatus])

  const updateOrderStatus = async (status: string) => {
    try {
      const collectionName = orderType === "physical" ? "physical_orders" : "ebook_orders"
      
      // Find the order document by orderId
      const ordersRef = collection(db, collectionName)
      const q = query(ordersRef, where("orderId", "==", orderId))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const orderDoc = querySnapshot.docs[0]
        await updateDoc(orderDoc.ref, {
          orderStatus: status,
          updatedAt: serverTimestamp(),
          timeline: arrayUnion({
            status: status === "verified" ? "payment_verified" : "payment_failed",
            timestamp: new Date().toISOString(),
            description: status === "verified" ? "Payment verified successfully" : "Payment verification failed"
          })
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  useEffect(() => {
    if (!orderId || !orderType) return
    
    const collectionName = orderType === "physical" ? "physical_orders" : "ebook_orders"
    
    // Listen for order updates
    const unsub = onSnapshot(
      query(collection(db, collectionName), where("orderId", "==", orderId)),
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const orderData = querySnapshot.docs[0].data()
          setOrder(orderData)
          setLoading(false)
          
          // Handle order status changes
          if (orderData.orderStatus === "verified" || orderData.isVerified === true) {
            if (orderType === "ebook" && orderData.ebooks?.length > 0) {
              setEbookStatus("ready")
            } else if (orderType === "physical") {
              setPhysicalStatus("processing")
              // Simulate shipping process
              setTimeout(() => {
                setPhysicalStatus("shipped")
              }, 5000)
            }
          }
        }
      }
    )
    
    return () => unsub()
  }, [orderId, orderType])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleDownloadSingle = (ebook: any) => {
    if (!ebook.downloadUrl) {
      alert("Download link not available for this book. Please contact support.")
      return
    }
    
    // Open the drive link in a new tab
    window.open(ebook.downloadUrl, '_blank')
  }

  const handleDownloadAll = async (ebooks: any[]) => {
    if (!ebooks || ebooks.length === 0) return

    setIsDownloading(true)

    try {
      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Open each ebook in a new tab
      for (const ebook of ebooks) {
        if (ebook.downloadUrl) {
          window.open(ebook.downloadUrl, '_blank')
          // Small delay between opening tabs
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }

      setEbookStatus("downloaded")
      alert(`All ebooks opened successfully!`)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to open ebooks. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleRetry = () => {
    router.push("/payment")
  }

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId)
    setShowOrderIdCopied(true)
    setTimeout(() => setShowOrderIdCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4 mx-auto"></div>
        <p className="text-gray-600 mb-2">Please wait</p>
        <span className="text-gray-500 text-lg">We're verifying payment...</span>
      </div>
    </div>
  )

  if (order && (order.orderStatus === "verified" || order.isVerified === true)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-sm shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600 mr-3" />
                <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
              </div>
              <p className="text-center text-gray-600">Thank you for your payment. Your order has been confirmed.</p>
            </div>

            {/* Order Details */}
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
                <div className="bg-gray-50 rounded-sm p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Order ID:</span>
                      <p className="text-gray-900">{order.orderId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Amount:</span>
                      <p className="text-gray-900">PKR {order.total?.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Payment Method:</span>
                      <p className="text-gray-900">{order.paymentMethod === "mobile" ? "Mobile Wallet" : "Bank Transfer"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Order Type:</span>
                      <p className="text-gray-900">{order.orderType === "ebook" ? "E-Books" : "Physical Books"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ebook Downloads */}
              {orderType === "ebook" && order.ebooks?.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your E-Books</h2>
                  <div className="space-y-3">
                    {order.ebooks.map((ebook: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-sm p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-16 bg-gray-200 rounded-sm flex items-center justify-center">
                            <Download className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{ebook.title}</h3>
                            <p className="text-sm text-gray-600">by {ebook.author}</p>
                            <p className="text-sm text-teal-600 font-medium">PKR {ebook.price}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadSingle(ebook)}
                          className="bg-teal-600 text-white px-4 py-2 rounded-sm hover:bg-teal-700 transition-colors font-medium flex items-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Download All Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDownloadAll(order.ebooks)}
                      disabled={isDownloading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isDownloading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Opening Ebooks...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" />
                          Download All Ebooks
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Physical Order Status */}
              {orderType === "physical" && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Status</h2>
                  <div className="bg-green-50 border border-green-200 rounded-sm p-4">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Your order is being processed for shipping</span>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Estimated delivery: {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : "2-3 business days"}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={copyOrderId}
                  className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  {showOrderIdCopied ? "Copied!" : "Copy Order ID"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Always show simple verifying payment message
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4 mx-auto"></div>
        <p className="text-gray-600 mb-2">Please wait</p>
        <span className="text-gray-500 text-lg">We're verifying payment...</span>
      </div>
    </div>
  )
}
