import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Layers,
  Database,
  Search,
  Brain,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Zap,
  GitBranch,
} from 'lucide-react';

interface PipelineStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: string;
  isActive?: boolean;
}

function PipelineStep({ icon, title, description, details, color, isActive = false }: PipelineStepProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        relative p-4 rounded-xl border-2 transition-all cursor-pointer
        ${isActive 
          ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20` 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 text-white`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h4>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              className="text-gray-400"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
              {details.map((detail, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`} />
                  {detail}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ArchitectureDiagram() {
  const [activeTab, setActiveTab] = useState<'ingestion' | 'retrieval'>('ingestion');
  
  const ingestionSteps: PipelineStepProps[] = [
    {
      icon: <Upload className="w-5 h-5" />,
      title: 'Document Upload',
      description: 'Multi-format document intake with validation',
      details: [
        'Support for PDF, DOCX, PPTX, Excel, CSV, Markdown',
        'File size validation (max 50MB)',
        'Content type verification',
        'Concurrent upload handling',
      ],
      color: 'blue',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Document Parsing',
      description: 'Advanced text extraction with OCR and table detection',
      details: [
        'Tesseract OCR for scanned documents',
        'Table structure preservation',
        'Image and chart extraction',
        'Layout analysis for document structure',
      ],
      color: 'green',
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: 'Semantic Chunking',
      description: 'Intelligent text segmentation preserving context',
      details: [
        'Embedding-based boundary detection',
        'Hierarchical parent-child relationships',
        'Metadata enrichment (keywords, entities)',
        'Configurable chunk size and overlap',
      ],
      color: 'purple',
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: 'Vector Storage',
      description: 'Dual-index storage for hybrid search',
      details: [
        'Dense embeddings (1536-3072 dimensions)',
        'BM25 sparse index for keyword search',
        'HNSW indexing for fast ANN queries',
        'Metadata filtering support',
      ],
      color: 'orange',
    },
  ];
  
  const retrievalSteps: PipelineStepProps[] = [
    {
      icon: <GitBranch className="w-5 h-5" />,
      title: 'Query Processing',
      description: 'Transform and expand user queries',
      details: [
        'Query expansion with synonyms',
        'Intent classification',
        'Multi-query generation',
        'Context window integration',
      ],
      color: 'blue',
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: 'Hybrid Search',
      description: 'Combined dense and sparse retrieval',
      details: [
        'Dense: Cosine similarity on embeddings',
        'Sparse: BM25 keyword matching',
        'Configurable α ratio (default 0.7)',
        'Top-K candidate retrieval',
      ],
      color: 'green',
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: 'Cross-Encoder Re-ranking',
      description: 'Precision refinement with joint encoding',
      details: [
        'Query-document pair scoring',
        'Fine-grained relevance assessment',
        'Top-N selection (default 5)',
        '+23% precision improvement',
      ],
      color: 'purple',
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: 'LLM Generation',
      description: 'Context-aware response synthesis',
      details: [
        'GPT-4o / Claude 3.5 / Gemini Pro',
        'Structured context injection',
        'Citation extraction',
        'Streaming response delivery',
      ],
      color: 'orange',
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Response Delivery',
      description: 'Formatted output with citations',
      details: [
        'Real-time token streaming',
        'Markdown rendering',
        'Citation highlighting',
        'Conversation memory update',
      ],
      color: 'pink',
    },
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            RAG Pipeline Architecture
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Click on each step to learn more about the implementation details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Enterprise RAG
          </span>
        </div>
      </div>
      
      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('ingestion')}
          className={`
            flex-1 py-3 px-4 rounded-lg font-medium transition-colors
            ${activeTab === 'ingestion'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
        >
          Ingestion Pipeline
        </button>
        <button
          onClick={() => setActiveTab('retrieval')}
          className={`
            flex-1 py-3 px-4 rounded-lg font-medium transition-colors
            ${activeTab === 'retrieval'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
        >
          Retrieval Pipeline
        </button>
      </div>
      
      {/* Pipeline Steps */}
      <div className="space-y-4">
        {(activeTab === 'ingestion' ? ingestionSteps : retrievalSteps).map((step, index) => (
          <div key={step.title} className="relative">
            {index < (activeTab === 'ingestion' ? ingestionSteps : retrievalSteps).length - 1 && (
              <div className="absolute left-7 top-full h-4 w-0.5 bg-gray-200 dark:bg-gray-700" />
            )}
            <PipelineStep {...step} />
          </div>
        ))}
      </div>
      
      {/* Performance Metrics */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Performance Benchmarks
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">47%</p>
            <p className="text-xs text-gray-500">Accuracy Improvement</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">&lt;15ms</p>
            <p className="text-xs text-gray-500">Search Latency (p99)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">98%</p>
            <p className="text-xs text-gray-500">Recall@10</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">23%</p>
            <p className="text-xs text-gray-500">Re-rank Precision Gain</p>
          </div>
        </div>
      </div>
    </div>
  );
}
