import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Send, Bot, User, Sparkles, Copy, Search, Mic, Share2, Loader2, X, Maximize2, Minimize2, Settings } from 'lucide-react'
import { cn } from '../../utils/cn'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const AntigravityChat = ({ knowledgeBaseId, initialChatId, onCitationClick }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome to the Antigravity Terminal. I am your AI Knowledge Matrix. How can I assist you in this dimension?", createdAt: new Date() }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatId, setChatId] = useState(initialChatId)
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const scrollRef = useRef(null)

  // Floating animations for background orbs
  const floatingOrbs = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    size: Math.random() * 300 + 200,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * 5
  }))

  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!initialChatId) return
      setLoading(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${initialChatId}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages)
          setChatId(data.id)
        }
      } catch (error) {
        console.error('Error fetching chat messages:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchChatMessages()
  }, [initialChatId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userQuery = input
    setMessages(prev => [...prev, { role: 'user', content: userQuery, createdAt: new Date() }])
    setInput('')
    setIsTyping(true)

    const aiMessageId = Date.now()
    setMessages(prev => [...prev, { id: aiMessageId, role: 'assistant', content: '', isTyping: true, createdAt: new Date() }])

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${knowledgeBaseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, chatId })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                fullContent += data.content
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: fullContent } : m))
              }
              if (data.chatId) setChatId(data.chatId)
              if (data.done) {
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, isTyping: false, sources: data.sources } : m))
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="relative w-full h-[850px] overflow-hidden rounded-[3rem] bg-slate-950 flex items-center justify-center p-6 font-outfit border border-white/5">
      {/* Aurora Background Layer */}
      <div className="absolute inset-0 aurora-bg opacity-30"></div>

      {/* Main Glass Panel */}
      <motion.div 
        layout
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "relative z-10 w-full max-w-5xl h-full flex flex-col rounded-[2.5rem] glass shadow-2xl overflow-hidden",
          "before:absolute before:inset-0 before:p-[1px] before:rounded-[2.5rem] before:bg-gradient-to-br before:from-aurora-teal/30 before:to-aurora-purple/30 before:-z-10"
        )}
      >
        {/* Holographic Header */}
        <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-3xl">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-aurora-teal to-aurora-purple p-0.5 animate-pulse">
                <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                  <Bot className="w-7 h-7 text-aurora-teal" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_#22c55e]"></div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter">Antigravity AI</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-aurora-teal animate-ping"></span>
                <p className="text-[10px] font-bold text-aurora-teal/70 uppercase tracking-[0.2em]">Neural Engine V2.0 Active</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 transition-all active:scale-95"
            >
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Message Matrix */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-aurora-teal/20 border-t-aurora-teal animate-spin"></div>
                <div className="absolute inset-0 blur-2xl bg-aurora-teal/30 animate-pulse"></div>
              </div>
              <p className="text-sm font-black text-aurora-teal uppercase tracking-[0.4em] animate-pulse">Synchronizing Neural Path...</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={cn(
                  "flex gap-8 group",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl backdrop-blur-3xl border border-white/10",
                  msg.role === 'assistant' ? "bg-aurora-teal/20 text-aurora-teal" : "bg-aurora-purple/20 text-aurora-purple"
                )}>
                  {msg.role === 'assistant' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>

                <div className={cn(
                  "max-w-[80%] flex flex-col",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-7 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl border border-white/10 prose prose-invert max-w-none transition-all hover:border-white/20",
                    msg.role === 'assistant' 
                      ? "bg-slate-900/60 text-slate-100 rounded-tl-none border-l-aurora-teal" 
                      : "bg-gradient-to-br from-aurora-purple/40 to-indigo-700/40 text-white rounded-tr-none border-r-aurora-purple/50"
                  )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                    {msg.isTyping && (
                      <div className="flex gap-2 mt-6">
                        <span className="w-2 h-2 bg-aurora-teal rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-aurora-teal rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-aurora-teal rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    )}
                  </div>
                  
                  {msg.sources && (
                    <div className="mt-5 flex flex-wrap gap-3">
                       {msg.sources.map((src, i) => (
                         <button 
                          key={i}
                          onClick={() => onCitationClick?.(src)}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-aurora-teal/20 border border-white/10 text-[10px] font-black text-aurora-teal uppercase tracking-widest transition-all"
                         >
                           {src.documentName}
                         </button>
                       ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Holographic Input Matrix */}
        <div className="p-10 bg-white/5 backdrop-blur-3xl border-t border-white/10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-aurora-teal to-aurora-purple rounded-[2.5rem] opacity-20 blur-xl group-focus-within:opacity-40 transition-opacity"></div>
            
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Query the Matrix..."
              rows={1}
              className={cn(
                "relative w-full pl-10 pr-36 py-6 rounded-[2.5rem] bg-slate-900/80 border border-white/10 outline-none transition-all resize-none shadow-inner",
                "text-white font-medium placeholder:text-slate-500 focus:bg-slate-900/95 focus:border-aurora-teal/50"
              )}
            />
            
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <button 
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 transition-all active:scale-95"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-5 bg-gradient-to-br from-aurora-teal to-aurora-purple text-white rounded-2xl shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all font-bold group border border-white/20"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Sparkles className="w-3 h-3 text-aurora-teal animate-pulse" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Quantum Core Synced</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
  )
}

export default AntigravityChat
