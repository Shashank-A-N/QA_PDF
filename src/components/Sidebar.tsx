import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  ChevronRight,
  ChevronDown,
  Trash2,
  Eye,
  MoreVertical,
  Check,
  Clock,
  Image,
  Table,
  Scan,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Document, DocumentType, ProcessingStatus } from '../types';

function getFileIcon(type: DocumentType) {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'pdf':
      return <FileText className={`${iconClass} text-red-500`} />;
    case 'docx':
      return <FileText className={`${iconClass} text-blue-500`} />;
    case 'pptx':
      return <Presentation className={`${iconClass} text-orange-500`} />;
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className={`${iconClass} text-green-500`} />;
    default:
      return <File className={`${iconClass} text-gray-500`} />;
  }
}

function getStatusIcon(status: ProcessingStatus) {
  switch (status) {
    case 'uploading':
    case 'parsing':
    case 'chunking':
    case 'embedding':
      return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />;
    case 'ready':
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-3 h-3 text-red-500" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

interface DocumentItemProps {
  document: Document;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function DocumentItem({ document, isSelected, onSelect, onRemove }: DocumentItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="relative">
      <motion.div
        layout
        className={`
          group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
          ${isSelected 
            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
          }
        `}
        onClick={onSelect}
      >
        {/* Expand Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-gray-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-400" />
          )}
        </button>
        
        {/* File Icon */}
        {getFileIcon(document.type)}
        
        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}>
              {document.name}
            </p>
            {getStatusIcon(document.status)}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatFileSize(document.size)}</span>
            {document.pageCount && (
              <>
                <span>•</span>
                <span>{document.pageCount} pages</span>
              </>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </motion.div>
      
      {/* Context Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-full mt-1 z-20 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => {
                  onSelect();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <button
                onClick={() => {
                  onRemove();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-10 mt-1 mb-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs space-y-2">
              {/* Upload Time */}
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Uploaded {formatDate(document.uploadedAt)}</span>
              </div>
              
              {/* Document Features */}
              {document.metadata && (
                <div className="flex flex-wrap gap-2">
                  {document.metadata.hasImages && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      <Image className="w-3 h-3" />
                      Images
                    </span>
                  )}
                  {document.metadata.hasTables && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                      <Table className="w-3 h-3" />
                      Tables
                    </span>
                  )}
                  {document.metadata.hasOCR && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                      <Scan className="w-3 h-3" />
                      OCR
                    </span>
                  )}
                </div>
              )}
              
              {/* Processing Status */}
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                {document.status === 'ready' ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Ready for queries</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="capitalize">{document.status}...</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const { documents, selectedDocumentId, selectDocument, removeDocument } = useStore();
  const [filter, setFilter] = useState<'all' | 'ready' | 'processing'>('all');
  
  const filteredDocuments = documents.filter(doc => {
    if (filter === 'ready') return doc.status === 'ready';
    if (filter === 'processing') return ['uploading', 'parsing', 'chunking', 'embedding'].includes(doc.status);
    return true;
  });
  
  const readyCount = documents.filter(d => d.status === 'ready').length;
  const processingCount = documents.filter(d => ['uploading', 'parsing', 'chunking', 'embedding'].includes(d.status)).length;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Documents</h2>
        
        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            All ({documents.length})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'ready'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Ready ({readyCount})
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'processing'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Processing ({processingCount})
          </button>
        </div>
      </div>
      
      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {filter === 'all' 
                ? 'No documents uploaded' 
                : filter === 'ready'
                ? 'No ready documents'
                : 'No documents processing'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredDocuments.map((doc) => (
              <DocumentItem
                key={doc.id}
                document={doc}
                isSelected={doc.id === selectedDocumentId}
                onSelect={() => selectDocument(doc.id)}
                onRemove={() => removeDocument(doc.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer Stats */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{readyCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Documents Ready</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {documents.reduce((acc, d) => acc + (d.pageCount || 0), 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Pages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
