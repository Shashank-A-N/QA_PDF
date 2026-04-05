import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { DocumentType, ProcessingStatus } from '../types';
import { useStore } from '../store/useStore';
import { createChunks, getSampleContent } from '../lib/ragPipeline';

const ACCEPTED_FORMATS: Record<string, DocumentType> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv',
  'text/markdown': 'markdown',
  'text/plain': 'txt',
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface FileWithStatus {
  file: File;
  status: ProcessingStatus;
  error?: string;
  documentId?: string;
}

function getFileIcon(type: DocumentType) {
  switch (type) {
    case 'pdf':
    case 'docx':
    case 'txt':
    case 'markdown':
      return <FileText className="w-5 h-5" />;
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="w-5 h-5" />;
    case 'pptx':
      return <Presentation className="w-5 h-5" />;
    default:
      return <File className="w-5 h-5" />;
  }
}

function getStatusIcon(status: ProcessingStatus) {
  switch (status) {
    case 'uploading':
    case 'parsing':
    case 'chunking':
    case 'embedding':
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    case 'ready':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function FileUpload() {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const { addDocument, updateDocumentStatus, ragConfig, createConversation } = useStore();

  const processFile = useCallback(async (fileWithStatus: FileWithStatus) => {
    const { file } = fileWithStatus;
    
    // Update status to parsing
    setFiles(prev => prev.map(f => 
      f.file === file ? { ...f, status: 'parsing' as ProcessingStatus } : f
    ));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Determine document type
    const docType = ACCEPTED_FORMATS[file.type] || 'txt';
    
    // Add document to store
    const docId = addDocument({
      name: file.name,
      type: docType,
      size: file.size,
      status: 'chunking',
      pageCount: Math.ceil(Math.random() * 10) + 3,
      metadata: {
        hasImages: Math.random() > 0.5,
        hasTables: Math.random() > 0.3,
        hasOCR: docType === 'pdf' && Math.random() > 0.7,
      },
    });
    
    setFiles(prev => prev.map(f => 
      f.file === file ? { ...f, status: 'chunking' as ProcessingStatus, documentId: docId } : f
    ));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update to embedding status
    setFiles(prev => prev.map(f => 
      f.file === file ? { ...f, status: 'embedding' as ProcessingStatus } : f
    ));
    updateDocumentStatus(docId, 'embedding');
    
    // Simulate chunking and embedding
    const sampleType = file.name.toLowerCase().includes('financial') || 
                       file.name.toLowerCase().includes('annual') 
                       ? 'annual-report' 
                       : 'technical-report';
    const content = getSampleContent(sampleType);
    const chunks = createChunks(docId, content, ragConfig);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mark as ready
    setFiles(prev => prev.map(f => 
      f.file === file ? { ...f, status: 'ready' as ProcessingStatus } : f
    ));
    updateDocumentStatus(docId, 'ready');
    
    return { docId, chunks };
  }, [addDocument, updateDocumentStatus, ragConfig]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: FileWithStatus[] = acceptedFiles.map(file => ({
      file,
      status: 'uploading' as ProcessingStatus,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Process files sequentially
    const processedDocIds: string[] = [];
    for (const fileWithStatus of newFiles) {
      try {
        const result = await processFile(fileWithStatus);
        processedDocIds.push(result.docId);
      } catch {
        setFiles(prev => prev.map(f => 
          f.file === fileWithStatus.file 
            ? { ...f, status: 'error' as ProcessingStatus, error: 'Processing failed' } 
            : f
        ));
      }
    }
    
    // Create conversation if documents were processed
    if (processedDocIds.length > 0) {
      createConversation(processedDocIds);
    }
  }, [processFile, createConversation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.keys(ACCEPTED_FORMATS).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: MAX_FILE_SIZE,
  });

  const removeFile = (file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`
            p-4 rounded-full transition-colors
            ${isDragActive ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-800'}
          `}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
              {isDragActive ? 'Drop files here' : 'Drag & drop documents'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              PDF, DOCX, PPTX, Excel, CSV, Markdown (max 50MB)
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Browse Files
          </button>
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Processing Queue ({files.filter(f => f.status === 'ready').length}/{files.length} complete)
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((fileWithStatus, index) => {
                const docType = ACCEPTED_FORMATS[fileWithStatus.file.type] || 'txt';
                return (
                  <motion.div
                    key={`${fileWithStatus.file.name}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                      {getFileIcon(docType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {fileWithStatus.file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(fileWithStatus.file.size)}</span>
                        <span>•</span>
                        <span className="capitalize">{fileWithStatus.status}</span>
                        {fileWithStatus.error && (
                          <>
                            <span>•</span>
                            <span className="text-red-500">{fileWithStatus.error}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(fileWithStatus.status)}
                      {fileWithStatus.status !== 'uploading' && 
                       fileWithStatus.status !== 'parsing' && 
                       fileWithStatus.status !== 'chunking' && 
                       fileWithStatus.status !== 'embedding' && (
                        <button
                          onClick={() => removeFile(fileWithStatus.file)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Progress */}
      {files.some(f => ['uploading', 'parsing', 'chunking', 'embedding'].includes(f.status)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Processing documents...
              </p>
              <div className="flex gap-4 text-xs text-blue-600 dark:text-blue-300 mt-1">
                <span>OCR extraction</span>
                <span>•</span>
                <span>Table detection</span>
                <span>•</span>
                <span>Semantic chunking</span>
                <span>•</span>
                <span>Embedding generation</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
