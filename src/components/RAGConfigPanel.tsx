import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Zap,
  Search,
  Layers,
  RefreshCw,
  Brain,
  ChevronDown,
  Info,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { ChunkingStrategy } from '../types';

const CHUNKING_INFO = {
  semantic: {
    title: 'Semantic Chunking',
    description: 'Splits documents at natural semantic boundaries using embedding similarity. Best for narrative text.',
    pros: ['Preserves context', 'Better retrieval quality', 'Natural boundaries'],
    cons: ['Variable chunk sizes', 'More compute intensive'],
  },
  hierarchical: {
    title: 'Hierarchical Chunking',
    description: 'Creates parent-child relationships between chunks. Child chunks for retrieval, parents for context.',
    pros: ['High precision retrieval', 'Full context for LLM', 'Handles long documents'],
    cons: ['More complex', 'Higher storage requirements'],
  },
  fixed: {
    title: 'Fixed-Size Chunking',
    description: 'Splits documents into fixed token counts with overlap. Simple and predictable.',
    pros: ['Simple implementation', 'Predictable sizes', 'Fast processing'],
    cons: ['May split sentences', 'Can lose context'],
  },
  sentence: {
    title: 'Sentence Chunking',
    description: 'Groups sentences together up to a maximum size. Respects sentence boundaries.',
    pros: ['Respects sentence boundaries', 'Good for structured content'],
    cons: ['Variable sizes', 'May create small chunks'],
  },
};

const LLM_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI', description: 'Most capable, multimodal' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI', description: '128k context, fast' },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Excellent reasoning' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'Anthropic', description: 'Most intelligent' },
  { value: 'gemini-pro', label: 'Gemini Pro', provider: 'Google', description: 'Great multimodal' },
];

const EMBEDDING_MODELS = [
  { value: 'text-embedding-3-large', label: 'text-embedding-3-large', provider: 'OpenAI', dimensions: 3072 },
  { value: 'text-embedding-3-small', label: 'text-embedding-3-small', provider: 'OpenAI', dimensions: 1536 },
  { value: 'bge-m3', label: 'BGE-M3', provider: 'BAAI', dimensions: 1024 },
  { value: 'e5-large-v2', label: 'E5-large-v2', provider: 'Intfloat', dimensions: 1024 },
];

const RERANK_MODELS = [
  { value: 'cohere-rerank-v3', label: 'Cohere Rerank v3', description: 'Best accuracy' },
  { value: 'bge-reranker-large', label: 'BGE-Reranker Large', description: 'Open source' },
  { value: 'cross-encoder-ms-marco', label: 'MS MARCO Cross-encoder', description: 'Fast inference' },
];

