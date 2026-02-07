/**
 * Leonardo AI RAG Engine - Usage Example
 *
 * Demonstrates how to use the RAG module
 */

import { RAGEngine, DEFAULT_RAG_CONFIG, Document } from './index';

/**
 * Sample documents for knowledge base
 */
const sampleDocuments: Document[] = [
  {
    id: 'doc-1',
    content: `Leonardo AI is a revolutionary AI orchestration system that combines the best of three worlds:

1. Orchestrator Kit provides theoretical planning and strategic thinking
2. OpenClaw delivers practical execution and task automation
3. Leonardo AI itself acts as the Corpus Callosum, bridging the two hemispheres

The system operates in multiple modes:
- Thinking Mode: Deep analysis using Orchestrator Kit
- Action Mode: Direct execution via OpenClaw
- Iterative Mode: Gradual refinement through multiple cycles
- Parallel Mode: Simultaneous processing of independent tasks
- Creative Mode: Novel solution generation combining both systems`,
    metadata: {
      title: 'Leonardo AI Overview',
      source: 'docs/overview.md',
      type: 'documentation',
      tags: ['overview', 'architecture'],
      createdAt: Date.now(),
    },
  },
  {
    id: 'doc-2',
    content: `Reinforcement Learning in Leonardo AI enables the system to learn from experience:

The RL module consists of:
- Policy Network: Learns which actions to take in different situations
- Value Network: Estimates expected returns from states
- Reward Calculator: Provides multi-criteria feedback (success, quality, time, resources)
- Experience Replay Buffer: Stores past experiences for learning
- Exploration Strategy: Balances trying new approaches vs using known good ones

This allows Leonardo AI to continuously improve its performance over time, adapting to new tasks and optimizing resource usage automatically.`,
    metadata: {
      title: 'Leonardo AI Reinforcement Learning',
      source: 'docs/rl-module.md',
      type: 'documentation',
      tags: ['rl', 'machine-learning'],
      createdAt: Date.now(),
    },
  },
  {
    id: 'doc-3',
    content: `RAG (Retrieval-Augmented Generation) in Leonardo AI provides:

1. Knowledge Base Management: Store and organize documents
2. Semantic Search: Find relevant information using embeddings
3. Context Injection: Add retrieved information to prompts
4. Hybrid Retrieval: Combine semantic and keyword search

Use cases:
- Corporate documentation: Laws, regulations, procedures
- Technical support: FAQ, troubleshooting guides
- Personalization: User history and preferences
- Long-term memory: Persistent knowledge across sessions

The RAG module integrates with vector databases like Pinecone, Weaviate, and Qdrant for efficient similarity search.`,
    metadata: {
      title: 'Leonardo AI RAG Integration',
      source: 'docs/rag-module.md',
      type: 'documentation',
      tags: ['rag', 'retrieval', 'knowledge-base'],
      createdAt: Date.now(),
    },
  },
];

/**
 * Main example
 */
