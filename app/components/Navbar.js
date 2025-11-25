'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import NotificationBell from "./NotificationBell"

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setIsLogoutOpen(false)
      setIsMobileMenuOpen(false)
    } catch (error) {
      alert("Error logging out")
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-bold text-blue-600 hover:text-blue-700 transition flex-shrink-0 mr-4">
  Spark
</Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-6 items-center">
            <Link href="/opportunities" className="text-blue-600 hover:text-blue-700 transition font-medium">
              Explore Opportunities
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            {user && (
              <>
                <Link href="/bookmarks" className="text-gray-700 hover:text-blue-600 transition font-medium">
                  My Bookmarks
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
              </>
            )}
            <Link href="/submit" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Submit Program
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Contact
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div id="google_translate_element" className="scale-90"></div>

            <NotificationBell user={user} />
            
            {user ? (
              <div className="flex gap-4 items-center">
                <span className="text-gray-700 font-medium text-sm">{user.email.split('@')[0]}</span>
                <button 
                  onClick={() => setIsLogoutOpen(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-medium text-sm"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg text-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button & Notification Bell */}
          <div className="flex items-center gap-4 lg:hidden">
            <NotificationBell user={user} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 transition"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-3">
              <div id="google_translate_element" className="scale-90"></div>
              <Link 
                href="/opportunities" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-blue-600 hover:text-blue-700 font-medium py-2"
              >
                Explore Opportunities
              </Link>
              {user && (
                <Link 
                  href="/bookmarks" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 font-medium py-2"
                >
                  My Bookmarks
                </Link>
              )}
              <Link 
                href="/submit" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
              >
                Submit Program
              </Link>
              <Link 
                href="/contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
              >
                Contact
              </Link>
              
              <div className="border-t border-gray-200 pt-3">
                {user ? (
                  <>
                    <div className="text-gray-700 font-medium mb-3 text-sm">
                      Signed in as {user.email.split('@')[0]}
                    </div>
                    <button 
                      onClick={() => {
                        setIsLogoutOpen(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-medium"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Popup */}
      {isLogoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Log Out?</h2>
              <p className="text-gray-600 mb-6 text-sm md:text-base">
                Are you sure you want to log out? You'll need to sign in again to access your bookmarks.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsLogoutOpen(false)}
                  className="flex-1 px-4 md:px-6 py-2 md:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all text-sm md:text-base"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}