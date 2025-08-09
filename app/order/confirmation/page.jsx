"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { db } from "../../../firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return
      setLoading(true)
      const q = query(collection(db, "physical_orders"), where("orderId", "==", orderId))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        setOrder(querySnapshot.docs[0].data())
      }
      setLoading(false)
    }
    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4 mx-auto"></div>
          <p className="text-gray-600 mb-2">Please wait</p>
          <span className="text-gray-500 text-lg">Loading order...</span>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Order not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-teal-700 mb-4">Order Placed!</h1>
        <p className="text-gray-700 mb-2">Thank you for your order.</p>
        <div className="mb-4">
          <span className="font-semibold text-gray-800">Order ID:</span>
          <span className="ml-2 text-teal-600 font-mono">{order.orderId}</span>
        </div>
        <div className="mb-4">
          <span className="font-semibold text-gray-800">Status:</span>
          <span className="ml-2 text-blue-600">{order.orderStatus}</span>
        </div>
        <div className="mb-4 text-left">
          <h2 className="font-semibold text-gray-800 mb-2">Shipping Address:</h2>
          <div className="bg-gray-50 rounded p-3">
            <div>{order.shippingAddress?.name}</div>
            <div>{order.shippingAddress?.street}</div>
            <div>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</div>
            <div>{order.shippingAddress?.phone}</div>
          </div>
        </div>
        <div className="mb-4 text-left">
          <h2 className="font-semibold text-gray-800 mb-2">Items:</h2>
          <ul className="bg-gray-50 rounded p-3">
            {order.physicalBooks?.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{item.title}</span>
                <span>PKR {item.price} x {item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <span className="font-semibold text-gray-800">Total:</span>
          <span className="ml-2 text-teal-700 font-bold">PKR {order.total}</span>
        </div>
        <a
          href="/"
          className="inline-block mt-6 px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors font-medium"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  )
} 