export function RAGConfigPanel() {
  const { ragConfig, updateRAGConfig } = useStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('chunking');
  const [showChunkingInfo, setShowChunkingInfo] = useState(false);
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">RAG Configuration</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Fine-tune the retrieval and generation pipeline
        </p>
      </div>
      
      {/* Config Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Chunking Section */}
        <ConfigSection
          icon={<Layers className="w-4 h-4" />}
          title="Document Chunking"
          isExpanded={expandedSection === 'chunking'}
          onToggle={() => toggleSection('chunking')}
        >
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Strategy
                </label>
                <button
                  onClick={() => setShowChunkingInfo(!showChunkingInfo)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['semantic', 'hierarchical', 'fixed', 'sentence'] as ChunkingStrategy[]).map((strategy) => (
                  <button
                    key={strategy}
                    onClick={() => updateRAGConfig({ chunkingStrategy: strategy })}
                    className={`
                      px-3 py-2 text-sm rounded-lg border transition-colors
                      ${ragConfig.chunkingStrategy === strategy
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <span className="capitalize">{strategy}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <AnimatePresence>
              {showChunkingInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      {CHUNKING_INFO[ragConfig.chunkingStrategy].title}
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      {CHUNKING_INFO[ragConfig.chunkingStrategy].description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400 mb-1">Pros:</p>
                        <ul className="space-y-0.5 text-gray-600 dark:text-gray-400">
                          {CHUNKING_INFO[ragConfig.chunkingStrategy].pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-orange-700 dark:text-orange-400 mb-1">Cons:</p>
                        <ul className="space-y-0.5 text-gray-600 dark:text-gray-400">
                          {CHUNKING_INFO[ragConfig.chunkingStrategy].cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Chunk Size: {ragConfig.chunkSize} tokens
              </label>
              <input
                type="range"
                min="128"
                max="2048"
                step="64"
                value={ragConfig.chunkSize}
                onChange={(e) => updateRAGConfig({ chunkSize: parseInt(e.target.value) })}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>128</span>
                <span>2048</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Overlap: {ragConfig.chunkOverlap} tokens
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={ragConfig.chunkOverlap}
                onChange={(e) => updateRAGConfig({ chunkOverlap: parseInt(e.target.value) })}
                className="w-full mt-2"
              />
            </div>
          </div>
        </ConfigSection>
        
        {/* Search Section */}
        <ConfigSection
          icon={<Search className="w-4 h-4" />}
          title="Hybrid Search"
          isExpanded={expandedSection === 'search'}
          onToggle={() => toggleSection('search')}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Embedding Model
              </label>
              <select
                value={ragConfig.embeddingModel}
                onChange={(e) => updateRAGConfig({ embeddingModel: e.target.value })}
                className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                {EMBEDDING_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label} ({model.provider}, {model.dimensions}d)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Hybrid Ratio
              </label>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>Dense (Semantic): {Math.round(ragConfig.hybridSearchRatio * 100)}%</span>
                  <span>Sparse (BM25): {Math.round((1 - ragConfig.hybridSearchRatio) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ragConfig.hybridSearchRatio * 100}
                  onChange={(e) => updateRAGConfig({ hybridSearchRatio: parseInt(e.target.value) / 100 })}
                  className="w-full"
                />
                <div className="flex mt-2">
                  <div 
                    className="h-2 bg-blue-500 rounded-l"
                    style={{ width: `${ragConfig.hybridSearchRatio * 100}%` }}
                  />
                  <div 
                    className="h-2 bg-green-500 rounded-r"
                    style={{ width: `${(1 - ragConfig.hybridSearchRatio) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Top-K Retrieval: {ragConfig.topK}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={ragConfig.topK}
                onChange={(e) => updateRAGConfig({ topK: parseInt(e.target.value) })}
                className="w-full mt-2"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Query Expansion</span>
              </div>
              <button
                onClick={() => updateRAGConfig({ queryExpansionEnabled: !ragConfig.queryExpansionEnabled })}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${ragConfig.queryExpansionEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${ragConfig.queryExpansionEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </ConfigSection>
        
        {/* Re-ranking Section */}
        <ConfigSection
          icon={<RefreshCw className="w-4 h-4" />}
          title="Re-ranking"
          isExpanded={expandedSection === 'reranking'}
          onToggle={() => toggleSection('reranking')}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Enable Re-ranking</span>
              </div>
              <button
                onClick={() => updateRAGConfig({ rerankingEnabled: !ragConfig.rerankingEnabled })}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${ragConfig.rerankingEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${ragConfig.rerankingEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
            
            {ragConfig.rerankingEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Re-rank Model
                  </label>
                  <select
                    value={ragConfig.rerankingModel}
                    onChange={(e) => updateRAGConfig({ rerankingModel: e.target.value })}
                    className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    {RERANK_MODELS.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label} - {model.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Re-rank Top-N: {ragConfig.rerankTopN}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={ragConfig.rerankTopN}
                    onChange={(e) => updateRAGConfig({ rerankTopN: parseInt(e.target.value) })}
                    className="w-full mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of top chunks to keep after re-ranking
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </ConfigSection>
        
        {/* LLM Section */}
        <ConfigSection
          icon={<Brain className="w-4 h-4" />}
          title="Generation"
          isExpanded={expandedSection === 'generation'}
          onToggle={() => toggleSection('generation')}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                LLM Model
              </label>
              <div className="mt-2 space-y-2">
                {LLM_MODELS.map((model) => (
                  <button
                    key={model.value}
                    onClick={() => updateRAGConfig({ llmModel: model.value })}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left
                      ${ragConfig.llmModel === model.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {model.label}
                        </span>
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                          {model.provider}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {model.description}
                      </p>
                    </div>
                    {ragConfig.llmModel === model.value && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Conversation Memory: {ragConfig.conversationMemorySize} messages
              </label>
              <input
                type="range"
                min="2"
                max="20"
                value={ragConfig.conversationMemorySize}
                onChange={(e) => updateRAGConfig({ conversationMemorySize: parseInt(e.target.value) })}
                className="w-full mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of previous messages to include for context
              </p>
            </div>
          </div>
        </ConfigSection>
      </div>
    </div>
  );
}

// Config Section Component
interface ConfigSectionProps {
  icon: React.ReactNode;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ConfigSection({ icon, title, isExpanded, onToggle, children }: ConfigSectionProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">{icon}</span>
          <span className="font-medium text-gray-700 dark:text-gray-200">{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-gray-900">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
