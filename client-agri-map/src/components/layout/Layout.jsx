import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Chatbot from '../ui/Chatbot'
import SkipLink from '../ui/SkipLink'
import AccessibilityMenu from '../ui/AccessibilityMenu'

const Layout = ({ children }) => {
  return (
    <div className="page-shell page-shell-dark flex flex-col min-h-screen">
      <SkipLink />
      <Navbar />
      <main id="main-content" className="flex-1 pt-16" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <Chatbot />
      <div className="fixed bottom-6 left-6 z-40 hidden md:block">
        <AccessibilityMenu />
      </div>
    </div>
  )
}

export default Layout
