import { useState, useRef, useEffect } from 'react'
import { Send, Bot, X, MessageSquare, Mic, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../utils/cn'

const SupportWidget = ({ kbId = 'default' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    primaryColor: '#db2777',
    welcomeMessage: "Hi! How can I help you today?",
    botName: "Support AI"
  })

  useEffect(() => {
    // Fetch widget config from backend
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/widget/${kbId}/config`)
        if (res.ok) {
          const data = await res.json()
          setConfig(data.config)
          setMessages([{ role: 'assistant', content: data.config.welcomeMessage }])
        }
      } catch (e) {
        console.error("Widget config error", e)
      }
    }
    fetchConfig()
  }, [kbId])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/widget/${kbId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentInput })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      const aiMsgId = Date.now()
      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '', isTyping: true }])

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.content) {
              fullContent += data.content
              setMessages(prev => prev.map(m => 
                m.id === aiMsgId ? { ...m, content: fullContent } : m
              ))
            }
            if (data.done) {
               setMessages(prev => prev.map(m => 
                m.id === aiMsgId ? { ...m, isTyping: false } : m
              ))
            }
          }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[380px] h-[550px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div 
              className="p-6 text-white flex items-center justify-between"
              style={{ background: config.primaryColor }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{config.botName}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-[10px] opacity-80 font-medium uppercase tracking-widest">Always Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-950">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-3",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm max-w-[80%]",
                    msg.role === 'user' 
                      ? "bg-slate-800 text-white rounded-tr-none" 
                      : "bg-white dark:bg-slate-800 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700 rounded-tl-none"
                  )}>
                    {msg.content}
                    {msg.isTyping && <div className="mt-1 flex gap-1"><div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce"></div><div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce delay-75"></div></div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
               <div className="relative">
                  <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask us anything..."
                    className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </div>
               <div className="mt-3 flex items-center justify-center gap-1 text-[8px] text-slate-400 uppercase font-bold tracking-widest">
                  Powered by <Sparkles className="w-2 h-2" /> SupportAI
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all active:scale-90 hover:scale-105"
        style={{ background: config.primaryColor }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  )
}

export default SupportWidget
