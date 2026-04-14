import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, FileText, Loader2, CheckCircle2, ChevronRight, Plus } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn'

const UploadPage = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const [kbs, setKbs] = useState([])
  const [selectedKb, setSelectedKb] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [loadingKbs, setLoadingKbs] = useState(true)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

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
        if (data.length > 0) setSelectedKb(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching KBs:', error)
    } finally {
      setLoadingKbs(false)
    }
  }

  useEffect(() => {
    if (user) fetchKBs()
  }, [user])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  const uploadFiles = async (files) => {
    if (!selectedKb) {
      alert("Please select or create a knowledge base first.")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/${selectedKb}`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        // Add to local list of uploaded files for this session
        const newFiles = Array.from(files).map(f => ({
          name: f.name,
          size: (f.size / 1024).toFixed(1) + ' KB',
          status: 'Success'
        }))
        setUploadedFiles(prev => [...newFiles, ...prev])
      } else {
        alert("Upload failed")
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header>
        <h1 className="text-4xl font-extrabold dark:text-white mb-2 font-outfit">Upload Documents</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Add new knowledge to your AI support agent.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Target Knowledge Base</h3>
            {loadingKbs ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            ) : (
              <div className="space-y-2">
                {kbs.map(kb => (
                  <button
                    key={kb.id}
                    onClick={() => setSelectedKb(kb.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                      selectedKb === kb.id 
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30" 
                        : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <span className="font-bold text-sm truncate">{kb.name}</span>
                    <ChevronRight className={cn("w-4 h-4", selectedKb === kb.id ? "opacity-100" : "opacity-0")} />
                  </button>
                ))}
                <Link to="/" className="block">
                  <button className="w-full flex items-center gap-2 p-3 text-primary-600 text-sm font-bold hover:underline">
                    <Plus className="w-4 h-4" /> Create New KB
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-indigo-900 text-white relative overflow-hidden">
            <h4 className="font-bold mb-1">Upload Limits</h4>
            <p className="text-xs text-indigo-200">Free Tier: 5MB per file • PDF/TXT only.</p>
            <div className="mt-4 h-1.5 w-full bg-indigo-950 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 w-1/3"></div>
            </div>
            <p className="text-[10px] mt-2 text-indigo-300">3.2MB / 10MB Used</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <section 
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
            className={cn(
              "relative glass-card p-12 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center group",
              dragActive ? "border-primary-500 bg-primary-50/10 scale-[1.02]" : "border-slate-300 dark:border-slate-800 hover:border-primary-500"
            )}
          >
            <input 
              type="file" 
              multiple 
              onChange={(e) => uploadFiles(e.target.files)} 
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className={cn(
              "p-6 rounded-3xl mb-6 transition-all",
              dragActive ? "bg-primary-500 text-white scale-110" : "bg-primary-50 dark:bg-primary-900/20 text-primary-600 group-hover:scale-110"
            )}>
              <Upload className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold dark:text-white mb-2">Drop your files here</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">Support for PDF and TXT. Maximum file size 5MB.</p>
            
            {isUploading && (
              <div className="mt-8 w-full max-w-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-primary-600 uppercase">Synchronizing...</span>
                  <span className="text-xs font-bold text-primary-600 animate-pulse">Wait</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-full bg-primary-500"
                  />
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <File className="w-5 h-5 text-indigo-500" /> Recent Uploads
            </h3>
            <div className="space-y-3">
              {uploadedFiles.map((file, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className="flex items-center justify-between p-4 glass-card"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-bold dark:text-white">{file.name}</p>
                      <p className="text-xs text-slate-500">{file.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Ready</span>
                  </div>
                </motion.div>
              ))}
              {uploadedFiles.length === 0 && (
                <div className="p-10 text-center glass-card border-none bg-slate-50/50 dark:bg-slate-900/50">
                  <p className="text-slate-400 text-sm italic">New uploads will appear here.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default UploadPage
