'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import NotificationBell from "./NotificationBell"

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)

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
    } catch (error) {
      alert("Error logging out")
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
            Spark
          </Link>
          <div className="flex gap-6 items-center">
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
            
            <NotificationBell user={user} />
            
            {user ? (
              <div className="flex gap-4 items-center">
                <span className="text-gray-700 font-medium">{user.email.split('@')[0]}</span>
                <button 
                  onClick={() => setIsLogoutOpen(true)}
                  className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition-all font-medium"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                href="/"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Popup */}
      {isLogoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Log Out?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out? You'll need to sign in again to access your bookmarks.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsLogoutOpen(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
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