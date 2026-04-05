import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Download,
  Search,
  BookOpen,
  X,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getSampleContent } from '../lib/ragPipeline';
import type { Citation } from '../types';

interface DocumentViewerProps {
  highlightedCitations?: Citation[];
}

export function DocumentViewer({ highlightedCitations = [] }: DocumentViewerProps) {
  const { documents, selectedDocumentId, selectDocument, currentPage, setCurrentPage, zoom, setZoom } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const selectedDocument = documents.find(d => d.id === selectedDocumentId);
  const pageCount = selectedDocument?.pageCount || 5;
  
  // Get sample content for visualization
  const sampleType = selectedDocument?.name.toLowerCase().includes('financial') || 
                     selectedDocument?.name.toLowerCase().includes('annual')
                     ? 'annual-report'
                     : 'technical-report';
  const content = getSampleContent(sampleType);
  const currentContent = content[currentPage - 1] || content[0];
  
  // Find highlighted sections on current page
  const highlightsOnPage = highlightedCitations.filter(
    c => c.pageNumber === currentPage && c.documentId === selectedDocumentId
  );

  useEffect(() => {
    // Navigate to the first highlighted citation's page
    if (highlightedCitations.length > 0) {
      const firstCitation = highlightedCitations[0];
      if (firstCitation.documentId === selectedDocumentId) {
        setCurrentPage(firstCitation.pageNumber);
      }
    }
  }, [highlightedCitations, selectedDocumentId, setCurrentPage]);

  if (!selectedDocumentId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            No Document Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Upload a document or select one from the sidebar to view it here.
            The document viewer supports PDF, DOCX, PPTX, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-gray-100 dark:bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <FileText className="w-4 h-4" />
              <span className="font-medium truncate max-w-[200px]">
                {selectedDocument?.name}
              </span>
            </div>
            
            {/* Page Navigation */}
            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300 px-2">
                Page {currentPage} of {pageCount}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
                disabled={currentPage === pageCount}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in document..."
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Search"
            >
              {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            
            {/* Zoom Controls */}
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300 w-12 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            
            <button
              onClick={() => setZoom(100)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Reset"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Document Content */}
      <div className="flex-1 overflow-auto p-4">
        <div 
          className="mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
          style={{
            width: `${zoom}%`,
            maxWidth: '100%',
            minWidth: '300px',
          }}
        >
          {/* Simulated Document Page */}
          <div className="p-8 min-h-[600px]">
            {/* Page Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                {selectedDocument?.name.replace(/\.[^/.]+$/, '')}
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {currentPage === 1 ? 'Document Overview' : `Section ${currentPage - 1}`}
              </div>
            </div>
            
            {/* Document Content with Highlights */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {currentContent.split('\n\n').map((paragraph, pIndex) => {
                const isHighlighted = highlightsOnPage.some(
                  h => h.snippet.includes(paragraph.slice(0, 50))
                );
                
                // Check if it's a table
                if (paragraph.includes('|') && paragraph.includes('-')) {
                  const rows = paragraph.split('\n').filter(r => r.trim());
                  return (
                    <div 
                      key={pIndex} 
                      className={`my-4 overflow-x-auto ${isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/30 -mx-2 px-2 py-1 rounded' : ''}`}
                    >
                      <table className="min-w-full text-sm border-collapse">
                        {rows.map((row, rIndex) => {
                          const cells = row.split('|').filter(c => c.trim());
                          const isHeader = rIndex === 0;
                          const isDivider = row.includes('---');
                          
                          if (isDivider) return null;
                          
                          return (
                            <tr key={rIndex} className={isHeader ? 'bg-gray-100 dark:bg-gray-700' : ''}>
                              {cells.map((cell, cIndex) => (
                                <td 
                                  key={cIndex}
                                  className={`
                                    px-3 py-2 border border-gray-300 dark:border-gray-600
                                    ${isHeader ? 'font-semibold text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300'}
                                  `}
                                >
                                  {cell.trim()}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </table>
                    </div>
                  );
                }
                
                // Check if it's a heading
                if (paragraph.match(/^(Chapter|Section|\d+\.\d)/)) {
                  return (
                    <h3 
                      key={pIndex}
                      className={`text-lg font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3 ${isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/30 -mx-2 px-2 py-1 rounded' : ''}`}
                    >
                      {paragraph}
                    </h3>
                  );
                }
                
                // Check if it's a list
                if (paragraph.match(/^[-•*]\s/m)) {
                  const items = paragraph.split('\n').filter(l => l.trim());
                  return (
                    <ul 
                      key={pIndex}
                      className={`list-disc list-inside space-y-1 my-3 ${isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/30 -mx-2 px-2 py-1 rounded' : ''}`}
                    >
                      {items.map((item, iIndex) => (
                        <li key={iIndex} className="text-gray-700 dark:text-gray-300">
                          {item.replace(/^[-•*]\s/, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                
                // Regular paragraph
                return (
                  <p 
                    key={pIndex}
                    className={`text-gray-700 dark:text-gray-300 leading-relaxed mb-4 ${isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/30 -mx-2 px-2 py-1 rounded border-l-4 border-yellow-400' : ''}`}
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>
            
            {/* Page Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400">
              <span>Page {currentPage}</span>
              <span>{selectedDocument?.name}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Document Tabs (if multiple documents) */}
      {documents.length > 1 && (
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-1">
          <div className="flex gap-1 overflow-x-auto">
            {documents.filter(d => d.status === 'ready').map((doc) => (
              <button
                key={doc.id}
                onClick={() => selectDocument(doc.id)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg truncate max-w-[150px]
                  ${doc.id === selectedDocumentId 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{doc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
