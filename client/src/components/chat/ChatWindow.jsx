import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, Copy, ThumbsUp, RotateCcw, Search, Mic, MicOff, Share2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const Message = ({ message, onCitationClick }) => {
  const isBot = message.role === 'assistant'
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 mb-8",
        isBot ? "flex-row" : "flex-row-reverse"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
        isBot ? "bg-primary-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
      )}>
        {isBot ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
      </div>
      
      <div className={cn(
        "max-w-[80%] flex flex-col",
        isBot ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "p-5 rounded-2xl shadow-sm prose dark:prose-invert max-w-none",
          isBot 
            ? "glass-card text-slate-800 dark:text-slate-200 rounded-tl-none" 
            : "bg-primary-600 text-white rounded-tr-none"
        )}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
          
          {message.isTyping && (
            <div className="flex gap-1 mt-2">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          )}
        </div>

        {isBot && message.sources && (
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
              <Search className="w-3 h-3" />
              Sources:
            </div>
            {message.sources.map((src, idx) => (
              <button 
                key={idx} 
                onClick={() => onCitationClick?.(src)}
                className="px-2.5 py-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-500 hover:text-white transition-colors"
              >
                {src.documentName}
              </button>
            ))}
          </div>
        )}

        {isBot && !message.isTyping && (
          <div className="mt-2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 px-2 text-xs text-slate-400 hover:text-primary-600 flex items-center gap-1">
              <Copy className="w-3 h-3" /> Copy
            </button>
            <button className="p-1 px-2 text-xs text-slate-400 hover:text-primary-600 flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" /> Helpful
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const ChatWindow = ({ knowledgeBaseId, onCitationClick }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Knowledge Assistant. Ask me anything about this knowledge base.', createdAt: new Date() }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [chatId, setChatId] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userQuery = input
    const userMessage = { role: 'user', content: userQuery, createdAt: new Date() }
    setMessages(prev => [...prev, userMessage])
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
              if (data.error) {
                setMessages(prev => prev.map(m => 
                  m.id === aiMessageId ? { ...m, content: `Error: ${data.error}`, isTyping: false } : m
                ))
              }
              if (data.content) {
                fullContent += data.content
                setMessages(prev => prev.map(m => 
                  m.id === aiMessageId ? { ...m, content: fullContent } : m
                ))
              }
              if (data.chatId) setChatId(data.chatId)
              if (data.done) {
                setMessages(prev => prev.map(m => 
                  m.id === aiMessageId ? { ...m, isTyping: false, sources: data.sources } : m
                ))
              }
            } catch (e) { /* partial json ignore */ }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }
    recognition.start()
  }

  const handleShare = async () => {
    if (!chatId) {
      alert("Start a conversation first to generate a shareable link!")
      return
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: true })
      })
      const data = await res.json()
      const shareUrl = `${window.location.origin}/share/${data.shareId}`
      navigator.clipboard.writeText(shareUrl)
      alert("Shareable link copied to clipboard!")
    } catch (e) {
      alert("Failed to generate share link")
    }
  }

  return (
    <div className="flex flex-col h-[600px] glass-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-bold dark:text-white text-sm">AI Agent Active</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
            title="Share Chat"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30"
      >
        {messages.map((msg, idx) => (
          <Message 
            key={idx} 
            message={msg} 
            onCitationClick={onCitationClick} 
          />
        ))}
      </div>

      {/* Input */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="relative group">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask a question..."
            rows={1}
            className="w-full pl-6 pr-16 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all resize-none dark:text-white font-medium"
          />
          <button 
            onClick={startVoiceInput}
            className={cn(
              "absolute right-14 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all",
              isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 disabled:opacity-50 disabled:bg-slate-400 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center mt-3 text-slate-400 uppercase tracking-widest font-bold">
          <Sparkles className="w-3 h-3 inline mr-1 mb-0.5" /> Core Intelligence Powered by GPT-4o
        </p>
      </div>
    </div>
  )
}

export default ChatWindow
