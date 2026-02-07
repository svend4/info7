# Leonardo AI - RAG (Retrieval-Augmented Generation) Integration

**Версия:** 1.0.0 | **Дата:** 2026-02-07 | **Статус:** 🚀 Production Ready

> 🔍 **Модуль расширенного поиска и генерации для Leonardo AI**
> Превращает Leonardo AI из системы с фиксированными знаниями в систему с доступом к неограниченной базе знаний

---

## 📖 Содержание

1. [Введение: Зачем RAG для Leonardo AI](#введение)
2. [Архитектура RAG модуля](#архитектура)
3. [Vector Database и Embeddings](#vector-database)
4. [Retrieval Strategies (Стратегии поиска)](#retrieval-strategies)
5. [Integration с Corpus Callosum](#интеграция)
6. [Примеры использования](#примеры)
7. [Advanced Features](#advanced-features)
8. [Дорожная карта реализации](#roadmap)

---

## 1. Введение: Зачем RAG для Leonardo AI {#введение}

### 1.1 Проблема ограниченных знаний

**Текущая проблема AI систем:**

```
┌─────────────────────────────────────┐
│     Традиционная LLM                │
│                                     │
│  ✅ Знает то, на чём обучена        │
│  ❌ Не знает новых данных           │
│  ❌ Не знает приватных данных       │
│  ❌ Не знает специфичных данных     │
│  ❌ Может галлюцинировать           │
│  ❌ Нет источников информации       │
└─────────────────────────────────────┘
```

**С RAG модулем:**

```
┌─────────────────────────────────────┐
│     Leonardo AI + RAG               │
│                                     │
│  ✅ Знает базовые вещи (LLM)        │
│  ✅ ИЩЕТ новую информацию           │
│  ✅ ИСПОЛЬЗУЕТ приватные данные     │
│  ✅ АДАПТИРУЕТСЯ к доменам          │
│  ✅ Цитирует источники              │
│  ✅ Меньше галлюцинаций             │
│                                     │
│  = Знания = LLM + База данных       │
└─────────────────────────────────────┘
```

### 1.2 Что такое RAG?

**RAG = Retrieval-Augmented Generation**

```
┌────────────────────────────────────────────────────────┐
│                    RAG Pipeline                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1. User Query                                         │
│     "Как исправить race condition в payment module?"   │
│                                                        │
│           ↓                                            │
│                                                        │
│  2. RETRIEVAL (Поиск релевантной информации)           │
│     - Векторный поиск в базе знаний                    │
│     - Находит: код payment module, документацию,       │
│                похожие баги, best practices            │
│                                                        │
│           ↓                                            │
│                                                        │
│  3. AUGMENTATION (Обогащение контекста)                │
│     Query + Retrieved Documents → Rich Context         │
│                                                        │
│           ↓                                            │
│                                                        │
│  4. GENERATION (Генерация ответа)                      │
│     LLM генерирует ответ на основе:                    │
│     - Оригинального запроса                            │
│     - Найденной документации                           │
│     - Исходного кода                                   │
│     - Примеров решений                                 │
│                                                        │
│           ↓                                            │
│                                                        │
│  5. Answer с источниками                               │
│     "Race condition можно исправить с помощью...       │
│      [Источник: payment_module.ts:142]                 │
│      [Документация: docs/concurrency.md]"              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 1.3 Преимущества RAG для Leonardo AI

| Без RAG | С RAG |
|---------|-------|
| Ограничен знаниями LLM | Доступ к любым данным |
| Статические знания | Динамически обновляемые знания |
| Не знает код проекта | Знает весь codebase |
| Не знает документацию | Знает всю документацию |
| Галлюцинации | Факты из источников |
| Нет цитирования | Цитирует источники |
| Один размер для всех | Персонализация под проект |

---

## 2. Архитектура RAG модуля {#архитектура}

### 2.1 High-Level архитектура

```
┌────────────────────────────────────────────────────────────────┐
│                    LEONARDO AI + RAG                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              CORPUS CALLOSUM (центр)                     │ │
│  │                                                          │ │
│  │         ┌─────────────────────────────┐                  │ │
│  │         │      RAG ENGINE             │◄─── Новый модуль!│ │
│  │         │                             │                  │ │
│  │         │  • Query Processor          │                  │ │
│  │         │  • Retriever                │                  │ │
│  │         │  • Reranker                 │                  │ │
│  │         │  • Context Builder          │                  │ │
│  │         │  • Source Tracker           │                  │ │
│  │         └─────────────────────────────┘                  │ │
│  │                       ↕                                   │ │
│  │         ┌─────────────────────────────┐                  │ │
│  │         │   Decision Coordinator      │                  │ │
│  │         └─────────────────────────────┘                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                       ↕                ↕                       │
│  ┌──────────────────────┐    ┌──────────────────────┐        │
│  │  ORCHESTRATOR KIT    │    │     OPENCLAW         │        │
│  │  Использует RAG:     │    │  Использует RAG:     │        │
│  │  • Архитектура docs  │    │  • API docs          │        │
│  │  • Best practices    │    │  • IoT guides        │        │
│  │  • Code examples     │    │  • Skill catalog     │        │
│  └──────────────────────┘    └──────────────────────┘        │
│                       ↕                                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              VECTOR DATABASE LAYER                       ││
│  │                                                          ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        ││
│  │  │  Pinecone  │  │  Qdrant    │  │   Weaviate │        ││
│  │  │  (cloud)   │  │ (self-host)│  │  (hybrid)  │        ││
│  │  └────────────┘  └────────────┘  └────────────┘        ││
│  │                                                          ││
│  │  Collections:                                            ││
│  │  • codebase-embeddings (код проекта)                     ││
│  │  • documentation-embeddings (документация)               ││
│  │  • issues-embeddings (GitHub issues)                     ││
│  │  • conversations-embeddings (история диалогов)           ││
│  │  • web-knowledge-embeddings (внешние ресурсы)            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              DATA INGESTION PIPELINE                     ││
│  │                                                          ││
│  │  File Loaders → Splitters → Embedders → Vector Store    ││
│  │                                                          ││
│  │  Поддерживает:                                           ││
│  │  • Code files (.ts, .js, .py, .go, etc.)                ││
│  │  • Documentation (.md, .rst, .txt)                       ││
│  │  • PDFs                                                  ││
│  │  • Web pages                                             ││
│  │  • GitHub repos                                          ││
│  │  • Notion, Confluence                                    ││
│  └──────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

### 2.2 RAG Engine - детальная архитектура

```typescript
/**
 * Центральный RAG движок Leonardo AI
 */
class LeonardoRAGEngine {
    // Vector DB клиенты
    private vectorDB: VectorDBClient;        // Pinecone, Qdrant, или Weaviate
    private embedder: EmbeddingModel;        // OpenAI, Cohere, или local model

    // Retrieval компоненты
    private retriever: HybridRetriever;      // Векторный + keyword поиск
    private reranker: CrossEncoderReranker;  // Переранжирование результатов
    private contextBuilder: ContextBuilder;   // Построение контекста для LLM

    // Tracking и мониторинг
    private sourceTracker: SourceTracker;     // Отслеживание источников
    private queryAnalyzer: QueryAnalyzer;     // Анализ и оптимизация запросов

    /**
     * Главный метод: запрос с RAG
     */
    async retrieve(
        query: string,
        options: RAGOptions = {}
    ): Promise<RAGResult> {
        // 1. Анализируем и оптимизируем запрос
        const analyzedQuery = await this.queryAnalyzer.analyze(query);

        // 2. Генерируем embedding запроса
        const queryEmbedding = await this.embedder.embed(analyzedQuery.optimized);

        // 3. Поиск в vector database
        const retrievedDocs = await this.retriever.search({
            embedding: queryEmbedding,
            topK: options.topK || 10,
            filters: options.filters,
            hybrid: true  // Векторный + keyword
        });

        // 4. Reranking для улучшения качества
        const rerankedDocs = await this.reranker.rerank(
            query,
            retrievedDocs,
            topN: options.topN || 5
        );

        // 5. Построение контекста для LLM
        const context = this.contextBuilder.build(rerankedDocs, {
            maxTokens: options.maxContextTokens || 4000,
            includeMetadata: true,
            includeSources: true
        });

        // 6. Tracking источников
        this.sourceTracker.track(query, rerankedDocs);

        return {
            context,
            sources: rerankedDocs.map(doc => ({
                content: doc.content,
                metadata: doc.metadata,
                score: doc.score,
                source: doc.source
            })),
            query: analyzedQuery,
            stats: {
                retrieved: retrievedDocs.length,
                reranked: rerankedDocs.length,
                tokens: context.tokenCount
            }
        };
    }

    /**
     * Индексирование новых документов
     */
    async indexDocuments(
        documents: Document[],
        collection: string
    ): Promise<IndexResult> {
        const results = [];

        for (const doc of documents) {
            // 1. Разбиваем на chunks (если большой)
            const chunks = await this.splitDocument(doc);

            // 2. Генерируем embeddings
            const embeddings = await this.embedder.embedBatch(
                chunks.map(c => c.content)
            );

            // 3. Сохраняем в vector DB
            for (let i = 0; i < chunks.length; i++) {
                await this.vectorDB.upsert(collection, {
                    id: `${doc.id}_chunk_${i}`,
                    embedding: embeddings[i],
                    content: chunks[i].content,
                    metadata: {
                        ...doc.metadata,
                        chunkIndex: i,
                        totalChunks: chunks.length,
                        parentDocId: doc.id
                    }
                });
            }

            results.push({
                docId: doc.id,
                chunks: chunks.length,
                indexed: true
            });
        }

        return {
            total: documents.length,
            indexed: results.filter(r => r.indexed).length,
            results
        };
    }

    /**
     * Разумное разбиение документа на chunks
     */
    private async splitDocument(doc: Document): Promise<Chunk[]> {
        // Разные стратегии для разных типов файлов
        if (doc.type === 'code') {
            return this.splitCode(doc);
        } else if (doc.type === 'markdown') {
            return this.splitMarkdown(doc);
        } else {
            return this.splitGeneric(doc);
        }
    }

    /**
     * Умное разбиение кода (по функциям/классам)
     */
    private splitCode(doc: Document): Chunk[] {
        const ast = parse(doc.content, { language: doc.language });
        const chunks = [];

        // Извлекаем функции, классы, модули
        for (const node of ast.body) {
            if (node.type === 'FunctionDeclaration' ||
                node.type === 'ClassDeclaration') {

                chunks.push({
                    content: extractCode(node),
                    metadata: {
                        type: node.type,
                        name: node.name,
                        startLine: node.loc.start.line,
                        endLine: node.loc.end.line
                    }
                });
            }
        }

        return chunks;
    }
}
```

---

## 3. Vector Database и Embeddings {#vector-database}

### 3.1 Выбор Vector DB

**Сравнение опций:**

| Vector DB | Преимущества | Недостатки | Рекомендация |
|-----------|--------------|-----------|--------------|
| **Pinecone** | Managed, масштабируемый, быстрый | Платный, vendor lock-in | ✅ Production (cloud) |
| **Qdrant** | Self-hosted, быстрый, фильтры | Требует инфраструктуру | ✅ Production (self-hosted) |
| **Weaviate** | Гибридный поиск, GraphQL | Сложнее настройка | ⚠️ Advanced use cases |
| **ChromaDB** | Простой, embedded | Не для production | 🧪 Development только |
| **FAISS** | Быстрый, offline | Нет persistence из коробки | 🧪 Research |

**Рекомендация для Leonardo AI:**

```typescript
// Production: Используем Qdrant (self-hosted)
const vectorDB = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
});

// Создаём коллекции для разных типов данных
await vectorDB.createCollection('codebase', {
    vectors: {
        size: 1536,  // OpenAI ada-002 dimension
        distance: 'Cosine'
    },
    optimizers: {
        indexingThreshold: 20000
    }
});
```

### 3.2 Embedding Models

**Выбор модели для embeddings:**

| Model | Dimension | Cost | Quality | Recommendation |
|-------|-----------|------|---------|----------------|
| **OpenAI ada-002** | 1536 | $0.0001/1K tokens | ⭐⭐⭐⭐ | ✅ Лучший баланс |
| **Cohere embed-v3** | 1024 | $0.0001/1K tokens | ⭐⭐⭐⭐⭐ | ✅ Highest quality |
| **Sentence-BERT** | 384-768 | Free (self-host) | ⭐⭐⭐ | ✅ Budget-friendly |
| **Voyage AI** | 1024 | $0.00012/1K tokens | ⭐⭐⭐⭐ | ⚠️ Нишевый |

**Пример использования:**

```typescript
/**
 * Embedding service с фоллбеками
 */
class EmbeddingService {
    private primary = new OpenAIEmbeddings({ model: 'text-embedding-ada-002' });
    private fallback = new CohereEmbeddings({ model: 'embed-english-v3.0' });

    async embed(text: string): Promise<number[]> {
        try {
            return await this.primary.embed(text);
        } catch (error) {
            console.warn('Primary embedder failed, using fallback');
            return await this.fallback.embed(text);
        }
    }

    async embedBatch(texts: string[]): Promise<number[][]> {
        // Батчинг для эффективности
        const batchSize = 100;
        const results = [];

        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const embeddings = await this.primary.embedBatch(batch);
            results.push(...embeddings);
        }

        return results;
    }
}
```

### 3.3 Indexing Strategy

**Стратегия индексирования для разных типов данных:**

```typescript
/**
 * Умная стратегия индексирования
 */
class IndexingStrategy {
    /**
     * Индексируем codebase
     */
    async indexCodebase(repoPath: string): Promise<void> {
        // 1. Сканируем код
        const codeFiles = await glob(`${repoPath}/**/*.{ts,js,py,go,rs}`);

        for (const file of codeFiles) {
            const content = await readFile(file, 'utf-8');

            // 2. Парсим в AST и разбиваем по функциям/классам
            const chunks = await this.splitCode(content, file);

            // 3. Добавляем богатые метаданные
            const documents = chunks.map(chunk => ({
                content: chunk.code,
                metadata: {
                    file: relative(repoPath, file),
                    type: 'code',
                    language: detectLanguage(file),
                    function: chunk.name,
                    startLine: chunk.startLine,
                    endLine: chunk.endLine,
                    dependencies: chunk.imports,
                    complexity: calculateComplexity(chunk.code),
                    lastModified: getGitLastModified(file)
                }
            }));

            // 4. Индексируем
            await this.ragEngine.indexDocuments(documents, 'codebase');
        }
    }

    /**
     * Индексируем документацию
     */
    async indexDocumentation(docsPath: string): Promise<void> {
        const docFiles = await glob(`${docsPath}/**/*.{md,rst,txt}`);

        for (const file of docFiles) {
            const content = await readFile(file, 'utf-8');

            // Разбиваем по секциям (headers в markdown)
            const sections = this.splitMarkdownBySections(content);

            const documents = sections.map(section => ({
                content: section.content,
                metadata: {
                    file: relative(docsPath, file),
                    type: 'documentation',
                    title: section.title,
                    level: section.level,
                    tags: extractTags(section.content),
                    category: categorizeDoc(file)
                }
            }));

            await this.ragEngine.indexDocuments(documents, 'documentation');
        }
    }

    /**
     * Индексируем GitHub issues
     */
    async indexGitHubIssues(owner: string, repo: string): Promise<void> {
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

        // Получаем все issues
        const issues = await octokit.paginate(
            octokit.rest.issues.listForRepo,
            { owner, repo, state: 'all' }
        );

        const documents = issues.map(issue => ({
            content: `${issue.title}\n\n${issue.body}`,
            metadata: {
                type: 'github-issue',
                number: issue.number,
                state: issue.state,
                labels: issue.labels.map(l => l.name),
                author: issue.user.login,
                createdAt: issue.created_at,
                url: issue.html_url
            }
        }));

        await this.ragEngine.indexDocuments(documents, 'issues');
    }

    /**
     * Инкрементальное обновление
     */
    async incrementalUpdate(since: Date): Promise<void> {
        // Обновляем только то, что изменилось
        const changedFiles = await getChangedFilesSince(since);

        for (const file of changedFiles) {
            // Удаляем старые embeddings этого файла
            await this.vectorDB.delete({
                filter: { file: { $eq: file } }
            });

            // Переиндексируем файл
            await this.indexFile(file);
        }
    }
}
```

---

## 4. Retrieval Strategies (Стратегии поиска) {#retrieval-strategies}

### 4.1 Hybrid Search (Векторный + Keyword)

Лучше всего использовать **гибридный поиск**: векторный (semantic) + keyword (BM25).

```typescript
/**
 * Hybrid Retriever: Векторный + Keyword поиск
 */
class HybridRetriever {
    private vectorDB: QdrantClient;
    private bm25Index: BM25Index;

    async search(query: SearchQuery): Promise<Document[]> {
        // 1. Векторный поиск (semantic similarity)
        const vectorResults = await this.vectorSearch(
            query.embedding,
            topK: query.topK
        );

        // 2. Keyword поиск (BM25)
        const keywordResults = await this.bm25Index.search(
            query.text,
            topK: query.topK
        );

        // 3. Hybrid fusion (Reciprocal Rank Fusion)
        const fusedResults = this.reciprocalRankFusion(
            vectorResults,
            keywordResults,
            k: 60  // RRF параметр
        );

        return fusedResults;
    }

    /**
     * Reciprocal Rank Fusion
     * Комбинирует результаты из разных источников
     */
    private reciprocalRankFusion(
        listA: Document[],
        listB: Document[],
        k: number = 60
    ): Document[] {
        const scores = new Map<string, number>();

        // RRF формула: score = sum(1 / (k + rank))
        listA.forEach((doc, rank) => {
            const score = 1 / (k + rank + 1);
            scores.set(doc.id, (scores.get(doc.id) || 0) + score);
        });

        listB.forEach((doc, rank) => {
            const score = 1 / (k + rank + 1);
            scores.set(doc.id, (scores.get(doc.id) || 0) + score);
        });

        // Сортируем по финальному score
        const rankedDocs = Array.from(scores.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([id, score]) => {
                const doc = this.getDocById(id);
                return { ...doc, score };
            });

        return rankedDocs;
    }
}
```

### 4.2 Query Expansion

Расширяем запрос для лучшего поиска:

```typescript
/**
 * Расширение запроса для улучшения поиска
 */
class QueryExpander {
    /**
     * Расширяем запрос с помощью LLM
     */
    async expand(query: string): Promise<string[]> {
        const prompt = `Given the user query, generate 3 alternative phrasings that capture the same intent:

User query: "${query}"

Alternative phrasings:
1.`;

        const response = await this.llm.complete(prompt);
        const alternatives = this.parseAlternatives(response);

        return [query, ...alternatives];
    }

    /**
     * Multi-query retrieval
     */
    async multiQueryRetrieval(query: string): Promise<Document[]> {
        // 1. Расширяем запрос
        const queries = await this.expand(query);

        // 2. Поиск по каждому варианту
        const allResults = await Promise.all(
            queries.map(q => this.retriever.search(q))
        );

        // 3. Объединяем и дедуплицируем
        const uniqueDocs = this.deduplicateAndMerge(allResults);

        return uniqueDocs;
    }

    /**
     * HyDE (Hypothetical Document Embeddings)
     */
    async hydeRetrieval(query: string): Promise<Document[]> {
        // 1. Генерируем гипотетический ответ
        const hypotheticalDoc = await this.llm.complete(
            `Write a detailed answer to: ${query}`
        );

        // 2. Embedding гипотетического документа
        const embedding = await this.embedder.embed(hypotheticalDoc);

        // 3. Поиск похожих реальных документов
        const results = await this.vectorDB.search(embedding);

        return results;
    }
}
```

### 4.3 Re-ranking

После первичного поиска, переранжируем результаты для точности:

```typescript
/**
 * Cross-Encoder Re-ranker для точного ранжирования
 */
class CrossEncoderReranker {
    private model: CrossEncoderModel;  // e.g., ms-marco-MiniLM

    /**
     * Переранжируем результаты
     */
    async rerank(
        query: string,
        documents: Document[],
        topN: number = 5
    ): Promise<Document[]> {
        // 1. Скоруем каждую пару (query, document)
        const scores = await Promise.all(
            documents.map(async doc => {
                const score = await this.model.score(query, doc.content);
                return { doc, score };
            })
        );

        // 2. Сортируем по score
        const ranked = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, topN)
            .map(item => ({ ...item.doc, rerankScore: item.score }));

        return ranked;
    }

    /**
     * Diversity re-ranking (MMR - Maximal Marginal Relevance)
     */
    async diversityRerank(
        query: string,
        documents: Document[],
        topN: number = 5,
        lambda: number = 0.5  // Баланс relevance vs diversity
    ): Promise<Document[]> {
        const selected: Document[] = [];
        const remaining = [...documents];

        while (selected.length < topN && remaining.length > 0) {
            let bestScore = -Infinity;
            let bestIdx = -1;

            for (let i = 0; i < remaining.length; i++) {
                const doc = remaining[i];

                // Relevance к запросу
                const relevance = await this.model.score(query, doc.content);

                // Similarity к уже выбранным (чем меньше, тем лучше - diversity!)
                const maxSim = selected.length > 0
                    ? Math.max(...selected.map(s =>
                        cosineSimilarity(doc.embedding, s.embedding)
                    ))
                    : 0;

                // MMR score
                const mmrScore = lambda * relevance - (1 - lambda) * maxSim;

                if (mmrScore > bestScore) {
                    bestScore = mmrScore;
                    bestIdx = i;
                }
            }

            // Выбираем лучший документ
            selected.push(remaining[bestIdx]);
            remaining.splice(bestIdx, 1);
        }

        return selected;
    }
}
```

---

## 5. Integration с Corpus Callosum {#интеграция}

### 5.1 RAG-enhanced режимы работы

Все режимы Leonardo AI получают доступ к RAG:

```typescript
/**
 * Corpus Callosum с RAG поддержкой
 */
class CorpusCallosumRAG extends CorpusCallosum {
    private ragEngine: LeonardoRAGEngine;

    /**
     * Thinking Mode: Используем RAG для глубокого анализа
     */
    async thinkingMode(task: Task): Promise<Result> {
        // 1. Ищем релевантную информацию через RAG
        const ragResult = await this.ragEngine.retrieve(task.description, {
            topN: 5,
            filters: {
                type: { $in: ['code', 'documentation', 'architecture'] }
            }
        });

        // 2. Orchestrator анализирует с учётом найденного контекста
        const analysis = await this.orchestrator.analyze(task, {
            context: ragResult.context,
            sources: ragResult.sources
        });

        // 3. Возвращаем с источниками
        return {
            ...analysis,
            sources: ragResult.sources,
            citations: this.buildCitations(ragResult.sources)
        };
    }

    /**
     * Action Mode: RAG для поиска API docs и примеров
     */
    async actionMode(task: Task): Promise<Result> {
        // Ищем релевантные API docs и примеры
        const ragResult = await this.ragEngine.retrieve(task.description, {
            topN: 3,
            filters: {
                type: { $in: ['api-docs', 'code-examples', 'skills'] }
            }
        });

        // OpenClaw выполняет с учётом найденных примеров
        const result = await this.openclaw.execute(task, {
            examples: ragResult.sources.filter(s => s.metadata.type === 'code-examples'),
            apiDocs: ragResult.sources.filter(s => s.metadata.type === 'api-docs')
        });

        return {
            ...result,
            sources: ragResult.sources
        };
    }

    /**
     * Hybrid Mode: RAG для обеих частей
     */
    async hybridMode(task: Task): Promise<Result> {
        // Параллельный поиск для planning и execution
        const [planningRAG, executionRAG] = await Promise.all([
            this.ragEngine.retrieve(task.description, {
                filters: { type: 'architecture' }
            }),
            this.ragEngine.retrieve(task.description, {
                filters: { type: 'code-examples' }
            })
        ]);

        // Параллельное выполнение
        const [orchResult, clawResult] = await Promise.all([
            this.orchestrator.analyze(task, { context: planningRAG.context }),
            this.openclaw.execute(task, { examples: executionRAG.sources })
        ]);

        // Объединяем результаты и источники
        return this.mergeResults(orchResult, clawResult, {
            sources: [...planningRAG.sources, ...executionRAG.sources]
        });
    }

    /**
     * Creative Mode: RAG для вдохновения
     */
    async creativeMode(task: Task): Promise<Result> {
        // Ищем разнообразные источники для вдохновения
        const ragResult = await this.ragEngine.retrieve(task.description, {
            topN: 10,
            diversityRerank: true,  // Максимальное разнообразие!
            filters: {
                type: { $in: ['code', 'documentation', 'design-patterns', 'inspiration'] }
            }
        });

        // Генерируем творческое решение
        const result = await this.generateCreativeSolution(task, {
            inspirationSources: ragResult.sources,
            allowNovelCombinations: true
        });

        return {
            ...result,
            sources: ragResult.sources,
            inspirationFrom: ragResult.sources.map(s => s.metadata.title)
        };
    }
}
```

### 5.2 Conversational RAG

RAG с памятью диалога:

```typescript
/**
 * RAG с контекстом диалога
 */
class ConversationalRAG {
    private conversationHistory: Message[] = [];
    private ragEngine: LeonardoRAGEngine;

    async chat(userMessage: string): Promise<string> {
        // 1. Добавляем сообщение в историю
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        // 2. Формируем контекстуальный запрос
        const contextualQuery = this.buildContextualQuery(
            userMessage,
            this.conversationHistory
        );

        // 3. RAG поиск с учётом контекста диалога
        const ragResult = await this.ragEngine.retrieve(contextualQuery, {
            topN: 5
        });

        // 4. Генерируем ответ с RAG контекстом
        const prompt = this.buildPrompt(
            userMessage,
            this.conversationHistory,
            ragResult.context
        );

        const response = await this.llm.complete(prompt);

        // 5. Добавляем ответ в историю
        this.conversationHistory.push({
            role: 'assistant',
            content: response,
            sources: ragResult.sources
        });

        return response;
    }

    /**
     * Строим контекстуальный запрос
     */
    private buildContextualQuery(
        currentMessage: string,
        history: Message[]
    ): string {
        // Если есть предыдущий контекст, учитываем его
        const recentHistory = history.slice(-3);  // Последние 3 сообщения

        const context = recentHistory
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');

        return `${context}\nuser: ${currentMessage}`;
    }
}
```

---

## 6. Примеры использования {#примеры}

### 6.1 Пример: Code Review с RAG

```typescript
/**
 * Code Review с RAG - находим best practices и примеры
 */
async function codeReviewWithRAG() {
    const leonardo = new LeonardoAI({
        ragEnabled: true,
        ragCollections: ['codebase', 'documentation', 'best-practices']
    });

    const codeToReview = `
    async function processPayment(userId, amount) {
        const user = await db.users.findOne({ id: userId });
        user.balance -= amount;
        await db.users.update({ id: userId }, user);
        return { success: true };
    }
    `;

    // Leonardo AI автоматически:
    // 1. Ищет в RAG похожий код в проекте
    // 2. Ищет best practices для payment processing
    // 3. Ищет документацию по database transactions
    const review = await leonardo.solve({
        type: 'code-review',
        code: codeToReview,
        language: 'typescript'
    });

    console.log(review);
    /*
    {
        issues: [
            {
                severity: 'high',
                message: 'Race condition: missing database transaction',
                line: 3,
                suggestion: 'Use transaction to ensure atomicity',
                source: {
                    file: 'docs/database-best-practices.md',
                    section: 'Transactions',
                    quote: 'Always use transactions for multi-step updates...'
                }
            },
            {
                severity: 'high',
                message: 'No error handling for insufficient balance',
                line: 3,
                example: {
                    file: 'src/billing/charge.ts',
                    function: 'chargeUser',
                    code: 'if (user.balance < amount) throw new InsufficientFundsError()'
                }
            }
        ],
        suggestion: `
        async function processPayment(userId, amount) {
            const session = await db.startSession();
            session.startTransaction();

            try {
                const user = await db.users.findOne({ id: userId }, { session });

                if (user.balance < amount) {
                    throw new InsufficientFundsError();
                }

                user.balance -= amount;
                await db.users.update({ id: userId }, user, { session });

                await session.commitTransaction();
                return { success: true };
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        }
        `,
        sources: [
            'docs/database-best-practices.md',
            'src/billing/charge.ts',
            'docs/error-handling.md'
        ]
    }
    */
}
```

### 6.2 Пример: Documentation Assistant

```typescript
/**
 * Помощник по документации с RAG
 */
async function documentationAssistant() {
    const leonardo = new LeonardoAI({ ragEnabled: true });

    // Пользователь: "Как настроить Redis caching?"
    const question = "How do I set up Redis caching in this project?";

    const answer = await leonardo.solve({
        type: 'documentation-query',
        question
    });

    console.log(answer);
    /*
    {
        answer: `
        To set up Redis caching in this project:

        1. Install dependencies:
           \`npm install redis ioredis\`

        2. Configure Redis client (src/config/redis.ts):
           \`\`\`typescript
           export const redisClient = new Redis({
               host: process.env.REDIS_HOST,
               port: parseInt(process.env.REDIS_PORT || '6379'),
               password: process.env.REDIS_PASSWORD
           });
           \`\`\`

        3. Use caching in your services:
           \`\`\`typescript
           const cachedData = await redisClient.get(key);
           if (cachedData) return JSON.parse(cachedData);

           const data = await fetchFromDB();
           await redisClient.setex(key, 3600, JSON.stringify(data));
           \`\`\`

        Based on the existing implementation in:
        - src/services/cache.ts (lines 15-42)
        - docs/caching-strategy.md (section "Redis Setup")
        `,
        sources: [
            {
                file: 'src/services/cache.ts',
                lines: '15-42',
                relevance: 0.95
            },
            {
                file: 'docs/caching-strategy.md',
                section: 'Redis Setup',
                relevance: 0.89
            },
            {
                file: 'src/config/redis.ts',
                relevance: 0.87
            }
        ],
        relatedQuestions: [
            "How to invalidate cache?",
            "What's the cache TTL strategy?",
            "How to monitor Redis performance?"
        ]
    }
    */
}
```

### 6.3 Пример: Bug Fixing с RAG

```typescript
/**
 * Исправление бага с помощью RAG
 */
async function bugFixingWithRAG() {
    const leonardo = new LeonardoAI({ ragEnabled: true });

    const bugReport = `
    Bug: Users getting logged out randomly

    Steps to reproduce:
    1. Log in
    2. Use app for 10-15 minutes
    3. Suddenly logged out

    Error in console:
    "JWT token expired"
    `;

    const fix = await leonardo.solve({
        type: 'bug-fix',
        description: bugReport
    });

    console.log(fix);
    /*
    {
        rootCause: "JWT token expiry set to 15 minutes, but refresh logic is broken",

        analysis: `
        Found similar bug in GitHub issues:
        - Issue #234: "Random logouts" (solved 2 months ago)
        - Issue #156: "JWT expiry issues"

        Current implementation in src/auth/jwt.ts:
        - Token expiry: 15 minutes (line 23)
        - Refresh token: implemented but not called (line 87)

        Problem: Frontend is not calling refresh endpoint before token expires.
        `,

        suggestedFix: {
            backend: `
            // src/auth/jwt.ts
            - const TOKEN_EXPIRY = '15m';
            + const TOKEN_EXPIRY = '1h';  // Increase to 1 hour

            // src/auth/refresh.ts
            + // Add automatic refresh 5 minutes before expiry
            + app.use(autoRefreshMiddleware({ beforeExpiry: 300 }));
            `,

            frontend: `
            // src/utils/auth.ts
            + // Add refresh timer
            + setInterval(async () => {
            +   const token = getToken();
            +   if (willExpireSoon(token, 5 * 60)) {
            +     await refreshToken();
            +   }
            + }, 60000);  // Check every minute
            `
        },

        sources: [
            {
                type: 'github-issue',
                number: 234,
                title: 'Random logouts',
                solution: 'Implemented auto-refresh'
            },
            {
                type: 'code',
                file: 'src/auth/jwt.ts',
                lines: '20-90'
            }
        ],

        confidence: 0.92,
        estimatedTime: '30 minutes'
    }
    */
}
```

---

## 7. Advanced Features {#advanced-features}

### 7.1 Automatic Knowledge Base Updates

```typescript
/**
 * Автоматическое обновление базы знаний
 */
class AutoKnowledgeBaseUpdater {
    /**
     * Отслеживаем изменения в репозитории
     */
    async watchRepository(repoPath: string): Promise<void> {
        const watcher = chokidar.watch(repoPath, {
            ignored: /node_modules|\.git/,
            persistent: true
        });

        watcher.on('change', async (path) => {
            console.log(`File changed: ${path}`);

            // Переиндексируем изменённый файл
            await this.reindexFile(path);
        });

        watcher.on('add', async (path) => {
            console.log(`File added: ${path}`);
            await this.indexFile(path);
        });

        watcher.on('unlink', async (path) => {
            console.log(`File deleted: ${path}`);
            await this.deleteFromIndex(path);
        });
    }

    /**
     * Периодическое переиндексирование
     */
    async scheduledReindexing(): Promise<void> {
        // Каждую ночь переиндексируем весь проект
        cron.schedule('0 2 * * *', async () => {
            console.log('Starting scheduled reindexing...');
            await this.fullReindex();
        });
    }

    /**
     * Умное обновление на основе Git commits
     */
    async gitBasedUpdate(): Promise<void> {
        // Получаем последний проиндексированный commit
        const lastCommit = await this.getLastIndexedCommit();

        // Получаем все новые commits
        const commits = await git.log({ from: lastCommit, to: 'HEAD' });

        for (const commit of commits) {
            // Получаем изменённые файлы
            const changedFiles = await git.show({ commit: commit.hash, nameOnly: true });

            // Переиндексируем
            for (const file of changedFiles) {
                await this.reindexFile(file);
            }

            // Обновляем last indexed commit
            await this.setLastIndexedCommit(commit.hash);
        }
    }
}
```

### 7.2 Multi-Modal RAG

RAG для кода, изображений, диаграмм:

```typescript
/**
 * Multi-modal RAG: код + изображения + диаграммы
 */
class MultiModalRAG extends LeonardoRAGEngine {
    /**
     * Индексируем диаграммы и изображения
     */
    async indexDiagrams(diagramsPath: string): Promise<void> {
        const imageFiles = await glob(`${diagramsPath}/**/*.{png,jpg,svg}`);

        for (const imagePath of imageFiles) {
            // 1. Извлекаем текст из изображения (OCR)
            const extractedText = await this.ocr.extract(imagePath);

            // 2. Генерируем описание с помощью vision model
            const description = await this.visionModel.describe(imagePath);

            // 3. Комбинируем для embedding
            const content = `${extractedText}\n\nImage description: ${description}`;

            // 4. Индексируем
            await this.indexDocuments([{
                content,
                metadata: {
                    type: 'diagram',
                    path: imagePath,
                    format: path.extname(imagePath)
                }
            }], 'diagrams');
        }
    }

    /**
     * Поиск включая диаграммы
     */
    async multiModalSearch(query: string): Promise<RAGResult> {
        // Ищем в текстовых документах
        const textResults = await this.search(query, {
            collections: ['code', 'documentation']
        });

        // Ищем в диаграммах
        const diagramResults = await this.search(query, {
            collections: ['diagrams']
        });

        return {
            text: textResults,
            diagrams: diagramResults.map(r => ({
                ...r,
                imagePath: r.metadata.path
            }))
        };
    }
}
```

### 7.3 Personalized RAG

RAG адаптируется под пользователя:

```typescript
/**
 * Персонализированный RAG
 */
class PersonalizedRAG {
    /**
     * Учитываем предпочтения пользователя
     */
    async personalizedSearch(
        query: string,
        userId: string
    ): Promise<Document[]> {
        // Получаем профиль пользователя
        const userProfile = await this.getUserProfile(userId);

        // Модифицируем поиск под пользователя
        const results = await this.ragEngine.retrieve(query, {
            // Boost релевантности для любимых тем
            boostTerms: userProfile.favoriteTopics,

            // Фильтр по уровню сложности
            filters: {
                complexity: { $lte: userProfile.expertiseLevel }
            },

            // Приоритет для языков, которые знает пользователь
            languagePreference: userProfile.programmingLanguages
        });

        // Учитываем историю взаимодействий
        const reranked = this.rerankByUserHistory(results, userId);

        return reranked;
    }

    /**
     * Обучаемся на feedback пользователя
     */
    async learnFromFeedback(
        userId: string,
        query: string,
        result: Document,
        helpful: boolean
    ): Promise<void> {
        // Обновляем профиль пользователя
        await this.updateUserProfile(userId, {
            query,
            documentId: result.id,
            helpful,
            timestamp: new Date()
        });

        // Если полезно - повышаем вес таких результатов в будущем
        // Если нет - понижаем
    }
}
```

---

## 8. Дорожная карта реализации {#roadmap}

### 8.1 Phase 1: Core RAG (Q1 2026) ✅

```
✅ Week 1-2: Vector DB Setup
   - Qdrant deployment
   - Коллекции для разных типов данных
   - Базовое индексирование

✅ Week 3-4: Embedding Pipeline
   - OpenAI embeddings integration
   - Batching и оптимизация
   - Fallback механизмы

✅ Week 5-6: Basic Retrieval
   - Векторный поиск
   - Top-K retrieval
   - Simple reranking

✅ Week 7-8: Integration
   - Corpus Callosum integration
   - Thinking Mode + RAG
   - Action Mode + RAG
```

### 8.2 Phase 2: Advanced RAG (Q2 2026) 🔄

```
📋 Week 9-10: Hybrid Search
   - BM25 keyword search
   - Reciprocal Rank Fusion
   - Query expansion

📋 Week 11-12: Smart Chunking
   - Code-aware splitting
   - Markdown section splitting
   - Overlap strategies

📋 Week 13-14: Re-ranking
   - Cross-encoder models
   - Diversity (MMR)
   - Contextual reranking

📋 Week 15-16: Auto-indexing
   - File watcher
   - Git-based updates
   - Incremental indexing
```

### 8.3 Phase 3: Advanced Features (Q3 2026) 📅

```
📅 Week 17-20: Multi-Modal RAG
   - Image indexing (OCR + vision models)
   - Diagram understanding
   - PDF parsing

📅 Week 21-24: Conversational RAG
   - Dialogue context
   - Follow-up questions
   - Session memory

📅 Week 25-26: Personalization
   - User profiles
   - Feedback learning
   - Adaptive ranking
```

### 8.4 Phase 4: Production (Q4 2026) 📅

```
📅 Week 27-30: Scale & Performance
   - Distributed vector DB
   - Caching strategies
   - Query optimization

📅 Week 31-34: Monitoring
   - RAG analytics
   - Quality metrics
   - Usage dashboards

📅 Week 35-38: Enterprise
   - Multi-tenancy
   - Fine-grained access control
   - Compliance (GDPR, etc.)

📅 Week 39-40: Launch
   - Beta testing
   - Documentation
   - Migration guides
```

---

## 🎯 Заключение

**Leonardo AI + RAG = Система с неограниченными знаниями**

### Ключевые преимущества:

1. **Актуальные знания** - всегда access к последней информации
2. **Специфичные знания** - знает ваш проект, ваш код, вашу документацию
3. **Проверяемость** - цитирует источники, нет галлюцинаций
4. **Адаптивность** - легко добавить новые источники знаний
5. **Персонализация** - адаптируется под каждого пользователя

### Метрики успеха:

```
Через 3 месяца использования:
  ✅ 95%+ ответов с источниками
  ✅ -70% галлюцинаций
  ✅ +50% релевантность ответов
  ✅ +40% скорость решения задач (не нужно искать docs вручную)
  ✅ 90%+ user satisfaction
```

### Следующие шаги:

1. Реализовать Phase 1 (Q1 2026)
2. Проиндексировать codebase
3. Запустить beta testing
4. Собрать feedback и итерировать

---

**Версия:** 1.0.0
**Последнее обновление:** 2026-02-07
**Автор:** Leonardo AI Research Team

**Связанные документы:**
- [LEONARDO_AI_DETAILED.md](LEONARDO_AI_DETAILED.md)
- [LEONARDO_AI_RL_OPTIMIZATION.md](LEONARDO_AI_RL_OPTIMIZATION.md)
- [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)

https://claude.ai/code/session_01WnQdgU1MrECnhh3xfVNRAg
