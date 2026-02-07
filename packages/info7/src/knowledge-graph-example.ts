/**
 * Knowledge Graph Examples
 *
 * Demonstrates semantic knowledge graph capabilities including graph building,
 * querying, semantic search, knowledge extraction, and analytics.
 */

import { Logger } from '@info7/common';
import {
  KnowledgeGraphEngine,
  KnowledgeNode,
  KnowledgeEdge,
  NodeType,
  RelationType,
  GraphQuery,
  SemanticSearchQuery,
} from './knowledge-graph';

const logger = new Logger('knowledge-graph-example');

/**
 * Example 1: Building a Knowledge Graph
 */
async function example1_BuildingGraph() {
  logger.info('Example 1: Building a Knowledge Graph');

  const engine = new KnowledgeGraphEngine({
    enableEmbeddings: true,
    embeddingDimension: 384,
    cacheEnabled: true,
  });

  // Add concept nodes
  const concepts = [
    {
      id: 'ai-concept',
      type: NodeType.CONCEPT,
      label: 'Artificial Intelligence',
      properties: {
        description: 'The simulation of human intelligence by machines',
        domain: 'Computer Science',
        complexity: 0.9,
      },
      tags: ['ai', 'technology', 'intelligence'],
    },
    {
      id: 'ml-concept',
      type: NodeType.CONCEPT,
      label: 'Machine Learning',
      properties: {
        description: 'A subset of AI that enables systems to learn from data',
        domain: 'Computer Science',
        complexity: 0.8,
      },
      tags: ['ml', 'ai', 'learning'],
    },
    {
      id: 'dl-concept',
      type: NodeType.CONCEPT,
      label: 'Deep Learning',
      properties: {
        description: 'Neural networks with multiple layers',
        domain: 'Computer Science',
        complexity: 0.85,
      },
      tags: ['deep-learning', 'neural-networks', 'ai'],
    },
    {
      id: 'nlp-concept',
      type: NodeType.CONCEPT,
      label: 'Natural Language Processing',
      properties: {
        description: 'AI techniques for understanding and generating human language',
        domain: 'Computer Science',
        complexity: 0.75,
      },
      tags: ['nlp', 'language', 'ai'],
    },
  ];

  logger.info('\nAdding concept nodes...');
  for (const concept of concepts) {
    const node: KnowledgeNode = {
      ...concept,
      embedding: undefined,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        source: 'manual',
        confidence: 0.95,
        accessCount: 0,
        lastAccessed: Date.now(),
      },
    };
    engine.addNode(node);
    logger.info(`  ✓ Added: ${concept.label}`);
  }

  // Add relationships
  const relationships = [
    {
      sourceId: 'ml-concept',
      targetId: 'ai-concept',
      type: RelationType.IS_A,
      label: 'ML is a subset of AI',
    },
    {
      sourceId: 'dl-concept',
      targetId: 'ml-concept',
      type: RelationType.IS_A,
      label: 'DL is a subset of ML',
    },
    {
      sourceId: 'nlp-concept',
      targetId: 'ai-concept',
      type: RelationType.PART_OF,
      label: 'NLP is part of AI',
    },
    {
      sourceId: 'nlp-concept',
      targetId: 'ml-concept',
      type: RelationType.USES,
      label: 'NLP uses ML techniques',
    },
  ];

  logger.info('\nAdding relationships...');
  for (let i = 0; i < relationships.length; i++) {
    const rel = relationships[i];
    const edge: KnowledgeEdge = {
      id: `edge-${i + 1}`,
      sourceId: rel.sourceId,
      targetId: rel.targetId,
      type: rel.type,
      weight: 0.9,
      properties: { label: rel.label },
      metadata: {
        createdAt: Date.now(),
        source: 'manual',
        confidence: 0.9,
      },
      bidirectional: false,
    };
    engine.addEdge(edge);
    logger.info(`  ✓ Added: ${rel.label}`);
  }

  // Add entity nodes (researchers, tools, etc.)
  const entities = [
    {
      id: 'transformer-entity',
      type: NodeType.ENTITY,
      label: 'Transformer Architecture',
      properties: {
        type: 'Neural Network Architecture',
        year: 2017,
        impact: 'Revolutionary',
      },
      tags: ['architecture', 'transformer', 'attention'],
    },
    {
      id: 'bert-entity',
      type: NodeType.ENTITY,
      label: 'BERT',
      properties: {
        type: 'Language Model',
        year: 2018,
        developer: 'Google',
      },
      tags: ['model', 'nlp', 'transformer'],
    },
  ];

  logger.info('\nAdding entity nodes...');
  for (const entity of entities) {
    const node: KnowledgeNode = {
      ...entity,
      embedding: undefined,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        source: 'manual',
        confidence: 0.9,
        accessCount: 0,
        lastAccessed: Date.now(),
      },
    };
    engine.addNode(node);
    logger.info(`  ✓ Added: ${entity.label}`);
  }

  // Add relationships to entities
  engine.addEdge({
    id: 'edge-transformer-dl',
    sourceId: 'transformer-entity',
    targetId: 'dl-concept',
    type: RelationType.IMPLEMENTS,
    weight: 0.95,
    properties: {},
    metadata: {
      createdAt: Date.now(),
      source: 'manual',
      confidence: 0.95,
    },
    bidirectional: false,
  });

  engine.addEdge({
    id: 'edge-bert-transformer',
    sourceId: 'bert-entity',
    targetId: 'transformer-entity',
    type: RelationType.USES,
    weight: 0.9,
    properties: {},
    metadata: {
      createdAt: Date.now(),
      source: 'manual',
      confidence: 0.9,
    },
    bidirectional: false,
  });

  engine.addEdge({
    id: 'edge-bert-nlp',
    sourceId: 'bert-entity',
    targetId: 'nlp-concept',
    type: RelationType.IMPLEMENTS,
    weight: 0.95,
    properties: {},
    metadata: {
      createdAt: Date.now(),
      source: 'manual',
      confidence: 0.95,
    },
    bidirectional: false,
  });

  const stats = engine.getStatistics();
  logger.info('\n' + '='.repeat(60));
  logger.info('Graph Statistics:');
  logger.info(`  Total Nodes: ${stats.nodes.total}`);
  logger.info(`  Total Edges: ${stats.edges.total}`);
  logger.info(`  Average Degree: ${stats.graph.avgDegree.toFixed(2)}`);
  logger.info(`  Density: ${stats.graph.density.toFixed(3)}`);
  logger.info('='.repeat(60));

  return engine;
}

