import { Plus, Database, Clock, ArrowRight, FileText, Globe, MessageSquare, Zap, Bot, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useUser, useAuth } from '@clerk/clerk-react'
import { cn } from '../../utils/cn'
import { useState, useEffect } from 'react'

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="glass-card p-6 flex items-center justify-between">
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-2xl font-bold dark:text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
)

const KnowledgeBaseCard = ({ kb }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card overflow-hidden group border-2 border-transparent hover:border-primary-500/50 transition-all"
  >
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl group-hover:bg-primary-600 transition-colors">
          <Database className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-white" />
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
          {kb.documentsCount} Docs
        </span>
      </div>
      <h3 className="text-xl font-bold dark:text-white mb-2 font-outfit truncate">{kb.name}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">{kb.description || 'No description provided.'}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex -space-x-2">
          {[1, 2, 3].slice(0, kb.documentsCount).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
            </div>
          ))}
        </div>
        <Link to={`/kb/${kb.id}`}>
          <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary-600 dark:hover:bg-primary-600 hover:text-white rounded-lg transition-all group/btn">
            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
    </div>
  </motion.div>
)

const UserDashboard = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [kbs, setKbs] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newKbName, setNewKbName] = useState('')

  const fetchKBs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/knowledge-bases`, {
        headers: {
          'x-clerk-user-id': user?.id,
          'x-clerk-email': user?.primaryEmailAddress?.emailAddress || '',
          'x-clerk-name': user?.fullName || ''
        }
      })
      if (response.ok) {
        const data = await response.json()
        setKbs(data)
      }
    } catch (error) {
      console.error('Error fetching KBs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchKBs()
  }, [user])

  const handleCreateKB = async (e) => {
    e?.preventDefault()
    if (!newKbName.trim()) return

    setCreating(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/knowledge-bases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-clerk-user-id': user?.id,
          'x-clerk-email': user?.primaryEmailAddress?.emailAddress || '',
          'x-clerk-name': user?.fullName || ''
        },
        body: JSON.stringify({ name: newKbName, description: 'Newly created knowledge base.' })
      })

      if (response.ok) {
        setNewKbName('')
        setShowModal(false)
        fetchKBs()
      }
    } catch (error) {
      console.error('Error creating KB:', error)
    } finally {
      setCreating(false)
    }
  }

  const [recentChats, setRecentChats] = useState([])

  const fetchRecentChats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/user/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setRecentChats(data.slice(0, 5)) // Get last 5 chats
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchKBs()
      fetchRecentChats()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold dark:text-white mb-2 font-outfit">Welcome, {user?.firstName || 'User'}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your knowledge bases and optimize your support agent.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          Create New Knowledge Base
        </button>
      </header>

      {/* Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl z-10"
            >
              <h2 className="text-2xl font-bold dark:text-white mb-6">New Knowledge Base</h2>
              <form onSubmit={handleCreateKB} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase">KB Name</label>
                  <input 
                    autoFocus
                    value={newKbName}
                    onChange={(e) => setNewKbName(e.target.value)}
                    placeholder="e.g. Product Documentation"
                    className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={creating || !newKbName.trim()}
                    className="flex-1 btn-primary py-4 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create KB'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Chats" value="0" icon={MessageSquare} color="bg-blue-500 shadow-blue-500/20" />
        <StatCard label="Knowledge Bases" value={kbs.length.toString()} icon={Database} color="bg-primary-500 shadow-primary-500/20" />
        <StatCard label="Success Rate" value="-" icon={Zap} color="bg-yellow-500 shadow-yellow-500/20" />
        <StatCard label="System Status" value="Online" icon={Globe} color="bg-green-500 shadow-green-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* KB Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold dark:text-white font-outfit">Your Knowledge Bases</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kbs.map(kb => <KnowledgeBaseCard key={kb.id} kb={kb} />)}
            <motion.div 
              whileHover={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-10 hover:border-primary-500 transition-colors cursor-pointer group min-h-[220px]"
            >
              <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-4 group-hover:bg-primary-500/10 transition-colors">
                <Plus className="w-8 h-8 text-slate-400 group-hover:text-primary-600" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white">Add New KB</p>
            </motion.div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold dark:text-white font-outfit">Recent Chats</h2>
            <Link to="/chats" className="text-xs font-bold text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentChats.map(chat => (
              <Link key={chat.id} to={`/kb/${chat.knowledgeBaseId}?chatId=${chat.id}`} className="block">
                <div className="glass-card p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-l-4 border-primary-500">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{chat.title || 'Untitled Chat'}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{chat.knowledgeBase?.name}</span>
                    <span className="text-[10px] text-slate-400">{new Date(chat.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
            {recentChats.length === 0 && (
              <div className="glass-card p-8 text-center text-slate-500 text-sm italic">
                No recent chats found.
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
              <p className="text-primary-50 text-sm mb-4">Unlimited files and advanced analytics.</p>
              <button className="w-full py-2 bg-white text-primary-700 font-bold rounded-lg hover:bg-primary-50 transition-colors">Go Premium</button>
            </div>
            <Bot className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 -rotate-12" />
          </div>
        </div>
      </div>
    </div>
  )
}


export default UserDashboard
