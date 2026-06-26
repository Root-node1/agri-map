import React, { useState, useRef, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import { chatbotAPI } from '../../services/api'

const quickReplies = [
  'What crops grow best in my region?',
  'How do I improve soil nitrogen?',
  'Explain carbon credit tokenization',
  'When should I irrigate my maize?',
  'How to apply for an agricultural loan?',
]

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I\'m your AgriMap farming assistant. Ask me about crops, soil, loans, carbon credits, or field management.' },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setTyping(true)
    try {
      const data = await chatbotAPI.sendMessage(text)
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply || data.message || data.response }])
    } catch {
      const lower = text.toLowerCase()
      let reply = 'I can help with crop management, soil analysis, loans, and carbon credits. What would you like to know?'
      if (lower.includes('loan')) reply = 'You can apply for agricultural loans through Finance → Loans. Typical approval takes 3-5 business days.'
      else if (lower.includes('soil') || lower.includes('nitrogen')) reply = 'For nitrogen deficiency, consider legume cover crops or apply NPK fertilizer at 50kg/ha. Run a soil analysis in AI Services for precise recommendations.'
      else if (lower.includes('carbon')) reply = 'Carbon credits are calculated from your field NDVI data. Tokenize them in Finance → Tokenization, then sell on the Carbon Marketplace.'
      else if (lower.includes('irrigate') || lower.includes('water')) reply = 'Monitor soil moisture below 40% and irrigate early morning. Check the Heatmap view for zone-specific moisture levels.'
      setMessages((prev) => [...prev, { role: 'bot', text: reply }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Assistant" title="Farming Chatbot" description="AI-powered assistant for field-specific recommendations" />

      <div className="frosted-panel max-w-3xl mx-auto flex flex-col" style={{ height: '60vh' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                msg.role === 'user' ? 'bg-emerald-500 text-white rounded-br-sm' : 'bg-white/10 text-slate-200 rounded-bl-sm'
              }`}>{msg.text}</div>
            </div>
          ))}
          {typing && <div className="text-slate-400 text-sm">Assistant is typing...</div>}
          <div ref={endRef} />
        </div>

        <div className="p-3 border-t border-white/10">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickReplies.map((q) => (
              <button key={q} onClick={() => send(q)} className="px-3 py-1 rounded-full text-xs bg-white/5 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-300 transition">{q}</button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about farming, soil, loans..."
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Chat message"
            />
            <button type="submit" className="btn-primary">Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatbotPage
