import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react'
import LoginPage from './pages/auth/LoginPage'
import UserDashboard from './pages/dashboard/UserDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import KnowledgeBasePage from './pages/dashboard/KnowledgeBasePage'
import ChatsPage from './pages/dashboard/ChatsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import SharedChatPage from './pages/public/SharedChatPage'
import WidgetView from './pages/public/WidgetView'
import DashboardLayout from './components/layout/DashboardLayout'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children, toggleDarkMode, isDarkMode }) => {
  return (
    <>
      <SignedIn>
        <DashboardLayout toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode}>
          {children}
        </DashboardLayout>
      </SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  )
}

function App() {
  const { isLoaded } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={
          <>
            <SignedIn>
              <Navigate to="/" replace />
            </SignedIn>
            <SignedOut>
              <LoginPage toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
            </SignedOut>
          </>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode}>
            <UserDashboard />
          </ProtectedRoute>
        } />

        <Route path="/kb/:id" element={
          <ProtectedRoute toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode}>
            <KnowledgeBasePage />
          </ProtectedRoute>
        } />

        <Route path="/chats" element={
          <ProtectedRoute toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode}>
            <ChatsPage />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode}>
            <SettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Public Routes */}
        <Route path="/share/:shareId" element={<SharedChatPage />} />
        <Route path="/widget/:kbId" element={<WidgetView />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