/**
 * Example 2: Querying the Graph
 */
async function example2_GraphQuerying(engine: KnowledgeGraphEngine) {
  logger.info('\nExample 2: Querying the Graph');

  // Query 1: Find all concept nodes
  logger.info('\n--- Query 1: All Concepts ---');
  const query1: GraphQuery = {
    nodeTypes: [NodeType.CONCEPT],
  };

  const result1 = await engine.query(query1);
  logger.info(`Found ${result1.nodes.length} concept nodes:`);
  result1.nodes.forEach(node => {
    logger.info(`  - ${node.label} (${node.properties.domain})`);
  });

  // Query 2: Find nodes with high complexity
  logger.info('\n--- Query 2: High Complexity Concepts ---');
  const query2: GraphQuery = {
    nodeTypes: [NodeType.CONCEPT],
    filters: {
      nodeFilters: [
        {
          property: 'complexity',
          operator: 'gte',
          value: 0.8,
        },
      ],
    },
  };

  const result2 = await engine.query(query2);
  logger.info(`Found ${result2.nodes.length} high-complexity concepts:`);
  result2.nodes.forEach(node => {
    logger.info(`  - ${node.label}: complexity ${node.properties.complexity}`);
  });

  // Query 3: Traverse from AI concept
  logger.info('\n--- Query 3: Traverse from AI Concept ---');
  const query3: GraphQuery = {
    startNodes: ['ai-concept'],
    traversal: {
      maxDepth: 2,
      direction: 'incoming',
      pathType: 'all',
    },
  };

  const result3 = await engine.query(query3);
  logger.info(`Traversal found ${result3.nodes.length} nodes and ${result3.edges.length} edges`);
  logger.info('Nodes:');
  result3.nodes.forEach(node => {
    logger.info(`  - ${node.label}`);
  });

  if (result3.paths) {
    logger.info('\nPaths found:');
    result3.paths.forEach((path, idx) => {
      logger.info(`  Path ${idx + 1}: ${path.nodes.join(' → ')} (length: ${path.length})`);
    });
  }

  // Query 4: Find entities from 2018
  logger.info('\n--- Query 4: Entities from 2018 ---');
  const query4: GraphQuery = {
    nodeTypes: [NodeType.ENTITY],
    filters: {
      nodeFilters: [
        {
          property: 'year',
          operator: 'eq',
          value: 2018,
        },
      ],
    },
  };

  const result4 = await engine.query(query4);
  logger.info(`Found ${result4.nodes.length} entities from 2018:`);
  result4.nodes.forEach(node => {
    logger.info(`  - ${node.label} (${node.properties.type})`);
  });

  logger.info(`\nQuery Statistics:`);
  logger.info(`  Average Query Time: ${result1.statistics.queryTime}ms`);
}

