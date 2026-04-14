import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  File, 
  Trash2, 
  Search, 
  ArrowLeft, 
  MoreVertical, 
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  X,
  Sparkles
} from 'lucide-react'
import ChatWindow from '../../components/chat/ChatWindow'
import AntigravityChat from '../../components/chat/AntigravityChat'
import { cn } from '../../utils/cn'
import { useAuth } from '@clerk/clerk-react'

const FileItem = ({ file, onDelete }) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl mb-3 group hover:border-primary-500/30 transition-all shadow-sm">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
        <FileText className="w-5 h-5 text-slate-400 group-hover:text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{file.name}</p>
        <p className="text-xs text-slate-500">{file.size} • {file.date}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-[10px] font-bold text-green-600 uppercase tracking-tight">
        Indexed
      </div>
      <button 
        onClick={() => onDelete(file.id)}
        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
)

const KnowledgeBasePage = () => {
  const { id } = useParams()
  const [kb, setKb] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [activeCitation, setActiveCitation] = useState(null)
  const [isAntigravityMode, setIsAntigravityMode] = useState(true)

  const fetchKB = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/knowledge-bases/${id}`)
      if (response.ok) {
        const data = await response.json()
        setKb(data)
        setFiles(data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching KB:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKB()
  }, [id])

  const handleUpload = async (e) => {
    const uploadedFiles = e.target.files
    if (!uploadedFiles || uploadedFiles.length === 0) return

    setIsUploading(true)
    const formData = new FormData()
    for (let i = 0; i < uploadedFiles.length; i++) {
      formData.append('files', uploadedFiles[i])
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/${id}`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        fetchKB()
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Check console for details.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/document/${fileId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchKB()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!kb) {
    return <div className="text-center p-20 text-slate-500">Knowledge Base not found.</div>
  }

  const [searchParams] = useSearchParams()
  const initialChatId = searchParams.get('chatId')

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/">
            <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:scale-110 active:scale-95 transition-all text-slate-600 dark:text-slate-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold dark:text-white font-outfit">{kb.name}</h1>
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-bold rounded-full uppercase tracking-widest">Active KB</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">{kb.description || 'Manage documents and chat with your synchronized data.'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAntigravityMode(!isAntigravityMode)}
            className={cn(
              "px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all",
              isAntigravityMode 
                ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20" 
                : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800"
            )}
          >
            <Sparkles className={cn("w-4 h-4", isAntigravityMode ? "animate-spin-slow" : "")} />
            {isAntigravityMode ? "ANTIGRAVITY ON" : "ANTIGRAVITY OFF"}
          </button>
          <button className="p-3 glass hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
        {/* Document Management */}
        <div className="xl:col-span-2 space-y-8">
          {/* Upload Zone */}
          <section className="glass-card p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-primary-500 transition-all relative group overflow-hidden">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleUpload}
              multiple
            />
            <div className="flex flex-col items-center text-center">
              <div className="p-5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-2">Upload Documents</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">Drag and drop PDF, TXT or Document Images (JPG/PNG) to train your AI.</p>
              
              <AnimatePresence>
                {isUploading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                  >
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                        className="h-full bg-primary-600"
                      />
                    </div>
                    <span className="text-xs font-bold text-primary-600 whitespace-nowrap">Parsing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Files List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                <File className="w-5 h-5 text-primary-500" /> Loaded Files
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{files.length} Total</span>
            </div>
            <div className="custom-scrollbar max-h-[400px] overflow-y-auto pr-2">
              {files.map(file => <FileItem key={file.id} file={file} onDelete={handleDelete} />)}
              {files.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 glass-card">
                  <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium italic">No files uploaded yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* System Health */}
          <div className="glass-card p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Synchronization Status</h4>
                <p className="text-xs text-slate-500">All documents are indexed and ready for retrieval.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className={cn(
          "transition-all duration-500",
          activeCitation ? "xl:col-span-2" : "xl:col-span-3"
        )}>
          {isAntigravityMode ? (
            <AntigravityChat 
              knowledgeBaseId={id} 
              initialChatId={initialChatId}
              onCitationClick={(citation) => setActiveCitation(citation)}
            />
          ) : (
            <ChatWindow 
              knowledgeBaseId={id} 
              initialChatId={initialChatId}
              onCitationClick={(citation) => setActiveCitation(citation)}
            />
          )}
        </div>

        {/* Split Screen Citation Viewer */}
        <AnimatePresence>
          {activeCitation && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="xl:col-span-1 glass-card h-[600px] flex flex-col overflow-hidden border-l-4 border-primary-500"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-sm truncate dark:text-white">{activeCitation.documentName}</h3>
                <button 
                  onClick={() => setActiveCitation(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30">
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800 mb-4">
                  <p className="text-[10px] font-bold text-primary-600 uppercase mb-2 tracking-widest">Reference Fragment</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "...{activeCitation.text || 'Document content reference found in knowledge base.'}..."
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default KnowledgeBasePage
