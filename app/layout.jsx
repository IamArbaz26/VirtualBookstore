import Header from "./components/Header"
import Footer from "./components/Footer"
import AuthModal from "./components/AuthModal"
import CartModal from "./components/CartModal"
import ProfileModal from "./components/ProfileModal"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import "./globals.css"
import { Poppins } from "next/font/google"
import AppContent from "./AppContent"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider>
          <CartProvider>
            <AppContent>{children}</AppContent>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
  generator: "v0.dev",
}
