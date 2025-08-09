"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Clock, Download, Home } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState(null)

  const paymentMethod = searchParams.get("method")
  const status = searchParams.get("status")

  useEffect(() => {
    // Generate order details
    const orderId = "ORD-" + Date.now().toString().slice(-8)
    const transactionId = "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase()

    setOrderDetails({
      orderId,
      transactionId,
      paymentMethod,
      status: status || "confirmed",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    })
  }, [paymentMethod, status])

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const isPending = orderDetails.status === "pending"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-sm shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            {isPending ? (
              <Clock className="h-16 w-16 text-yellow-500 mx-auto" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isPending ? "Payment Submitted!" : "Payment Successful!"}
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            {isPending
              ? "Your payment is being verified. You'll receive confirmation within 1-2 business hours."
              : "Thank you for your purchase! Your order has been confirmed."}
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-sm p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm">{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-sm">{orderDetails.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="capitalize">
                  {orderDetails.paymentMethod === "mobile" ? "Mobile Wallet" : "Credit Card"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{orderDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span>{orderDetails.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold capitalize ${isPending ? "text-yellow-600" : "text-green-600"}`}>
                  {isPending ? "Pending Verification" : "Confirmed"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {isPending && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4 mb-8">
              <p className="text-sm text-yellow-800">
                <strong>What happens next?</strong>
                <br />
                Our team will verify your payment within 1-2 business hours. You'll receive an email confirmation once
                verified. You can check your order status in your account.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-teal-600 text-white py-3 px-4 rounded-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <Home className="h-4 w-4 inline mr-2" />
              Continue Shopping
            </Link>

            <button
              onClick={() => window.print()}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-sm font-medium hover:bg-gray-300 transition-colors"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Print Receipt
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help? Contact us at{" "}
              <a href="mailto:support@bookish.com" className="text-teal-600 hover:text-teal-700">
                support@bookish.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
