import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Chatbot from '../ui/Chatbot'
import AccessibilityMenu from '../ui/AccessibilityMenu'

const Layout = ({ children }) => {
  return (
    <div className="page-shell page-shell-dark flex flex-col min-h-screen">
      <Navbar />
      <AccessibilityMenu />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <Footer />
      <Chatbot />
    </div>
  )
}

export default Layout