/**
 * Example 3: Semantic Search
 */
async function example3_SemanticSearch(engine: KnowledgeGraphEngine) {
  logger.info('\nExample 3: Semantic Search');

  // Search 1: Find nodes related to "learning"
  logger.info('\n--- Search 1: "learning" ---');
  const search1: SemanticSearchQuery = {
    query: 'learning',
    topK: 5,
    minSimilarity: 0,
  };

  const result1 = await engine.semanticSearch(search1);
  logger.info(`Found ${result1.nodes.length} results:`);
  result1.nodes.forEach((item, idx) => {
    logger.info(`  ${idx + 1}. ${item.node.label}`);
    logger.info(`     Similarity: ${item.similarity.toFixed(3)}`);
    logger.info(`     Relevance: ${item.relevanceScore.toFixed(3)}`);
    logger.info(`     Matched: ${item.matchedProperties.join(', ')}`);
  });

  // Search 2: Find language-related concepts
  logger.info('\n--- Search 2: "language understanding" ---');
  const search2: SemanticSearchQuery = {
    query: 'language understanding',
    nodeTypes: [NodeType.CONCEPT],
    topK: 3,
    minSimilarity: 0,
    includeRelated: true,
    relatedDepth: 1,
  };

  const result2 = await engine.semanticSearch(search2);
  logger.info(`Found ${result2.nodes.length} results:`);
  result2.nodes.forEach((item, idx) => {
    logger.info(`  ${idx + 1}. ${item.node.label} (similarity: ${item.similarity.toFixed(3)})`);
  });

  if (result2.relatedNodes && result2.relatedNodes.length > 0) {
    logger.info('\nRelated nodes:');
    result2.relatedNodes.forEach(node => {
      logger.info(`  - ${node.label}`);
    });
  }

  if (result2.suggestions && result2.suggestions.length > 0) {
    logger.info('\nSuggestions:');
    result2.suggestions.forEach(suggestion => {
      logger.info(`  - ${suggestion}`);
    });
  }

  // Search 3: Find transformer-related entities
  logger.info('\n--- Search 3: "transformer neural network" ---');
  const search3: SemanticSearchQuery = {
    query: 'transformer neural network',
    nodeTypes: [NodeType.ENTITY],
    topK: 3,
  };

  const result3 = await engine.semanticSearch(search3);
  logger.info(`Found ${result3.nodes.length} results:`);
  result3.nodes.forEach((item, idx) => {
    logger.info(`  ${idx + 1}. ${item.node.label}`);
    logger.info(`     Type: ${item.node.properties.type}`);
    logger.info(`     Relevance: ${item.relevanceScore.toFixed(3)}`);
  });

  logger.info(`\nSearch Statistics:`);
  logger.info(`  Average Similarity: ${result1.statistics.avgSimilarity.toFixed(3)}`);
  logger.info(`  Search Time: ${result1.statistics.searchTime}ms`);
}

/**
 * Example 4: Knowledge Extraction
 */
