# DocuMind AI - Advanced Document Q&A System

An enterprise-grade Retrieval-Augmented Generation (RAG) system for intelligent document processing and question-answering.

## 🏗️ Architecture Overview

### Ingestion Pipeline

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌────────────┐
│   Upload    │ -> │   Parsing    │ -> │    Chunking     │ -> │ Embedding  │
│ (Multi-fmt) │    │ (OCR+Tables) │    │ (Semantic/Hier) │    │ (Dense)    │
└─────────────┘    └──────────────┘    └─────────────────┘    └────────────┘
                                               │                     │
                                               v                     v
                                       ┌──────────────┐    ┌────────────────┐
                                       │   BM25 Index │    │ Vector Store   │
                                       │   (Sparse)   │    │ (Qdrant/Pine)  │
                                       └──────────────┘    └────────────────┘
```

### Retrieval Pipeline

```
┌───────────┐    ┌────────────────┐    ┌──────────────────┐
│   Query   │ -> │ Query Transform│ -> │  Hybrid Search   │
│           │    │ (Expansion)    │    │ (Dense + Sparse) │
└───────────┘    └────────────────┘    └──────────────────┘
                                                │
                                                v
┌───────────┐    ┌────────────────┐    ┌──────────────────┐
│  Response │ <- │   Generation   │ <- │    Re-ranking    │
│ (Stream)  │    │ (LLM+Context)  │    │ (Cross-encoder)  │
└───────────┘    └────────────────┘    └──────────────────┘
```

## 🎯 Core Features

### 1. Multi-Document & Multi-Format Support
- **PDF**: Native text extraction with OCR fallback for scanned documents
- **DOCX/PPTX**: Office document parsing with table preservation
- **Excel/CSV**: Structured data extraction with schema detection
- **Markdown**: Native markdown parsing with code block support

### 2. Advanced Document Parsing
- **OCR Integration**: Tesseract OCR for scanned documents
- **Table Extraction**: Semantic table understanding preserving row/column relationships
- **Image Processing**: Vision model integration for chart and diagram understanding
- **Layout Analysis**: Document structure detection (headers, sections, paragraphs)

### 3. State-of-the-Art RAG Pipeline

#### Chunking Strategies
| Strategy | Description | Best For |
|----------|-------------|----------|
| **Semantic** | Splits at natural semantic boundaries | Narrative text, reports |
| **Hierarchical** | Parent-child relationships | Long documents |
| **Fixed** | Consistent token counts with overlap | Technical docs |
| **Sentence** | Groups sentences together | Structured content |

#### Query Processing
- **Query Expansion**: Generates related queries for broader coverage
- **Query Routing**: Directs queries to appropriate retrieval strategies
- **Intent Detection**: Classifies query type (factual, analytical, comparative)

#### Hybrid Search
```
score = α × dense_score + (1-α) × sparse_score

Where:
- α is the hybrid ratio (configurable, default 0.7)
- dense_score from cosine similarity of embeddings
- sparse_score from BM25 algorithm
```

#### Re-ranking
Cross-encoder re-ranking improves precision by jointly encoding query and document:
- Initial retrieval: Top-K candidates (K=20)
- Re-rank to Top-N (N=5) for LLM context

### 4. Citation & Highlighting
- Exact page number references
- Document name attribution
- Snippet extraction with relevance scores
- Interactive citation navigation

### 5. Conversational Memory
- Multi-turn context preservation
- Configurable history length
- Session-based conversation management

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **React Markdown** for message rendering

### Backend (Production Implementation)
```python
# requirements.txt
fastapi==0.109.0
uvicorn==0.27.0
python-multipart==0.0.6
llama-index==0.9.30
langchain==0.1.0
openai==1.10.0
anthropic==0.14.0
cohere==4.45
qdrant-client==1.7.0
unstructured==0.12.0
pytesseract==0.3.10
python-docx==1.1.0
python-pptx==0.6.23
pandas==2.2.0
openpyxl==3.1.2
sentence-transformers==2.3.1
```

### Vector Database Options
- **Qdrant**: Self-hosted, excellent performance
- **Pinecone**: Managed service, easy scaling
- **Weaviate**: GraphQL-native, hybrid search built-in

### LLM Providers
- **OpenAI**: GPT-4o, GPT-4 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **Google**: Gemini Pro

### Embedding Models
- **text-embedding-3-large** (OpenAI, 3072 dimensions)
- **BGE-M3** (BAAI, multilingual)
- **E5-large-v2** (Intfloat, open-source)

## 📁 Project Structure

```
src/
├── components/
│   ├── ChatInterface.tsx      # Chat UI with streaming
│   ├── DocumentViewer.tsx     # Document display with highlighting
│   ├── FileUpload.tsx         # Drag-and-drop upload
│   ├── Sidebar.tsx            # Document list management
│   └── RAGConfigPanel.tsx     # Pipeline configuration
├── lib/
│   └── ragPipeline.ts         # RAG utilities and algorithms
├── store/
│   └── useStore.ts            # Global state management
├── types/
│   └── index.ts               # TypeScript definitions
├── App.tsx                    # Main application
├── main.tsx                   # Entry point
└── index.css                  # Global styles
```

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

## 🔧 Configuration Options

### RAG Pipeline Settings
| Setting | Default | Range | Description |
|---------|---------|-------|-------------|
| Chunk Size | 512 | 128-2048 | Target tokens per chunk |
| Chunk Overlap | 50 | 0-200 | Overlap between chunks |
| Top-K | 10 | 5-50 | Initial retrieval count |
| Re-rank Top-N | 5 | 3-20 | Final context chunks |
| Hybrid Ratio | 0.7 | 0-1 | Dense vs sparse balance |

### Supported File Formats
| Format | Extension | Max Size | Features |
|--------|-----------|----------|----------|
| PDF | .pdf | 50MB | Text, OCR, Tables |
| Word | .docx | 50MB | Text, Tables, Images |
| PowerPoint | .pptx | 50MB | Slides, Notes |
| Excel | .xlsx | 50MB | Sheets, Formulas |
| CSV | .csv | 50MB | Auto-schema detection |
| Markdown | .md | 10MB | Full syntax support |

## 🔐 Security & Best Practices

- Input validation on all file uploads
- File size limits enforcement
- Content type verification
- API rate limiting
- Secure session management
- No sensitive data logging

## 📊 Performance Optimization

- Batch embedding generation
- Async document indexing
- Connection pooling for databases
- Response streaming
- Efficient chunk deduplication
- Memory-aware conversation context

## 🎨 UI Features

- Split-screen document viewer + chat
- Real-time streaming responses
- Interactive citation navigation
- Dark mode support
- Mobile-responsive design
- Configurable panel layouts

## 📈 Metrics & Monitoring

Track these key metrics in production:
- Retrieval latency (p50, p95, p99)
- Embedding throughput
- Re-ranker accuracy
- Token usage per query
- User satisfaction scores

---

Built with ❤️ using React, Vite, and Tailwind CSS
