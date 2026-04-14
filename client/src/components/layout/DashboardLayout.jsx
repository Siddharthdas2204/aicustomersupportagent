import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Database, 
  Settings, 
  BarChart3, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Moon, 
  Sun, 
  Plus,
  Bot
} from 'lucide-react'
import { cn } from '../../utils/cn'

const SidebarItem = ({ icon: Icon, label, href, active, collapsed }) => (
  <Link to={href}>
    <motion.div 
      className={cn(
        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all mb-1 cursor-pointer group",
        active 
          ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-white" : "group-hover:scale-110 transition-transform")} />
      {!collapsed && <span className="font-semibold tracking-wide">{label}</span>}
    </motion.div>
  </Link>
)

const DashboardLayout = ({ children, toggleDarkMode, isDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { user } = useUser()
  
  // Secure admin check - Only the specific owner or users with explicit 'admin' role metadata
  const isAdmin = user?.publicMetadata?.role === 'admin' || 
                  user?.emailAddresses[0]?.emailAddress === 'siddharthdas2204@gmail.com'

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: MessageSquare, label: 'Recent Chats', href: '/chats' },
    { icon: Plus, label: 'Upload Files', href: '/upload' },
    ...(isAdmin ? [{ icon: BarChart3, label: 'Admin Analytics', href: '/admin' }] : []),
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden aurora-bg">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 100 : 280 }}
        className="h-full glass border-r border-white/10 flex flex-col p-6 relative z-50 overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-10 px-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-aurora-teal to-aurora-purple p-0.5 animate-pulse">
            <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
              <Bot className="w-6 h-6 text-aurora-teal" />
            </div>
          </div>
          {!collapsed && (
            <h2 className="text-2xl font-black font-outfit text-gradient tracking-tighter">SupportAI</h2>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.href}
              {...item}
              active={location.pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
          <div className={cn("flex items-center gap-4 px-2", collapsed ? "justify-center" : "")}>
            <UserButton afterSignOutUrl="/login" appearance={{ elements: { userButtonAvatarBox: "w-12 h-12 rounded-2xl border border-white/10" }}} />
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-sm text-white truncate">{user?.fullName || 'User'}</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 truncate">Quantum User</span>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-10 -right-3 p-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl text-slate-400 hover:text-aurora-teal transition-all"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative custom-scrollbar p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}

export default DashboardLayout
