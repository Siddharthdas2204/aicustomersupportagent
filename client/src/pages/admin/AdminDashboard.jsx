import { motion } from 'framer-motion'
import { 
  Users, 
  Activity, 
  Server, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  ExternalLink,
  ChevronDown,
  Bot,
  Smile,
  Frown
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '../../utils/cn'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'

const AnalyticCard = ({ label, value, trend, icon: Icon, color }) => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend !== undefined && (
        <div className={cn("flex items-center gap-1 text-sm font-bold", trend >= 0 ? "text-green-500" : "text-red-500")}>
          <TrendingUp className={cn("w-4 h-4", trend < 0 && "rotate-180")} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</p>
    <h3 className="text-3xl font-bold dark:text-white font-outfit">{value}</h3>
  </div>
)

const AdminDashboard = () => {
  const { getToken, userId } = useAuth()
  const [data, setData] = useState({
    users: [],
    chats: [],
    analytics: { totals: {}, activity: [] }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 
          'x-clerk-user-id': userId,
        }
        
        const [usersRes, analyticsRes, chatsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/chats`, { headers })
        ])

        if (usersRes.ok && analyticsRes.ok && chatsRes.ok) {
          const users = await usersRes.json()
          const analytics = await analyticsRes.json()
          const chats = await chatsRes.json()
          setData({ users, analytics, chats })
        }
      } catch (error) {
        console.error('Admin fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) fetchData()
  }, [userId])

  if (loading) return <div className="flex items-center justify-center min-h-[400px]">Loading Admin Data...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header>
        <h1 className="text-4xl font-extrabold dark:text-white mb-2 font-outfit text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500">
          System Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Global administration and infrastructure analytics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticCard label="Total Users" value={data.analytics.totals.users || 0} icon={Users} color="bg-blue-600 shadow-blue-500/30" />
        <AnalyticCard label="Knowledge Bases" value={data.analytics.totals.knowledgeBases || 0} icon={Activity} color="bg-primary-600 shadow-primary-500/30" />
        <AnalyticCard label="Total Documents" value={data.analytics.totals.documents || 0} icon={Smile} color="bg-pink-600 shadow-pink-500/30" />
        <AnalyticCard label="Total Chats" value={data.analytics.totals.chats || 0} icon={ShieldCheck} color="bg-green-600 shadow-green-500/30" />
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold dark:text-white font-outfit">User Sentiment Trends</h2>
            <p className="text-slate-500 text-sm">Real-time satisfaction tracking from chat interactions.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 text-xs font-bold">
              <Smile className="w-4 h-4" /> Positive
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-bold">
              <Frown className="w-4 h-4" /> Negative
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { name: 'Mon', positive: 45, negative: 12 },
              { name: 'Tue', positive: 52, negative: 10 },
              { name: 'Wed', positive: 48, negative: 15 },
              { name: 'Thu', positive: 70, negative: 8 },
              { name: 'Fri', positive: 65, negative: 18 },
              { name: 'Sat', positive: 85, negative: 5 },
              { name: 'Sun', positive: 90, negative: 4 },
            ]}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="positive" stroke="#ec4899" fillOpacity={1} fill="url(#colorPositive)" strokeWidth={3} />
              <Area type="monotone" dataKey="negative" stroke="#f43f5e" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* User Management Table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold dark:text-white font-outfit">Active Users</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-primary-500 transition-all dark:text-white"
                />
                <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button className="btn-secondary py-2 flex items-center gap-2 text-sm">
                Filter <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Stats</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/40 dark:to-indigo-900/40 flex items-center justify-center font-bold text-primary-600 text-sm">
                            {(u.name?.[0] || u.email?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{u.name || 'Anonymous'}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium dark:text-slate-300">{u.role}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{u._count?.knowledgeBases || 0} KBs</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{u._count?.chats || 0} Chats</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Real-time Infrastructure */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold dark:text-white font-outfit">Infrastructure</h2>
          
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary-500" />
                <span className="font-bold dark:text-white text-sm">Response Time</span>
              </div>
              <span className="font-mono text-xs font-bold text-primary-600">342ms</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500 uppercase">CPU Usage</span>
                  <span className="dark:text-slate-400">42%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 w-[42%]"></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500 uppercase">Memory</span>
                  <span className="dark:text-slate-400">68%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[68%]"></div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>Node.js v20 Cluster</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Stable</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden group">
            <Bot className="absolute -top-6 -right-6 w-32 h-32 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">Quick Maintenance</h3>
              <p className="text-slate-400 text-sm mb-6">Flush vector caches or trigger a system-wide re-index.</p>
              <button className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-500 transition-all active:scale-95">
                Optimize Database
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Chat History */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold dark:text-white font-outfit">Platform Chat History</h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Knowledge Base</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Last Message</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.chats.map(chat => (
                  <tr key={chat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold dark:text-white">{chat.user?.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{chat.knowledgeBase?.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-md">
                      {chat.messages?.[chat.messages.length - 1]?.content || 'No messages'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{new Date(chat.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
