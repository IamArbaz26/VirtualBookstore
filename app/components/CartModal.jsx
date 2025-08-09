"use client"

import { X, Plus, Minus, ShoppingBag, Trash2, Package, Download } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CartModal() {
  const { cartItems, isCartOpen, closeCart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
  const { user, openAuthModal } = useAuth()
  const router = useRouter()
  const [checkboxStates, setCheckboxStates] = useState({})
  const [globalType, setGlobalType] = useState('physical') // 'physical' or 'ebook'

  const handleCheckboxChange = (key, type) => {
    setCheckboxStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: !prev[key]?.[type],
      },
    }))
  }

  const handleCheckout = () => {
    // Build checkedItems: for each cart item, check both physical and ebook checkboxes
    let checkedItems;
    if (globalType === 'ebook') {
      // When "All eBook" is selected, convert all cart items to ebooks
      checkedItems = cartItems.map(item => ({ ...item, type: 'ebook', quantity: 1 }));
    } else {
      // When "All Physical" is selected, ensure all items are physical
      checkedItems = cartItems.map(item => ({ ...item, type: 'physical' }));
    }

    if (checkedItems.length === 0) {
      return;
    }

    const hasPhysical = checkedItems.some(item => item.type === "physical");
    const hasEbook = checkedItems.some(item => item.type === "ebook");

    if (!user) {
      closeCart();
      openAuthModal("signin");
      return;
    }
    closeCart();
    sessionStorage.setItem('checkedCartItems', JSON.stringify(checkedItems));
    if (hasPhysical) {
      router.push("/payment?type=physical");
    } else if (hasEbook) {
      router.push("/payment?type=ebook");
    }
  }

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
          </div>
          <button onClick={closeCart} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex items-center mb-4 space-x-6">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <input
                type="radio"
                name="globalType"
                value="physical"
                checked={globalType === 'physical'}
                onChange={() => setGlobalType('physical')}
                className="form-radio h-4 w-4 text-teal-600 mr-2"
              />
              All Physical
            </label>
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <input
                type="radio"
                name="globalType"
                value="ebook"
                checked={globalType === 'ebook'}
                onChange={() => setGlobalType('ebook')}
                className="form-radio h-4 w-4 text-teal-600 mr-2"
              />
              All eBook
            </label>
          </div>
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600">Add some books to get started!</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {cartItems.map((item) => {
                // Use id-type keys for both checkboxes
                const checkedPhysical = checkboxStates[`${item.id}-physical`]?.physical ?? (item.type === "physical");
                const checkedEbook = checkboxStates[`${item.id}-ebook`]?.ebook ?? (item.type === "ebook");
                const entryKey = `${item.id}-${item.type}`;
                const handleExclusiveCheckbox = (key, type) => {
                  setCheckboxStates((prev) => ({
                    ...prev,
                    [key]: {
                      physical: type === 'physical',
                      ebook: type === 'ebook',
                    },
                  }));
                };
                return (
                  <div key={entryKey} className="flex items-center space-x-4 bg-gray-50 rounded-sm p-4">
                    <img
                      src={item.cover || "/placeholder.svg"}
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded-sm shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{item.author}</p>
                      <p className="text-lg font-bold text-teal-600">PKR {item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.type)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-6 flex-shrink-0 bg-white">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-teal-600">PKR {getCartTotal()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors font-medium"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-colors font-medium"
              >
                {user ? "Proceed to Payment" : "Sign In to Checkout"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