async function example4_KnowledgeExtraction(engine: KnowledgeGraphEngine) {
  logger.info('\nExample 4: Knowledge Extraction from Text');

  const text = `
    Reinforcement Learning is a type of Machine Learning where an agent learns
    to make decisions by interacting with an environment. Deep Reinforcement Learning
    combines Deep Learning with Reinforcement Learning to handle complex state spaces.
    AlphaGo is a famous example that uses Deep Reinforcement Learning to play the game of Go.
    The AlphaGo system was developed by DeepMind and achieved superhuman performance.
  `;

  logger.info('\nExtracting knowledge from text...');
  logger.info(`Text length: ${text.length} characters`);

  const extraction = await engine.extractKnowledge(text, 'example-text');

  logger.info(`\nExtraction Results:`);
  logger.info(`  Nodes extracted: ${extraction.nodes.length}`);
  logger.info(`  Edges extracted: ${extraction.edges.length}`);
  logger.info(`  Confidence: ${extraction.confidence.toFixed(2)}`);

  logger.info('\nExtracted Concepts:');
  extraction.nodes.forEach((node, idx) => {
    logger.info(`  ${idx + 1}. ${node.label}`);
    logger.info(`     Type: ${node.type}`);
    logger.info(`     Tags: ${node.tags.join(', ')}`);
  });

  logger.info('\nExtracted Relationships:');
  extraction.edges.forEach((edge, idx) => {
    const source = extraction.nodes.find(n => n.id === edge.sourceId);
    const target = extraction.nodes.find(n => n.id === edge.targetId);
    if (source && target) {
      logger.info(`  ${idx + 1}. ${source.label} --[${edge.type}]--> ${target.label}`);
      logger.info(`     Weight: ${edge.weight.toFixed(2)}`);
    }
  });

  // Add extracted knowledge to graph
  logger.info('\nAdding extracted knowledge to graph...');
  let addedNodes = 0;
  for (const node of extraction.nodes) {
    try {
      engine.addNode(node);
      addedNodes++;
    } catch (error) {
      // Node might already exist
      logger.debug(`Node ${node.id} already exists`);
    }
  }

  let addedEdges = 0;
  for (const edge of extraction.edges) {
    try {
      engine.addEdge(edge);
      addedEdges++;
    } catch (error) {
      // Edge might reference non-existent nodes
      logger.debug(`Could not add edge ${edge.id}`);
    }
  }

  logger.info(`✓ Added ${addedNodes} nodes and ${addedEdges} edges to graph`);
}

/**
 * Example 5: Graph Analytics
 */
async function example5_GraphAnalytics(engine: KnowledgeGraphEngine) {
  logger.info('\nExample 5: Graph Analytics');

  const analytics = await engine.analyzeGraph();

  logger.info('\n--- Centrality Metrics ---');
  logger.info('Top 10 Most Central Nodes:');
  analytics.centrality.nodes.forEach((item, idx) => {
    logger.info(`  ${idx + 1}. Node: ${item.nodeId}`);
    logger.info(`     Degree: ${item.degree}`);
    logger.info(`     Betweenness: ${item.betweenness.toFixed(3)}`);
    logger.info(`     Closeness: ${item.closeness.toFixed(3)}`);
    logger.info(`     PageRank: ${item.pageRank.toFixed(3)}`);
  });

  if (analytics.communities.length > 0) {
    logger.info('\n--- Community Detection ---');
    logger.info(`Found ${analytics.communities.length} communities:`);
    analytics.communities.forEach((community, idx) => {
      logger.info(`  Community ${idx + 1}:`);
      logger.info(`    Size: ${community.size} nodes`);
      logger.info(`    Density: ${community.density.toFixed(3)}`);
      logger.info(`    Nodes: ${community.nodeIds.slice(0, 5).join(', ')}${community.nodeIds.length > 5 ? '...' : ''}`);
    });
  }

  if (analytics.patterns.length > 0) {
    logger.info('\n--- Pattern Detection ---');
    logger.info(`Found ${analytics.patterns.length} patterns:`);
    analytics.patterns.forEach((pattern, idx) => {
      logger.info(`  Pattern ${idx + 1}:`);
      logger.info(`    Type: ${pattern.type}`);
      logger.info(`    Nodes: ${pattern.nodeIds.length}`);
      logger.info(`    Significance: ${pattern.significance.toFixed(3)}`);
    });
  }
}

/**
 * Example 6: Graph Modifications
 */
async function example6_GraphModifications(engine: KnowledgeGraphEngine) {
  logger.info('\nExample 6: Graph Modifications');

  // Update node
  logger.info('\n--- Updating Node ---');
  logger.info('Updating AI concept with new properties...');
  engine.updateNode('ai-concept', {
    properties: {
      description: 'The simulation of human intelligence by machines - UPDATED',
      domain: 'Computer Science',
      complexity: 0.95,
      yearEstablished: 1956,
    },
  });
  logger.info('✓ Node updated');

  // Add new node and edges
  logger.info('\n--- Adding New Node ---');
  const newNode: KnowledgeNode = {
    id: 'gpt-entity',
    type: NodeType.ENTITY,
    label: 'GPT (Generative Pre-trained Transformer)',
    properties: {
      type: 'Language Model',
      year: 2018,
      developer: 'OpenAI',
      parameters: '175B',
    },
    embedding: undefined,
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      source: 'manual',
      confidence: 0.95,
      accessCount: 0,
      lastAccessed: Date.now(),
    },
    tags: ['gpt', 'transformer', 'llm', 'nlp'],
  };

  engine.addNode(newNode);
  logger.info('✓ Added GPT node');

  // Add edges to connect GPT
  engine.addEdge({
    id: 'edge-gpt-transformer',
    sourceId: 'gpt-entity',
    targetId: 'transformer-entity',
    type: RelationType.USES,
    weight: 0.95,
    properties: {},
    metadata: {
      createdAt: Date.now(),
      source: 'manual',
      confidence: 0.95,
    },
    bidirectional: false,
  });

  engine.addEdge({
    id: 'edge-gpt-nlp',
    sourceId: 'gpt-entity',
    targetId: 'nlp-concept',
    type: RelationType.IMPLEMENTS,
    weight: 0.9,
    properties: {},
    metadata: {
      createdAt: Date.now(),
      source: 'manual',
      confidence: 0.9,
    },
    bidirectional: false,
  });

  logger.info('✓ Added edges connecting GPT');

  const stats = engine.getStatistics();
  logger.info(`\nUpdated Graph Statistics:`);
  logger.info(`  Total Nodes: ${stats.nodes.total}`);
  logger.info(`  Total Edges: ${stats.edges.total}`);
}

/**
 * Example 7: Comprehensive Statistics
 */
async function example7_Statistics(engine: KnowledgeGraphEngine) {
  logger.info('\nExample 7: Comprehensive Statistics');

  const stats = engine.getStatistics();

  logger.info('\n' + '='.repeat(60));
  logger.info('Node Statistics:');
  logger.info(`  Total: ${stats.nodes.total}`);
  logger.info(`  With Embeddings: ${stats.nodes.withEmbeddings}`);
  logger.info(`  Avg Properties per Node: ${stats.nodes.avgPropertiesPerNode.toFixed(2)}`);

  logger.info('\n  By Type:');
  for (const [type, count] of stats.nodes.byType) {
    logger.info(`    ${type}: ${count}`);
  }

  logger.info('\n' + '-'.repeat(60));
  logger.info('Edge Statistics:');
  logger.info(`  Total: ${stats.edges.total}`);
  logger.info(`  Bidirectional: ${stats.edges.bidirectional}`);
  logger.info(`  Avg Weight: ${stats.edges.avgWeight.toFixed(2)}`);

  logger.info('\n  By Type:');
  for (const [type, count] of stats.edges.byType) {
    logger.info(`    ${type}: ${count}`);
  }

  logger.info('\n' + '-'.repeat(60));
  logger.info('Graph Structure:');
  logger.info(`  Average Degree: ${stats.graph.avgDegree.toFixed(2)}`);
  logger.info(`  Density: ${stats.graph.density.toFixed(4)}`);
  logger.info(`  Connected Components: ${stats.graph.connectedComponents}`);
  logger.info(`  Diameter: ${stats.graph.diameter}`);
  logger.info(`  Avg Path Length: ${stats.graph.avgPathLength.toFixed(2)}`);

  logger.info('\n' + '-'.repeat(60));
  logger.info('Usage Statistics:');
  logger.info(`  Total Queries: ${stats.usage.totalQueries}`);
  logger.info(`  Total Searches: ${stats.usage.totalSearches}`);
  logger.info(`  Avg Query Time: ${stats.usage.avgQueryTime.toFixed(2)}ms`);

  if (stats.usage.mostAccessedNodes.length > 0) {
    logger.info('\n  Most Accessed Nodes:');
    stats.usage.mostAccessedNodes.slice(0, 5).forEach((item, idx) => {
      logger.info(`    ${idx + 1}. ${item.nodeId}: ${item.accessCount} accesses`);
    });
  }

  logger.info('='.repeat(60));
}

/**
 * Run all examples
 */
export async function runKnowledgeGraphExample() {
  logger.info('='.repeat(80));
  logger.info('Info7 - Knowledge Graph Examples');
  logger.info('='.repeat(80));

  try {
    const engine = await example1_BuildingGraph();
    await example2_GraphQuerying(engine);
    await example3_SemanticSearch(engine);
    await example4_KnowledgeExtraction(engine);
    await example5_GraphAnalytics(engine);
    await example6_GraphModifications(engine);
    await example7_Statistics(engine);

    logger.info('\n' + '='.repeat(80));
    logger.info('All examples completed successfully!');
    logger.info('='.repeat(80));
  } catch (error) {
    logger.error('Error running examples:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  runKnowledgeGraphExample()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}