async function main() {
  console.log('🧠 Leonardo AI RAG Engine - Example\n');

  // Initialize RAG engine
  const ragConfig = {
    ...DEFAULT_RAG_CONFIG,
    // Override with your API keys
    vectorDB: {
      ...DEFAULT_RAG_CONFIG.vectorDB,
      connection: {
        ...DEFAULT_RAG_CONFIG.vectorDB.connection,
        apiKey: process.env.PINECONE_API_KEY || 'your-pinecone-api-key',
      },
    },
    embedding: {
      ...DEFAULT_RAG_CONFIG.embedding,
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
    },
  };

  const ragEngine = new RAGEngine(ragConfig);

  console.log('✅ RAG Engine initialized');
  console.log('📊 Configuration:', {
    vectorDB: ragConfig.vectorDB.provider,
    embedding: `${ragConfig.embedding.provider}/${ragConfig.embedding.model}`,
    dimension: ragConfig.vectorDB.dimension,
  });
  console.log();

  // Initialize (create index if needed)
  console.log('🔧 Initializing vector database...');
  await ragEngine.initialize();
  console.log('✅ Vector database ready\n');

  // Add documents to knowledge base
  console.log('📚 Adding documents to knowledge base...');
  for (const doc of sampleDocuments) {
    console.log(`  Adding: ${doc.metadata.title}`);
    await ragEngine.addDocument(doc);
  }
  console.log('✅ Documents added\n');

  // Get knowledge base stats
  const kbStats = await ragEngine.getKnowledgeBaseStats();
  console.log('📊 Knowledge Base Statistics:');
  console.log(`  Total documents: ${kbStats.totalDocuments}`);
  console.log(`  Total vectors: ${kbStats.totalVectors}`);
  console.log(`  Dimension: ${kbStats.dimension}`);
  console.log();

  // Example queries
  const queries = [
    'What is Leonardo AI?',
    'How does reinforcement learning work in Leonardo AI?',
    'What are the use cases for RAG?',
    'What modes does Leonardo AI support?',
  ];

  console.log('🔍 Running example queries:\n');

  for (const query of queries) {
    console.log(`Query: "${query}"`);

    // Retrieve relevant documents
    const results = await ragEngine.retrieve(query, 2);

    console.log(`  Found ${results.length} relevant documents:`);
    for (const result of results) {
      console.log(
        `    - ${result.document.metadata.title} (relevance: ${(result.score * 100).toFixed(1)}%)`
      );
      console.log(`      Preview: ${result.document.content.slice(0, 100)}...`);
    }

    // Generate RAG-augmented prompt
    const prompt = await ragEngine.generatePrompt(query, 2);
    console.log(`  Generated prompt (${prompt.length} characters)`);
    console.log();
  }

  // Example: Full RAG query with context summary
  console.log('📋 Full RAG query example:\n');

  const fullQuery = await ragEngine.query(
    'How can I use Leonardo AI for machine learning?',
    {
      topK: 3,
      includeContext: true,
      includeSources: true,
    }
  );

  console.log('Query: "How can I use Leonardo AI for machine learning?"');
  console.log(`\nContext Summary:`);
  console.log(`  Total results: ${fullQuery.contextSummary.totalResults}`);
  console.log(`  Context length: ${fullQuery.contextSummary.totalLength} chars`);
  console.log(
    `  Average relevance: ${(fullQuery.contextSummary.averageRelevance * 100).toFixed(1)}%`
  );
  console.log(`  Sources: ${fullQuery.contextSummary.sources.join(', ')}`);
  console.log();

  if (fullQuery.prompt) {
    console.log('Generated Prompt:');
    console.log('---');
    console.log(fullQuery.prompt.slice(0, 500) + '...');
    console.log('---\n');
  }

  // Example: Chat messages for LLM
  console.log('💬 Chat messages example:\n');

  const chatMessages = await ragEngine.generateChatMessages(
    'Explain the RL module',
    2
  );

  console.log('Generated messages for LLM:');
  for (const msg of chatMessages) {
    console.log(`\n[${msg.role.toUpperCase()}]:`);
    console.log(msg.content.slice(0, 200) + '...');
  }
  console.log();

  // Get retrieval statistics
  const stats = ragEngine.getStats();
  console.log('📊 Retrieval Statistics:');
  console.log(`  Total queries: ${stats.totalQueries}`);
  console.log(`  Avg retrieval time: ${stats.avgRetrievalTime.toFixed(0)}ms`);
  console.log(`  Avg results returned: ${stats.avgResultsReturned.toFixed(1)}`);
  console.log(`  Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
  console.log();

  // Update example
  console.log('🔄 Update document example:\n');

  const updatedDoc: Document = {
    ...sampleDocuments[0],
    content: sampleDocuments[0].content + '\n\nUpdated with new information!',
    metadata: {
      ...sampleDocuments[0].metadata,
      updatedAt: Date.now(),
    },
  };

  console.log(`Updating document: ${updatedDoc.metadata.title}`);
  await ragEngine.updateDocument(updatedDoc);
  console.log('✅ Document updated\n');

  // Cleanup example
  console.log('🧹 Cleanup:\n');

  console.log('Clearing cache...');
  ragEngine.clearCache();
  console.log('✅ Cache cleared');

  console.log('\n✅ Example complete!');
}

// Run example if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export { main as runRAGExample };
