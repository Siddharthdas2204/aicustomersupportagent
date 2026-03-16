import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, User, Clock, Share2, Shield } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../utils/cn'

const SharedChatPage = () => {
  const { shareId } = useParams()
  const [chat, setChat] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/shared/${shareId}`)
        if (res.ok) {
          const data = await res.json()
          setChat(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchSharedChat()
  }, [shareId])

  if (loading) return <div className="h-screen flex items-center justify-center font-outfit text-slate-500">Loading Shared Conversation...</div>
  if (!chat) return <div className="h-screen flex items-center justify-center font-outfit text-red-500">This shared chat is no longer available.</div>

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 flex items-center justify-between glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-600 rounded-2xl text-white">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold dark:text-white font-outfit">{chat.title || 'Shared Conversation'}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Shield className="w-3 h-3" /> Secure Read-Only Link • {new Date(chat.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="hidden md:block">
             <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-bold uppercase">Archive Viewer</span>
          </div>
        </header>

        <div className="space-y-8">
          {chat.messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4",
                msg.role === 'assistant' ? "flex-row" : "flex-row-reverse"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                msg.role === 'assistant' ? "bg-primary-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              )}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={cn(
                "max-w-[85%] p-5 rounded-2xl shadow-sm prose dark:prose-invert",
                msg.role === 'assistant' ? "glass-card text-slate-800 dark:text-slate-200" : "bg-primary-600 text-white"
              )}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            </motion.div>
          ))}
        </div>

        <footer className="mt-20 text-center py-10 border-t border-slate-200 dark:border-slate-800">
           <p className="text-sm text-slate-500 mb-4">Want to create your own AI Assistant?</p>
           <button className="btn-primary text-sm">Join SupportAI</button>
        </footer>
      </div>
    </div>
  )
}

export default SharedChatPage
