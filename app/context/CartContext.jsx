"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("bookish-cart")
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("bookish-cart", JSON.stringify(cartItems))
    // Debug: log cart items to check for id/type mismatches
    console.log('Cart Items:', cartItems)
  }, [cartItems])

  // Enhanced addToCart logic for physical books and eBooks
  // Scenarios:
  // 1. Physical Book: Can add multiple copies, increase quantity, add different physical books
  // 2. eBook: Only one copy per eBook, cannot increase quantity, can add different eBooks
  // 3. Mixed Cart: Both types can coexist, but eBooks always quantity 1
  const addToCart = (book) => {
    let result = 'added';
    setCartItems((prevItems) => {
      // Force id to string for comparison
      const bookId = String(book.id);
      const bookType = book.type;
      const existingItem = prevItems.find((item) => String(item.id) === bookId && item.type === bookType)

      // eBook logic
      if (bookType === "ebook") {
        if (existingItem) {
          result = 'already_in_cart';
          return prevItems; // Only one copy of an eBook allowed
        }
        // Always add with quantity 1
        result = 'added';
        return [...prevItems, { ...book, id: bookId, type: bookType, quantity: 1 }];
      }

      // Physical book logic
      const addQty = book.quantity && book.quantity > 0 ? book.quantity : 1;
      if (existingItem) {
        // Increase quantity for physical book by the passed quantity
        result = 'increased';
        return prevItems.map((item) =>
          String(item.id) === bookId && item.type === bookType
            ? { ...item, quantity: item.quantity + addQty }
            : item
        );
      }
      // Add new physical book with the passed quantity
      result = 'added';
      return [...prevItems, { ...book, id: bookId, type: bookType, quantity: addQty }];
    });
    return result;
  }

  const removeFromCart = (bookId, bookType) => {
    setCartItems((prevItems) => prevItems.filter((item) => !(String(item.id) === String(bookId) && item.type === bookType)))
  }

  const updateQuantity = (bookId, bookType, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId, bookType)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        String(item.id) === String(bookId) && item.type === bookType
          ? { ...item, quantity: item.type === "ebook" ? 1 : quantity } // E-books always quantity 1
          : item,
      ),
    )
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("bookish-cart")
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isCartOpen,
    openCart,
    closeCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
