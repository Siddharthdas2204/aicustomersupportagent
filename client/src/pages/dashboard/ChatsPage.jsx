import { motion } from 'framer-motion'
import { MessageSquare, Clock, ArrowRight, Trash2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { cn } from '../../utils/cn'

const ChatsPage = () => {
  const { user } = useUser()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch real chats from backend
  const fetchChats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/user/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setChats(data)
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchChats()
  }, [user])

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header>
        <h1 className="text-4xl font-extrabold dark:text-white mb-2 font-outfit">Recent Chats</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Browse and resume your past support conversations.</p>
      </header>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400 font-medium italic">Loading your history...</div>
        ) : chats.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {chats.map((chat) => (
              <Link 
                key={chat.id} 
                to={`/kb/${chat.knowledgeBaseId}?chatId=${chat.id}`}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl group-hover:bg-primary-600 transition-colors">
                    <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
                      {chat.title || 'Untitled Conversation'}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="font-semibold text-primary-500">{chat.knowledgeBase?.name}</span>
                      <span>•</span>
                      <span>{new Date(chat.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">No conversations found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">Start a new chat by selecting a knowledge base from your dashboard.</p>
            <Link to="/" className="btn-primary inline-flex">Go to Dashboard</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatsPage
