# Info7 Platform - Quick Start Guide

**[🇷🇺 Русская версия](QUICK_START_GUIDE.ru.md)** | **[📖 Detailed Import/Export Guide](IMPORT_EXPORT_GUIDE.md)**

⏱️ **Reading time**: 5-10 minutes
📦 **Version**: 1.0.0
🎯 **Level**: Beginner to Intermediate

---

## 🚀 What is Info7 Platform?

Info7 is a **production-ready AI platform** with 4 integrated packages:

```
┌─────────────────────────────────────────┐
│         Info7 Platform                  │
├─────────────────────────────────────────┤
│ Leonardo AI       │  Info7 Knowledge    │
│ (Reasoning)       │  (Storage)          │
├─────────────────────────────────────────┤
│ Orchestrator Kit  │  OpenClaw          │
│ (Services)        │  (Hierarchy)        │
└─────────────────────────────────────────┘
```

**Key Capabilities**:
- 🤖 **11 Professional AI Agents** across 8 domains
- 🧠 **Self-Learning AI** with Meta-Learning & RL
- 📚 **Semantic Knowledge Graph** with auto-update
- ⚡ **Hierarchical Task Orchestration** (5 levels)

---

## ⚡ Installation (3 minutes)

### Prerequisites
- Node.js 18+ or Python 3.10+
- npm/yarn or pip
- Git

### Quick Install

```bash
# Clone repository
git clone https://github.com/svend4/info7.git
cd info7

# Install dependencies
npm install
# or
pip install -r requirements.txt

# Build all packages
npm run build
# or
python setup.py build

# Verify installation
npm test
```

---

## 🎯 Core Concepts (5 minutes)

### 1. Agents
**Professional AI agents** for specific domains:

```typescript
import { MedicalDiagnosisAssistant } from '@info7/orchestrator-kit-enterprise';

const agent = new MedicalDiagnosisAssistant();
const result = await agent.assessSymptoms([...symptoms], context);
```

**Available Agents**:
- 🏥 **Healthcare**: Medical Diagnosis, Mental Health Counselor
- 💰 **Financial**: Investment Advisor, Budget Planner
- ⚖️ **Legal**: Contract Lawyer, Immigration Specialist
- 📚 **Education**: Career Counselor
- 🏠 **Domestic**: Home Manager
- 👴 **Care**: Elderly Care
- 🤝 **Social**: Benefits Calculator
- 💪 **Wellness**: Nutrition Advisor

### 2. Knowledge Graph
**Semantic storage** for interconnected knowledge:

```typescript
import { KnowledgeGraph } from '@info7/info7';

const kb = new KnowledgeGraph();

// Add knowledge
await kb.addNode({
  type: 'concept',
  label: 'Machine Learning',
  properties: { category: 'AI', difficulty: 'advanced' }
});

// Search semantically
const results = await kb.search('deep learning algorithms', {
  semantic: true,
  limit: 10
});
```

### 3. Meta-Learning
**AI that learns how to learn**:

```typescript
import { MetaLearning, RLEngine } from '@info7/leonardo-ai';

const rl = new RLEngine();
const metaLearning = new MetaLearning(rl);

// AI selects best strategy
const strategy = await metaLearning.selectStrategy(task);
// → Chooses: Standard RL, MAML, Few-Shot, Transfer, Exploration
```

### 4. Hierarchical Orchestration
**Multi-level task delegation**:

```typescript
import { MetaMetaAgent, TaskManager } from '@info7/openclaw-meta-agents';

const orchestrator = new MetaMetaAgent();

// Complex task auto-decomposes
const result = await orchestrator.executeTask({
  description: 'Deploy full-stack app',
  complexity: 'high'
});
// → Meta-Meta → Meta-Agents → Worker Agents
```

---

## 📖 Basic Usage (10 minutes)

### Example 1: Medical Diagnosis

```typescript
import { MedicalDiagnosisAssistant } from '@info7/orchestrator-kit-enterprise';

const doctor = new MedicalDiagnosisAssistant();

const assessment = await doctor.assessSymptoms([
  { name: 'fever', severity: 8, duration: '2 days' },
  { name: 'cough', severity: 6, duration: '3 days' }
], {
  age: 35,
  gender: 'female',
  medicalHistory: []
});

console.log(assessment.urgency);          // 'PROMPT'
console.log(assessment.possibleConditions); // [{ condition: 'flu', likelihood: 0.7 }]
console.log(assessment.recommendations);   // Medical recommendations
```

### Example 2: Financial Planning

```typescript
import { InvestmentAdvisorAgent, BudgetPlannerAgent } from '@info7/orchestrator-kit-enterprise';

const advisor = new InvestmentAdvisorAgent();

const portfolio = await advisor.generateRecommendation({
  age: 30,
  income: 80000,
  riskTolerance: 'moderate',
  investmentGoals: ['retirement', 'home-purchase'],
  timeHorizon: 30
});

console.log(portfolio.allocation);
// → { stocks: 60%, bonds: 25%, realEstate: 10%, ... }
```

### Example 3: Knowledge Management

```typescript
import { KnowledgeGraph, AutoUpdateSystem } from '@info7/info7';

const kb = new KnowledgeGraph();

// Add concepts
await kb.addNode({ type: 'concept', label: 'React' });
await kb.addNode({ type: 'concept', label: 'Next.js' });

// Create relationships
await kb.addEdge('Next.js', 'React', 'BUILT_ON');

// Auto-update from sources
const autoUpdate = new AutoUpdateSystem(kb);
await autoUpdate.addSource({
  type: 'github-repo',
  url: 'https://github.com/facebook/react',
  updateFrequency: 'daily'
});

// Semantic search
const results = await kb.search('server-side rendering');
```

### Example 4: AI Learning & Adaptation

