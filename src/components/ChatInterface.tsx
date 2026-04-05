import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Loader2,
  Bot,
  User,
  FileText,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  MessageSquare,
  Trash2,
  Settings,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Message, Citation } from '../types';
import {
  executeRAGPipeline,
  generateCitations,
  generateResponse,
  createChunks,
  getSampleContent,
} from '../lib/ragPipeline';

interface ChatInterfaceProps {
  onCitationClick?: (citations: Citation[]) => void;
}

const SUGGESTED_QUESTIONS = [
  "How does the hybrid search algorithm work?",
  "What are the performance benchmarks for vector databases?",
  "Explain the semantic chunking process",
  "What are the key financial highlights from the report?",
  "How does re-ranking improve search accuracy?",
];

export function ChatInterface({ onCitationClick }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    documents,
    conversations,
    activeConversationId,
    addMessage,
    updateMessage,
    clearConversation,
    ragConfig,
    updateRAGConfig,
  } = useStore();
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];
  const readyDocuments = documents.filter(d => d.status === 'ready');
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);
  
  const handleSubmit = useCallback(async (query: string = input) => {
    if (!query.trim() || isStreaming || !activeConversationId) return;
    
    const trimmedQuery = query.trim();
    setInput('');
    setIsStreaming(true);
    
    // Add user message
    addMessage(activeConversationId, {
      role: 'user',
      content: trimmedQuery,
    });
    
    // Add assistant message placeholder
    const assistantMessageId = addMessage(activeConversationId, {
      role: 'assistant',
      content: '',
      isStreaming: true,
    });
    
    try {
      // Build chunks from all ready documents
      const allChunks = readyDocuments.flatMap(doc => {
        const sampleType = doc.name.toLowerCase().includes('financial') || 
                          doc.name.toLowerCase().includes('annual')
                          ? 'annual-report'
                          : 'technical-report';
        const content = getSampleContent(sampleType);
        return createChunks(doc.id, content, ragConfig);
      });
      
      // Execute RAG pipeline
      const retrievalResult = await executeRAGPipeline(
        trimmedQuery,
        readyDocuments,
        allChunks,
        ragConfig,
        messages
      );
      
      // Generate citations
      const citations = generateCitations(retrievalResult.chunks, readyDocuments);
      
      // Build context for LLM
      const context = retrievalResult.chunks
        .map((c, i) => `[${i + 1}] ${c.content}`)
        .join('\n\n');
      
      // Stream the response
      let fullResponse = '';
      const generator = generateResponse(trimmedQuery, context, citations, messages);
      
      for await (const token of generator) {
        fullResponse += token;
        updateMessage(activeConversationId, assistantMessageId, {
          content: fullResponse,
          isStreaming: true,
        });
      }
      
      // Finalize message with citations
      updateMessage(activeConversationId, assistantMessageId, {
        content: fullResponse,
        isStreaming: false,
        citations: citations.slice(0, 5),
        metadata: {
          tokensUsed: Math.floor(fullResponse.split(' ').length * 1.3),
          latencyMs: Math.floor(retrievalResult.timings.embeddingMs + retrievalResult.timings.searchMs + (retrievalResult.timings.rerankingMs || 0)),
          model: ragConfig.llmModel,
          retrievedChunks: retrievalResult.chunks.length,
          rerankedChunks: ragConfig.rerankingEnabled ? ragConfig.rerankTopN : undefined,
        },
      });
    } catch (error) {
      console.error('RAG pipeline error:', error);
      updateMessage(activeConversationId, assistantMessageId, {
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        isStreaming: false,
      });
    }
    
    setIsStreaming(false);
  }, [input, isStreaming, activeConversationId, addMessage, updateMessage, readyDocuments, ragConfig, messages]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const handleCitationClick = (citations: Citation[]) => {
    onCitationClick?.(citations);
  };

  // No documents uploaded yet
  if (readyDocuments.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            Welcome to DocuMind AI
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload documents to start asking questions. Our advanced RAG system will analyze your documents and provide accurate, cited answers.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              PDF
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
              DOCX
            </span>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm">
              PPTX
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
              Excel/CSV
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">DocuMind Assistant</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {readyDocuments.length} document{readyDocuments.length !== 1 ? 's' : ''} loaded
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => activeConversationId && clearConversation(activeConversationId)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg ${showSettings ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title="RAG settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      LLM Model
                    </label>
                    <select
                      value={ragConfig.llmModel}
                      onChange={(e) => updateRAGConfig({ llmModel: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                      <option value="gemini-pro">Gemini Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Chunking Strategy
                    </label>
                    <select
                      value={ragConfig.chunkingStrategy}
                      onChange={(e) => updateRAGConfig({ chunkingStrategy: e.target.value as 'semantic' | 'hierarchical' | 'fixed' | 'sentence' })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="semantic">Semantic</option>
                      <option value="hierarchical">Hierarchical</option>
                      <option value="fixed">Fixed Size</option>
                      <option value="sentence">Sentence</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ragConfig.rerankingEnabled}
                      onChange={(e) => updateRAGConfig({ rerankingEnabled: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Re-ranking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ragConfig.queryExpansionEnabled}
                      onChange={(e) => updateRAGConfig({ queryExpansionEnabled: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Query Expansion</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Hybrid Search Ratio (Dense: {Math.round(ragConfig.hybridSearchRatio * 100)}% / Sparse: {Math.round((1 - ragConfig.hybridSearchRatio) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ragConfig.hybridSearchRatio * 100}
                    onChange={(e) => updateRAGConfig({ hybridSearchRatio: parseInt(e.target.value) / 100 })}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center max-w-lg">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Ask me anything about your documents
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                I'll search through your documents and provide detailed answers with citations.
              </p>
              
              {/* Suggested Questions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Try asking:
                </p>
                {SUGGESTED_QUESTIONS.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(question)}
                    className="block w-full text-left px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onCopy={() => copyToClipboard(message.content, message.id)}
              isCopied={copiedId === message.id}
              onCitationClick={handleCitationClick}
              onRetry={() => message.role === 'user' && handleSubmit(message.content)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            disabled={isStreaming}
            rows={1}
            className="w-full px-4 py-3 pr-12 resize-none border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 rounded-lg text-white transition-colors disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-center text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: Message;
  onCopy: () => void;
  isCopied: boolean;
  onCitationClick: (citations: Citation[]) => void;
  onRetry: () => void;
}

function MessageBubble({ message, onCopy, isCopied, onCitationClick, onRetry }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [showCitations, setShowCitations] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser 
          ? 'bg-blue-600' 
          : 'bg-gradient-to-br from-purple-500 to-blue-600'
        }
      `}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`
          rounded-2xl px-4 py-3
          ${isUser 
            ? 'bg-blue-600 text-white rounded-tr-sm' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
          }
        `}>
          {message.isStreaming ? (
            <div className="flex items-center gap-2">
              <span>{message.content}</span>
              <span className="inline-block w-2 h-5 bg-current animate-pulse" />
            </div>
          ) : isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && !message.isStreaming && (
          <div className="mt-2">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FileText className="w-3 h-3" />
              <span>{message.citations.length} sources</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCitations ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showCitations && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-2">
                    {message.citations.map((citation, index) => (
                      <button
                        key={citation.id}
                        onClick={() => onCitationClick([citation])}
                        className="w-full text-left p-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <span className="font-medium truncate">{citation.documentName}</span>
                              <span>•</span>
                              <span>Page {citation.pageNumber}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                              {citation.snippet}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {/* Actions & Metadata */}
        {!isUser && !message.isStreaming && (
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {message.metadata && (
              <>
                <span>{message.metadata.tokensUsed} tokens</span>
                <span>•</span>
                <span>{message.metadata.latencyMs}ms</span>
                {message.metadata.model && (
                  <>
                    <span>•</span>
                    <span>{message.metadata.model}</span>
                  </>
                )}
              </>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={onCopy}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Copy response"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Regenerate"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        
        {/* User message actions */}
        {isUser && (
          <div className="flex items-center gap-1 mt-1">
            <button
              onClick={onRetry}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              title="Send again"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
