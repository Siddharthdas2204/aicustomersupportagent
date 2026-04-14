import { SignInButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Bot, Shield, Zap, Moon, Sun } from 'lucide-react'

const LoginPage = ({ toggleDarkMode, isDarkMode }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 font-outfit">
      {/* Aurora Background */}
      <div className="absolute inset-0 aurora-bg opacity-40"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

      {/* Brand */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-16 relative z-10"
      >
        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-tr from-aurora-teal to-aurora-purple p-0.5 animate-pulse shadow-2xl shadow-aurora-teal/20">
          <div className="w-full h-full rounded-[1.9rem] bg-slate-900 flex items-center justify-center">
            <Bot className="w-8 h-8 text-aurora-teal" />
          </div>
        </div>
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white font-outfit">
            Support<span className="text-gradient">AI</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.6em] text-aurora-teal/60 font-black">Neural Support Matrix</p>
        </div>
      </motion.div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md glass p-12 relative z-10 rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-aurora-purple/20 blur-[60px] rounded-full"></div>
        
        <div className="text-center mb-12 relative">
          <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Initialize Core</h2>
          <p className="text-slate-400 font-medium text-sm">Authenticate your session to enter the Nexus</p>
        </div>

        <div className="space-y-8 relative">
          <SignInButton mode="modal">
            <button className="btn-aurora w-full flex items-center justify-center gap-4 group">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="uppercase tracking-[0.2em] text-sm font-black">
                Connect Identity
              </span>
            </button>
          </SignInButton>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.4em] text-slate-500">
              <span className="px-4 bg-transparent backdrop-blur-md">Secure Protocol</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 flex flex-col items-center gap-3 border-white/5 bg-white/[0.02]">
              <div className="p-2.5 rounded-xl bg-aurora-teal/10">
                <Zap className="w-5 h-5 text-aurora-teal" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-300">Fast Sync</span>
            </div>
            <div className="glass-card p-5 flex flex-col items-center gap-3 border-white/5 bg-white/[0.02]">
              <div className="p-2.5 rounded-xl bg-aurora-purple/10">
                <Shield className="w-5 h-5 text-aurora-purple" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-300">Quantum Enc</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 flex items-center gap-3 relative z-10"
      >
        <div className="w-2 h-2 rounded-full bg-aurora-teal animate-ping"></div>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-black">
          Global Intelligence Network Online
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage
