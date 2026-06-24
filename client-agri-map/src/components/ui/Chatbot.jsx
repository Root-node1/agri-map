import React, { useState, useRef, useEffect } from 'react'
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

const Chatbot = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { 
      text: t('chatbot.welcome'), 
      sender: 'bot',
      features: t('chatbot.features')
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage = { text: input, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response based on keywords
    setTimeout(() => {
      let response = "I'm here to help you with AgriMap. How can I assist you today?"
      
      const lowerInput = input.toLowerCase()
      if (lowerInput.includes('loan') || lowerInput.includes('finance')) {
        response = "Great! You can apply for green financing through our platform. I can help you check your eligibility or guide you through the loan application process."
      } else if (lowerInput.includes('satellite') || lowerInput.includes('crop')) {
        response = "Our satellite intelligence provides real-time NDVI indices, crop health monitoring, and field boundary detection. Would you like to analyze a specific field?"
      } else if (lowerInput.includes('carbon') || lowerInput.includes('credit')) {
        response = "We calculate carbon sequestration from your fields using NDVI-based estimation. You can tokenize and sell your carbon credits on our marketplace."
      } else if (lowerInput.includes('soil')) {
        response = "We analyze soil health including nitrogen proxies and moisture indices. This helps you make informed decisions about fertilizer and irrigation."
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        response = "Hello! How can I help you today? I can assist with satellite analysis, green financing, carbon credits, or field management."
      }
      
      const botMessage = { text: response, sender: 'bot' }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chatbot-container">
      {!isOpen ? (
        <button 
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <FaComments className="text-2xl" />
        </button>
      ) : (
        <div className="chatbot-window glass-card rounded-2xl shadow-2xl">
          <div className="chatbot-header bg-gradient-to-r from-green-600 to-blue-600 rounded-t-2xl px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaRobot className="text-white text-xl" />
              <h3 className="text-white font-semibold">{t('chatbot.title')}</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition"
              aria-label="Close chat"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          <div className="chatbot-messages p-4 h-80 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-3 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${
                  msg.sender === 'user' 
                    ? 'bg-green-500 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                  {msg.features && (
                    <div className="mt-2 text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                      {msg.features}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-left mb-3">
                <div className="inline-block bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatbot.placeholder')}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white"
              aria-label="Type your message"
            />
            <button 
              onClick={handleSend}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2"
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chatbot
