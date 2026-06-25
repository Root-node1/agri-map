import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Chatbot from '../ui/Chatbot'

const Layout = ({ children }) => {
  return (
    <div className="page-shell page-shell-dark flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Chatbot />
    </div>
  )
}

export default Layout
