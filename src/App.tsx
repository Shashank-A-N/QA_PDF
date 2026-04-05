import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Settings,
  Upload,
  FileText,
  MessageSquare,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Code,
} from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { DocumentViewer } from './components/DocumentViewer';
import { ChatInterface } from './components/ChatInterface';
import { Sidebar } from './components/Sidebar';
import { RAGConfigPanel } from './components/RAGConfigPanel';
import { useStore } from './store/useStore';
import type { Citation } from './types';

type ActivePanel = 'documents' | 'chat' | 'config';

export default function App() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activePanel, setActivePanel] = useState<ActivePanel>('chat');
  const [darkMode, setDarkMode] = useState(false);
  const [highlightedCitations, setHighlightedCitations] = useState<Citation[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const { documents, selectedDocumentId, selectDocument } = useStore();
  const readyDocuments = documents.filter(d => d.status === 'ready');
  
  // Handle citation clicks from chat
  const handleCitationClick = useCallback((citations: Citation[]) => {
    setHighlightedCitations(citations);
    if (citations.length > 0 && citations[0].documentId !== selectedDocumentId) {
      selectDocument(citations[0].documentId);
    }
    // Auto-show document panel on mobile
    setShowSidebar(true);
  }, [selectedDocumentId, selectDocument]);
  

  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`h-screen flex flex-col bg-gray-100 dark:bg-gray-950 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Menu Toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg lg:hidden"
            >
              {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  DocuMind<span className="text-blue-600">AI</span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Advanced Document Q&A System
                </p>
              </div>
            </div>
          </div>
          
          {/* Center Actions */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActivePanel('documents')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activePanel === 'documents'
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Documents
              {readyDocuments.length > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs">
                  {readyDocuments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActivePanel('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activePanel === 'chat'
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActivePanel('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activePanel === 'config'
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hidden lg:flex"
            >
              {showRightPanel ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Document List */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-shrink-0 overflow-hidden border-r border-gray-200 dark:border-gray-800"
            >
              <Sidebar />
            </motion.aside>
          )}
        </AnimatePresence>
        
        {/* Center - Document Viewer / Chat (Mobile: Tab-based) */}
        <main className="flex-1 flex overflow-hidden">
          {/* Mobile: Show based on active panel */}
          <div className="md:hidden flex-1">
            {activePanel === 'documents' && (
              <DocumentViewer highlightedCitations={highlightedCitations} />
            )}
            {activePanel === 'chat' && (
              <ChatInterface onCitationClick={handleCitationClick} />
            )}
            {activePanel === 'config' && <RAGConfigPanel />}
          </div>
          
          {/* Desktop: Split View */}
          <div className="hidden md:flex flex-1">
            {/* Document Viewer */}
            <div className="flex-1 min-w-0">
              <DocumentViewer highlightedCitations={highlightedCitations} />
            </div>
            
            {/* Resizable Divider */}
            <div className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors" />
            
            {/* Right Panel - Chat or Config */}
            <AnimatePresence>
              {showRightPanel && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 450, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="flex-shrink-0 overflow-hidden"
                >
                  {activePanel === 'config' ? (
                    <RAGConfigPanel />
                  ) : (
                    <ChatInterface onCitationClick={handleCitationClick} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActivePanel('documents')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 ${
              activePanel === 'documents' 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">Documents</span>
          </button>
          <button
            onClick={() => setActivePanel('chat')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 ${
              activePanel === 'chat' 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">Chat</span>
          </button>
          <button
            onClick={() => setActivePanel('config')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 ${
              activePanel === 'config' 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>
      
      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Upload Documents
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <FileUpload />
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>Supported: PDF, DOCX, PPTX, Excel, CSV, MD</span>
                    <span>•</span>
                    <span>Max 50MB per file</span>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer - Architecture Info */}
      <footer className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2 hidden lg:block">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              RAG Pipeline Active
            </span>
            <span>•</span>
            <span>Hybrid Search (Dense + Sparse)</span>
            <span>•</span>
            <span>Cross-Encoder Re-ranking</span>
            <span>•</span>
            <span>Semantic Chunking</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Code className="w-4 h-4" />
              View Source
            </a>
            <a
              href="#"
              className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <ExternalLink className="w-4 h-4" />
              Documentation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
