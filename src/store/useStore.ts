import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Document,
  Conversation,
  Message,
  RAGConfig,
  ProcessingStatus,
} from '../types';

interface AppState {
  // Documents
  documents: Document[];
  selectedDocumentId: string | null;
  
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  
  // UI State
  currentPage: number;
  zoom: number;
  highlightedCitations: string[];
  sidebarCollapsed: boolean;
  isProcessing: boolean;
  processingMessage: string;
  
  // RAG Configuration
  ragConfig: RAGConfig;
  
  // Actions - Documents
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt'>) => string;
  updateDocumentStatus: (id: string, status: ProcessingStatus) => void;
  removeDocument: (id: string) => void;
  selectDocument: (id: string | null) => void;
  
  // Actions - Conversations
  createConversation: (documentIds: string[]) => string;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  clearConversation: (conversationId: string) => void;
  
  // Actions - UI
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  highlightCitation: (citationId: string) => void;
  clearHighlights: () => void;
  toggleSidebar: () => void;
  setProcessing: (isProcessing: boolean, message?: string) => void;
  
  // Actions - Config
  updateRAGConfig: (config: Partial<RAGConfig>) => void;
}

const defaultRAGConfig: RAGConfig = {
  chunkingStrategy: 'semantic',
  chunkSize: 512,
  chunkOverlap: 50,
  embeddingModel: 'text-embedding-3-large',
  llmModel: 'gpt-4o',
  topK: 10,
  hybridSearchRatio: 0.7,
  rerankingEnabled: true,
  rerankingModel: 'cohere-rerank-v3',
  rerankTopN: 5,
  queryExpansionEnabled: true,
  conversationMemorySize: 10,
};

export const useStore = create<AppState>((set) => ({
  // Initial State
  documents: [],
  selectedDocumentId: null,
  conversations: [],
  activeConversationId: null,
  currentPage: 1,
  zoom: 100,
  highlightedCitations: [],
  sidebarCollapsed: false,
  isProcessing: false,
  processingMessage: '',
  ragConfig: defaultRAGConfig,
  
  // Document Actions
  addDocument: (doc) => {
    const id = uuidv4();
    const newDoc: Document = {
      ...doc,
      id,
      uploadedAt: new Date(),
    };
    set((state) => ({
      documents: [...state.documents, newDoc],
    }));
    return id;
  },
  
  updateDocumentStatus: (id, status) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, status } : doc
      ),
    }));
  },
  
  removeDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
      selectedDocumentId: state.selectedDocumentId === id ? null : state.selectedDocumentId,
    }));
  },
  
  selectDocument: (id) => {
    set({ selectedDocumentId: id, currentPage: 1 });
  },
  
  // Conversation Actions
  createConversation: (documentIds) => {
    const id = uuidv4();
    const newConversation: Conversation = {
      id,
      documentIds,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      conversations: [...state.conversations, newConversation],
      activeConversationId: id,
    }));
    return id;
  },
  
  addMessage: (conversationId, message) => {
    const messageId = uuidv4();
    const newMessage: Message = {
      ...message,
      id: messageId,
      timestamp: new Date(),
    };
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              updatedAt: new Date(),
            }
          : conv
      ),
    }));
    return messageId;
  },
  
  updateMessage: (conversationId, messageId, updates) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
              updatedAt: new Date(),
            }
          : conv
      ),
    }));
  },
  
  clearConversation: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [], updatedAt: new Date() }
          : conv
      ),
    }));
  },
  
  // UI Actions
  setCurrentPage: (page) => set({ currentPage: page }),
  setZoom: (zoom) => set({ zoom }),
  
  highlightCitation: (citationId) => {
    set((state) => ({
      highlightedCitations: [...state.highlightedCitations, citationId],
    }));
  },
  
  clearHighlights: () => set({ highlightedCitations: [] }),
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setProcessing: (isProcessing, message = '') => {
    set({ isProcessing, processingMessage: message });
  },
  
  // Config Actions
  updateRAGConfig: (config) => {
    set((state) => ({
      ragConfig: { ...state.ragConfig, ...config },
    }));
  },
}));