```typescript
import { RLEngine, MetaLearning, ConsciousnessLayer } from '@info7/leonardo-ai';

const rl = new RLEngine({
  stateSize: 128,
  actionSize: 10,
  learningRate: 0.001
});

// Train on task
await rl.train({
  episodes: 1000,
  environment: customEnv
});

// Meta-learning for strategy selection
const metaLearning = new MetaLearning(rl);
const strategy = await metaLearning.selectStrategy(newTask);

// Get explanations
const consciousness = new ConsciousnessLayer(rl);
const explanation = await consciousness.explainDecision(action, {
  style: 'step-by-step',
  depth: 'intermediate'
});
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```bash
# Leonardo AI
OPENAI_API_KEY=your_key_here
PINECONE_API_KEY=your_key_here
PINECONE_ENVIRONMENT=us-west1-gcp

# Info7 Knowledge Graph
VECTOR_DB_URL=http://localhost:6333
GRAPH_DB_URL=neo4j://localhost:7687

# Orchestrator Kit
TENANT_DB_URL=postgresql://localhost:5432/info7
REDIS_URL=redis://localhost:6379

# OpenClaw
AGENT_POOL_SIZE=10
MAX_WORKERS=50
```

### Basic Config File

Create `info7.config.js`:

```javascript
module.exports = {
  leonardo: {
    rl: {
      learningRate: 0.001,
      gamma: 0.99,
      batchSize: 32
    },
    rag: {
      vectorDb: 'pinecone',
      embeddingModel: 'text-embedding-3-large',
      topK: 5
    }
  },
  info7: {
    graph: {
      maxNodes: 100000,
      cacheSize: 1000
    },
    autoUpdate: {
      enabled: true,
      interval: '24h'
    }
  },
  orchestrator: {
    multiTenancy: true,
    rbac: true,
    auditLogging: true
  },
  openclaw: {
    hierarchyLevels: 5,
    maxConcurrentTasks: 100
  }
};
```

---

## 📚 Common Operations

### Import Data

```typescript
// Import agents
import { importAgent } from '@info7/orchestrator-kit-enterprise';
await importAgent('./my-custom-agent.json');

// Import knowledge
import { KnowledgeGraph } from '@info7/info7';
const kb = new KnowledgeGraph();
await kb.importFromFile('./knowledge-base.json');

// Import RL models
import { RLEngine } from '@info7/leonardo-ai';
const rl = new RLEngine();
await rl.loadModel('./trained-model.h5');
```

### Export Data

```typescript
// Export agents
import { exportAgent } from '@info7/orchestrator-kit-enterprise';
await exportAgent('MedicalDiagnosisAssistant', './export/');

// Export knowledge
const exported = await kb.exportToFile('./knowledge-export.json');

// Export RL models
await rl.saveModel('./models/my-model.h5');
```

**📖 For detailed import/export options, see [IMPORT_EXPORT_GUIDE.md](IMPORT_EXPORT_GUIDE.md)**

---

## 🎨 Advanced Features

### Multi-Tenancy

```typescript
import { TenantManager, RBACManager } from '@info7/orchestrator-kit-enterprise';

const tenantManager = new TenantManager();
const rbac = new RBACManager();

// Create tenant
const tenant = await tenantManager.createTenant({
  name: 'Acme Corp',
  plan: 'enterprise',
  features: ['all-agents', 'audit-logging']
});

// Assign roles
await rbac.assignRole(userId, 'admin', tenant.id);
```

### Agent Collaboration

```typescript
import { MetaMetaAgent } from '@info7/openclaw-meta-agents';

const orchestrator = new MetaMetaAgent();

// Agents work together
const result = await orchestrator.executeTask({
  description: 'Create marketing campaign with budget analysis',
  requiresAgents: ['CareerCounselorAgent', 'BudgetPlannerAgent']
});
```

### Knowledge Graph Analytics

```typescript
const analytics = await kb.analyzeGraph();

console.log(analytics.centralNodes);    // Most connected nodes
console.log(analytics.communities);     // Detected communities
console.log(analytics.patterns);        // Discovered patterns
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Import Errors**
```bash
# Missing dependencies
npm install --save @info7/common @info7/leonardo-ai

# Python path issues
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

**2. Memory Issues**
```typescript
// Reduce batch size
const rl = new RLEngine({ batchSize: 16 }); // instead of 32

// Limit graph size
const kb = new KnowledgeGraph({ maxNodes: 50000 });
```

**3. API Rate Limits**
```typescript
// Add retry logic
const rag = new RAGEngine({
  vectorDb: 'pinecone',
  retryAttempts: 3,
  retryDelay: 1000 // ms
});
```

---

## 📖 Next Steps

1. **📘 Read Detailed Guide**: [IMPORT_EXPORT_GUIDE.md](IMPORT_EXPORT_GUIDE.md)
2. **🎓 Explore Examples**: `examples/` directory
3. **📚 API Documentation**: Each package has `docs/API.md`
4. **🏗️ Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
5. **💡 Best Practices**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🆘 Getting Help

- 📧 **Email**: [email protected]
- 💬 **Discussions**: [GitHub Discussions](https://github.com/svend4/info7/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/svend4/info7/issues)
- 📖 **Wiki**: [GitHub Wiki](https://github.com/svend4/info7/wiki)

---

## ⭐ Key Takeaways

✅ **Info7 = 4 Integrated Packages** (Leonardo AI, Info7 KB, Orchestrator Kit, OpenClaw)
✅ **11 Professional Agents** ready to use
✅ **Self-Learning AI** with Meta-Learning
✅ **Semantic Knowledge Management**
✅ **Production-Ready** with 31,000+ LOC

**Start building with Info7 today!** 🚀

---

**© 2026 Info7 Project | MIT License**
