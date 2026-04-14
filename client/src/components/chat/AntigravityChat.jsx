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
    <div className="relative w-full h-[800px] overflow-hidden rounded-[40px] bg-slate-950 flex items-center justify-center p-8 font-outfit">
      {/* Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingOrbs.map(orb => (
          <motion.div
            key={orb.id}
            animate={{
              x: [orb.x + '%', (orb.x + 10) + '%', orb.x + '%'],
              y: [orb.y + '%', (orb.y + 15) + '%', orb.y + '%'],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute rounded-full blur-[100px] opacity-20"
            style={{
              width: orb.size,
              height: orb.size,
              background: orb.id % 2 === 0 ? 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' : 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
              left: orb.x + '%',
              top: orb.y + '%'
            }}
          />
        ))}
        {/* Star Particles */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Main Glass Panel */}
      <motion.div 
        layout
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "relative z-10 w-full max-w-4xl h-full flex flex-col rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden",
          "bg-white/5 backdrop-blur-3xl saturate-150",
          "before:absolute before:inset-0 before:p-[1px] before:rounded-[2.5rem] before:bg-gradient-to-br before:from-cyan-400/50 before:to-purple-500/50 before:-z-10"
        )}
      >
        {/* Holographic Header */}
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-500 p-0.5 animate-pulse">
                <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-bounce"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Antigravity AI</h2>
              <p className="text-xs font-bold text-cyan-400/70 uppercase tracking-widest">Quantum Engine Active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sync: Locked</span>
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-95"
            >
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Floating Icons (Orbiting Effect) */}
        {!isExpanded && (
           <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {[Share2, Settings, Copy, Search].map((Icon, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    x: [0, 20, -20, 0],
                    y: [0, -20, 20, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 10 + idx * 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute pointer-events-auto cursor-pointer p-3 rounded-2xl bg-white/10 border border-white/20 text-cyan-400/50 hover:text-cyan-400 hover:bg-white/20 transition-all shadow-xl backdrop-blur-md"
                  style={{
                    left: 20 + idx * 20 + '%',
                    top: 10 + idx * 10 + '%'
                  }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
             ))}
           </div>
        )}

        {/* Message Matrix */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                <div className="absolute inset-0 blur-xl bg-cyan-500/50 animate-pulse"></div>
              </div>
              <p className="text-sm font-bold text-cyan-400 uppercase tracking-[0.2em] animate-pulse">Decrypting Connection...</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={idx}
                className={cn(
                  "flex gap-6 group",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl backdrop-blur-xl border border-white/10",
                  msg.role === 'assistant' ? "bg-cyan-500/20 text-cyan-400" : "bg-purple-500/20 text-purple-400"
                )}>
                  {msg.role === 'assistant' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>

                <div className={cn(
                  "max-w-[75%] flex flex-col",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-6 rounded-[2rem] shadow-2xl backdrop-blur-2xl border border-white/10 prose prose-invert max-w-none transition-all",
                    msg.role === 'assistant' 
                      ? "bg-slate-900/40 text-slate-100 rounded-tl-none border-l-cyan-500/50" 
                      : "bg-gradient-to-br from-purple-600/40 to-indigo-700/40 text-white rounded-tr-none border-r-purple-500/50"
                  )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                    {msg.isTyping && (
                      <div className="flex gap-2 mt-4">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    )}
                  </div>
                  
                  {msg.sources && (
                    <div className="mt-4 flex flex-wrap gap-2">
                       {msg.sources.map((src, i) => (
                         <button 
                          key={i}
                          onClick={() => onCitationClick?.(src)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-[10px] font-bold text-cyan-400 uppercase tracking-widest transition-all"
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
        <div className="p-8 bg-white/5 border-t border-white/10">
          <div className="relative group">
            {/* Glowing Orbit around Input */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-[2rem] opacity-20 blur group-focus-within:opacity-40 transition-opacity"></div>
            
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Input query for the AI Nexus..."
              rows={1}
              className={cn(
                "relative w-full pl-8 pr-32 py-5 rounded-[2rem] bg-slate-900/60 border border-white/10 outline-none transition-all resize-none",
                "text-white font-medium placeholder:text-slate-500 focus:bg-slate-900/80"
              )}
            />
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all active:scale-95"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-4 bg-gradient-to-br from-cyan-500 to-purple-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all font-bold group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Core Intelligence Synchronized (Gemini Ultra)</p>
          </div>
        </div>
      </motion.div>
      
      {/* Floating Orbital Avatar Orb */}
      <motion.div
        animate={{
          y: [-20, 20, -20],
          rotate: 360
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-20 right-20 w-32 h-32 pointer-events-none"
      >
        <div className="w-full h-full rounded-full bg-cyan-500/20 border border-cyan-400/30 blur-sm animate-pulse"></div>
        <div className="absolute inset-4 rounded-full bg-purple-500/20 border border-purple-400/30 blur-md animate-pulse [animation-delay:1s]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_20px_#fff] animate-ping"></div>
        </div>
      </motion.div>
    </div>
  )
}

export default AntigravityChat
