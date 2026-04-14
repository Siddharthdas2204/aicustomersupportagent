import { SignInButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Bot, Shield, Zap, Moon, Sun } from 'lucide-react'

const LoginPage = ({ toggleDarkMode, isDarkMode }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 font-outfit">
      {/* Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-cyan-500/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-500/20 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Theme Toggle */}
      <button 
        onClick={toggleDarkMode}
        className="absolute top-8 right-8 p-3 rounded-2xl glass hover:scale-110 active:scale-95 transition-all z-50 border border-white/10"
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-300" />}
      </button>

      {/* Brand */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-12"
      >
        <div className="p-3 bg-primary-600 rounded-2xl shadow-xl shadow-primary-500/30">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
          Support<span className="text-primary-600">AI</span>
        </h1>
      </motion.div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-3xl saturate-150 p-10 relative z-10 rounded-[3rem] border border-white/10 shadow-2xl before:absolute before:inset-0 before:p-[1px] before:rounded-[3rem] before:bg-gradient-to-br before:from-cyan-400/50 before:to-purple-500/50 before:-z-10"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Initialize Core</h2>
          <p className="text-slate-400 font-medium">Synchronize your identity to the Antigravity Nexus</p>
        </div>

        <div className="space-y-6">
          <SignInButton mode="modal">
            <button className="w-full py-5 px-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all flex items-center justify-center gap-4 group active:scale-95 shadow-xl backdrop-blur-md">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />
              <span className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-widest text-sm">
                Authenticate Session
              </span>
            </button>
          </SignInButton>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-4 text-slate-500 dark:text-slate-400">Enterprise Security</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center gap-2">
              <Shield className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium dark:text-slate-300">Secure RAG</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium dark:text-slate-300">Fast Stream</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-slate-500 dark:text-slate-500 text-sm italic"
      >
        "Empowering businesses with intelligent support"
      </motion.p>
    </div>
  )
}

export default LoginPage
