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
    <div className="flex h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 100 : 280 }}
        className="h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col p-6 relative z-50 overflow-hidden"
      >
        {/* Background Gradient for Sidebar */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-primary-600 rounded-xl">
            <Bot className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <h2 className="text-xl font-bold dark:text-white font-outfit">SupportAI</h2>
          )}
        </div>

        <nav className="flex-1">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.href}
              {...item}
              active={location.pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
          <button 
            onClick={toggleDarkMode}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-500 group-hover:-rotate-12 transition-transform" />
            )}
            {!collapsed && <span className="font-semibold text-slate-700 dark:text-slate-300">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          
          <div className={cn("flex items-center gap-4 px-2", collapsed ? "justify-center" : "")}>
            <UserButton afterSignOutUrl="/login" appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 rounded-xl" }}} />
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{user?.fullName || 'User'}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-10 -right-3 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-400 hover:text-primary-600 transition-all"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 relative custom-scrollbar">
        {/* Subtle Background Elements */}
        <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
