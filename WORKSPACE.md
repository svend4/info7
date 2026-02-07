# info7 Monorepo Workspace

**Version:** 1.0.0 | **Status:** 🚀 Production Ready

> Unified workspace for all info7 packages with common utilities integration

---

## 📦 Workspace Structure

```
info7/
├── packages/
│   ├── common/                      # @info7/common - Shared utilities
│   ├── leonardo-ai/                 # @info7/leonardo-ai - RL + RAG
│   ├── openclaw-meta-agents/        # @info7/openclaw-meta-agents
│   └── orchestrator-kit-enterprise/ # @info7/orchestrator-kit-enterprise
├── package.json                     # Root workspace configuration
├── pnpm-workspace.yaml             # pnpm workspace config
└── tsconfig.json                   # Root TypeScript config
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 or pnpm >= 8.0.0

### Installation

```bash
# Using npm (workspaces)
npm install

# Using pnpm (recommended)
pnpm install

# Using yarn (workspaces)
yarn install
```

This will install all dependencies for all packages in the workspace.

---

## 📦 Packages

### @info7/common (v1.0.0)

**Shared utilities for all packages**

- Configuration management with environment variables
- Advanced logging with winston
- Standardized error handling
- Zod-based validation
- Health check system
- Performance metrics collection

**Dependencies:** `zod`, `winston`, `dotenv`

### @info7/leonardo-ai (v2.0.0)

**Self-learning AI with RL and RAG**

- Reinforcement Learning engine (Policy Gradient + TD Learning)
- RAG engine with vector database (Pinecone)
- OpenAI embeddings integration
- Experience replay and exploration strategies

**Dependencies:** `@info7/common`, `@tensorflow/tfjs`, `@pinecone-database/pinecone`, `openai`, `zod`

### @info7/openclaw-meta-agents (v1.0.0)

**Hierarchical multi-agent orchestration**

- 3-level hierarchical coordination
- Task decomposition with smart routing
- Specialized agents (legal, medical, financial)
- 4 routing strategies (round-robin, least-loaded, capability-based, priority-based)

**Dependencies:** `@info7/common`, `zod`, `uuid`

### @info7/orchestrator-kit-enterprise (v1.0.0)

**Enterprise SaaS features**

- Multi-tenancy with data isolation
- RBAC with 15+ permissions
- SSO integration (SAML, OAuth, OIDC)
- Audit logging (GDPR, HIPAA, SOC 2 compliant)
- Usage tracking and billing

**Dependencies:** `@info7/common`, `jsonwebtoken`, `passport`, `bcrypt`, `uuid`, `zod`

---

## 🛠️ Build Commands

### Build All Packages

```bash
npm run build
```

Builds all packages in dependency order (common → others).

### Build Individual Packages

```bash
npm run build:common      # Build common utilities
npm run build:leonardo    # Build Leonardo AI
npm run build:openclaw    # Build OpenClaw Meta-Agents
npm run build:enterprise  # Build Enterprise features
```

---

## 🧪 Testing

### Test All Packages

```bash
npm test
```

### Test Individual Packages

```bash
npm run test:common
npm run test:leonardo
npm run test:openclaw
npm run test:enterprise
```

---

## 📝 Examples

### Run Package Examples

Each package includes example scripts demonstrating core functionality:

```bash
# Common utilities example
npm run example:common

# Leonardo AI RL + RAG example
npm run example:leonardo

# OpenClaw Meta-Agents example
npm run example:openclaw

# Orchestrator Kit Enterprise example
npm run example:enterprise
```

### Run Integration Examples

Integration examples demonstrate using common utilities within each package:

```bash
# Leonardo AI integration
npm run integration:leonardo

# OpenClaw Meta-Agents integration
npm run integration:openclaw

# Orchestrator Kit Enterprise integration
npm run integration:enterprise

# Run all integration examples
npm run integration:all
```

---

## 🔧 Development

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Clean Build Artifacts

```bash
npm run clean
```

This removes all `dist/` and `node_modules/` directories.

---

## 📚 Package Dependencies

The workspace uses internal package references via `workspace:*` protocol:

```json
{
  "dependencies": {
    "@info7/common": "workspace:*"
  }
}
```

This ensures:
- All packages use the same version of common utilities
- Changes to common utilities immediately available to other packages
- No need to publish/install during development

---

## 🏗️ TypeScript Configuration

Each package has its own `tsconfig.json` that extends a root configuration:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

Common TypeScript settings:
- **Target:** ES2020
- **Module:** CommonJS
- **Strict mode:** Enabled
- **Decorators:** Enabled
- **Source maps:** Enabled

---

## 🔗 Cross-Package Usage

### Using Common Utilities

All packages can import from `@info7/common`:

```typescript
import {
  Logger,
  MetricsCollector,
  AppError,
  ValidationError,
  ConfigManager,
  HealthCheckManager,
  Validator,
} from '@info7/common';
```

### Example: Leonardo AI using Common Utilities

```typescript
import { Logger, MetricsCollector } from '@info7/common';
import { LeonardoRLEngine } from '@info7/leonardo-ai';

const logger = new Logger({ context: { service: 'my-app' } });
const metrics = new MetricsCollector();

const engine = new LeonardoRLEngine({...});

// Log with structured context
logger.info('RL engine initialized');

// Track metrics
const counter = metrics.counter('rl.actions.total');
counter.inc();
```

---

## 📊 Workspace Statistics

```
Total Packages: 4
Total Files: ~100
Total Lines of Code: ~15,000+
Languages: TypeScript (100%)

Package Breakdown:
- @info7/common: ~3,500 LOC
- @info7/leonardo-ai: ~5,000 LOC
- @info7/openclaw-meta-agents: ~3,000 LOC
- @info7/orchestrator-kit-enterprise: ~3,000 LOC
```

---

## 🚀 Production Deployment

### Build for Production

```bash
# Build all packages
npm run build

# Packages are output to packages/*/dist/
```

### Environment Variables

Each package can be configured via environment variables. See individual package READMEs for details.

**Common Variables:**
- `NODE_ENV`: development | staging | production | test
- `LOG_LEVEL`: error | warn | info | debug
- `PORT`: Server port (default: 3000)

---

## 📖 Documentation

- [Common Utilities](packages/common/README.md) - Shared utilities documentation
- [Leonardo AI](packages/leonardo-ai/README.md) - RL + RAG documentation
- [OpenClaw Meta-Agents](packages/openclaw-meta-agents/README.md) - Multi-agent system
- [Orchestrator Kit Enterprise](packages/orchestrator-kit-enterprise/README.md) - Enterprise features

---

## 🤝 Contributing

1. **Install dependencies**: `npm install`
2. **Create feature branch**: `git checkout -b feature/my-feature`
3. **Make changes** in relevant package(s)
4. **Build**: `npm run build`
5. **Test**: `npm test`
6. **Lint**: `npm run lint`
7. **Commit**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
8. **Push**: `git push origin feature/my-feature`
9. **Create PR**: Submit pull request for review

---

## 🔄 Dependency Graph

```
@info7/common (base)
    ↓
    ├── @info7/leonardo-ai (depends on common)
    ├── @info7/openclaw-meta-agents (depends on common)
    └── @info7/orchestrator-kit-enterprise (depends on common)
```

All packages depend on `@info7/common`, ensuring consistent:
- Configuration management
- Logging and observability
- Error handling
- Validation
- Health checks
- Performance metrics

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🙏 Credits

Built with ❤️ by the info7 team

---

**Last Updated:** 2026-02-07
**Workspace Version:** 1.0.0

https://claude.ai/code/session_01WnQdgU1MrECnhh3xfVNRAg
