import { motion } from 'framer-motion'
import { User, Shield, Bell, Key, Trash2, Save } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'

const SettingsPage = () => {
  const { user } = useUser()

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header>
        <h1 className="text-4xl font-extrabold dark:text-white mb-2 font-outfit">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your account and support agent configuration.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <button className="w-full p-4 rounded-2xl bg-primary-600 text-white font-bold flex items-center gap-3 shadow-lg shadow-primary-600/20">
            <User className="w-5 h-5" /> Profile
          </button>
          <button className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-3 hover:bg-slate-50 transition-colors">
            <Shield className="w-5 h-5 text-slate-400" /> Security
          </button>
          <button className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-3 hover:bg-slate-50 transition-colors">
            <Key className="w-5 h-5 text-slate-400" /> API Keys
          </button>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="glass-card p-10">
            <h2 className="text-2xl font-bold dark:text-white mb-8">Profile Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6 mb-8">
                <img src={user?.imageUrl} alt="Profile" className="w-20 h-20 rounded-2xl shadow-xl" />
                <div>
                  <h3 className="text-xl font-bold dark:text-white">{user?.fullName}</h3>
                  <p className="text-slate-500 text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase">First Name</label>
                  <input readOnly value={user?.firstName} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase">Last Name</label>
                  <input readOnly value={user?.lastName} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase">Email Address</label>
                <input readOnly value={user?.primaryEmailAddress?.emailAddress} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white" />
              </div>

              <button className="btn-primary flex items-center gap-2 mt-8">
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </div>
          </div>

          <div className="glass-card p-10 border-red-500/20">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Danger Zone</h2>
            <p className="text-slate-500 mb-6">Permanently delete your account and all associated knowledge bases.</p>
            <button className="px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
