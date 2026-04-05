// Core Types for the RAG Document Q&A System

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  uploadedAt: Date;
  status: ProcessingStatus;
  pageCount?: number;
  chunks?: DocumentChunk[];
  metadata?: DocumentMetadata;
}

export type DocumentType = 'pdf' | 'docx' | 'pptx' | 'csv' | 'xlsx' | 'markdown' | 'txt';

export type ProcessingStatus = 'uploading' | 'parsing' | 'chunking' | 'embedding' | 'ready' | 'error';

export interface DocumentMetadata {
  title?: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  wordCount?: number;
  language?: string;
  hasImages: boolean;
  hasTables: boolean;
  hasOCR: boolean;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  chunkType: ChunkType;
  embedding?: number[];
  metadata: ChunkMetadata;
  parentChunkId?: string;
  childChunkIds?: string[];
}

export type ChunkType = 'text' | 'table' | 'image' | 'heading' | 'list' | 'code';

export interface ChunkMetadata {
  startOffset: number;
  endOffset: number;
  semanticDensity: number;
  keywords: string[];
  entities: string[];
  section?: string;
  subsection?: string;
}

// Chat & Conversation Types
export interface Conversation {
  id: string;
  documentIds: string[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  reasoning?: string;
  isStreaming?: boolean;
  metadata?: MessageMetadata;
}

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  chunkId: string;
  snippet: string;
  relevanceScore: number;
  highlightRanges?: HighlightRange[];
}

export interface HighlightRange {
  start: number;
  end: number;
}

export interface MessageMetadata {
  tokensUsed?: number;
  latencyMs?: number;
  model?: string;
  retrievedChunks?: number;
  rerankedChunks?: number;
}

// RAG Pipeline Types
export interface RAGConfig {
  chunkingStrategy: ChunkingStrategy;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  llmModel: string;
  topK: number;
  hybridSearchRatio: number; // 0 = pure sparse, 1 = pure dense
  rerankingEnabled: boolean;
  rerankingModel?: string;
  rerankTopN: number;
  queryExpansionEnabled: boolean;
  conversationMemorySize: number;
}

export type ChunkingStrategy = 'semantic' | 'hierarchical' | 'fixed' | 'sentence';

export interface RetrievalResult {
  chunks: ScoredChunk[];
  queryExpansions?: string[];
  searchType: 'hybrid' | 'dense' | 'sparse';
  timings: {
    embeddingMs: number;
    searchMs: number;
    rerankingMs?: number;
  };
}

export interface ScoredChunk extends DocumentChunk {
  score: number;
  denseScore?: number;
  sparseScore?: number;
  rerankScore?: number;
}

// API Request/Response Types
export interface UploadRequest {
  files: File[];
  config?: Partial<RAGConfig>;
}

export interface UploadResponse {
  documents: Document[];
  errors?: UploadError[];
}

export interface UploadError {
  fileName: string;
  error: string;
  code: string;
}

export interface QueryRequest {
  query: string;
  documentIds: string[];
  conversationId?: string;
  config?: Partial<RAGConfig>;
}

export interface QueryResponse {
  answer: string;
  citations: Citation[];
  conversationId: string;
  metadata: MessageMetadata;
}

export interface StreamChunk {
  type: 'token' | 'citation' | 'done' | 'error';
  content?: string;
  citation?: Citation;
  metadata?: MessageMetadata;
  error?: string;
}

// UI State Types
export interface UIState {
  selectedDocumentId: string | null;
  currentPage: number;
  zoom: number;
  highlightedCitations: string[];
  sidebarCollapsed: boolean;
  darkMode: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export const ERROR_CODES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  PARSING_FAILED: 'PARSING_FAILED',
  EMBEDDING_FAILED: 'EMBEDDING_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;
