# Import/Export Guide

**Comprehensive Guide to Data Management in Info7 Platform**

This guide provides detailed technical documentation for importing and exporting all data types in the Info7 platform, including agents, skills, documentation, models, experts, and more.

---

## Table of Contents

1. [Agents Import/Export](#1-agents-importexport)
2. [Skills & Capabilities](#2-skills--capabilities)
3. [Documentation](#3-documentation)
4. [Models](#4-models)
5. [Experts & MoE](#5-experts--moe)
6. [Batch Operations](#6-batch-operations)
7. [API Reference](#7-api-reference)

---

## 1. Agents Import/Export

### 1.1 Overview

Agents are the core components of the Info7 platform. This section covers all methods for importing and exporting agents, including configurations, state, and metadata.

### 1.2 Supported Formats

#### 1.2.1 JSON Format

**Export Agent to JSON:**

```bash
# Export single agent
info7 agent export --id medical-diagnosis --format json --output ./exports/agents/

# Export with full configuration
info7 agent export --id medical-diagnosis --format json --include-config --include-state --output ./exports/agents/medical-diagnosis.json
```

**JSON Schema:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "type", "version", "config"],
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique agent identifier"
    },
    "type": {
      "type": "string",
      "enum": ["professional", "orchestrator", "worker", "meta"],
      "description": "Agent type"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Semantic version"
    },
    "config": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "description": { "type": "string" },
        "capabilities": {
          "type": "array",
          "items": { "type": "string" }
        },
        "parameters": {
          "type": "object",
          "properties": {
            "temperature": { "type": "number", "minimum": 0, "maximum": 2 },
            "maxTokens": { "type": "integer", "minimum": 1 },
            "topP": { "type": "number", "minimum": 0, "maximum": 1 }
          }
        },
        "knowledgeBase": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean" },
            "sources": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        }
      }
    },
    "state": {
      "type": "object",
      "description": "Current agent state (optional)"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "createdAt": { "type": "string", "format": "date-time" },
        "updatedAt": { "type": "string", "format": "date-time" },
        "author": { "type": "string" },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  }
}
```

**Example JSON Export:**

```json
{
  "id": "medical-diagnosis-assistant",
  "type": "professional",
  "version": "1.0.0",
  "config": {
    "name": "Medical Diagnosis Assistant",
    "description": "AI agent specialized in medical symptom analysis and diagnosis suggestions",
    "capabilities": [
      "symptom-analysis",
      "diagnosis-suggestion",
      "lab-interpretation",
      "treatment-planning"
    ],
    "parameters": {
      "temperature": 0.3,
      "maxTokens": 4096,
      "topP": 0.95
    },
    "knowledgeBase": {
      "enabled": true,
      "sources": [
        "medical-textbooks",
        "clinical-guidelines",
        "research-papers"
      ]
    }
  },
  "metadata": {
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-02-01T14:22:00Z",
    "author": "Info7 Team",
    "tags": ["healthcare", "diagnosis", "medical"]
  }
}
```

**Import Agent from JSON:**

```bash
# Import single agent
info7 agent import --file ./exports/agents/medical-diagnosis.json

# Import with validation
info7 agent import --file ./exports/agents/medical-diagnosis.json --validate --strict

# Import and override existing
info7 agent import --file ./exports/agents/medical-diagnosis.json --override
```

#### 1.2.2 YAML Format

**Export Agent to YAML:**

```bash
# Export to YAML
info7 agent export --id investment-advisor --format yaml --output ./exports/agents/investment-advisor.yaml
```

**Example YAML Export:**

```yaml
id: investment-advisor
type: professional
version: 1.0.0
config:
  name: Investment Advisor
  description: AI agent for investment strategy and portfolio management
  capabilities:
    - portfolio-analysis
    - risk-assessment
    - market-research
    - investment-recommendations
  parameters:
    temperature: 0.4
    maxTokens: 4096
    topP: 0.9
  knowledgeBase:
    enabled: true
    sources:
      - financial-data
      - market-analysis
      - investment-strategies
metadata:
  createdAt: '2025-01-20T08:15:00Z'
  updatedAt: '2025-02-05T11:45:00Z'
  author: Info7 Team
  tags:
    - financial
    - investment
    - portfolio
```

**Import Agent from YAML:**

```bash
# Import from YAML
info7 agent import --file ./exports/agents/investment-advisor.yaml
```

#### 1.2.3 Binary Format (Optimized)

**Export Agent to Binary:**

```bash
# Export to binary format (smaller size, faster loading)
info7 agent export --id career-counselor --format binary --output ./exports/agents/career-counselor.bin

# Export with compression
info7 agent export --id career-counselor --format binary --compress gzip --output ./exports/agents/career-counselor.bin.gz
```

**Import Agent from Binary:**

```bash
# Import from binary
info7 agent import --file ./exports/agents/career-counselor.bin

# Import compressed binary
info7 agent import --file ./exports/agents/career-counselor.bin.gz --decompress gzip
```

### 1.3 Custom Agent Creation

#### 1.3.1 Creating Custom Agent from Template

**Step 1: Generate Template**

```bash
# Generate agent template
info7 agent template create --type professional --name custom-legal-advisor --output ./custom-agents/

# This creates:
# ./custom-agents/custom-legal-advisor/
#   ├── config.yaml
#   ├── capabilities.json
#   ├── knowledge-base/
#   └── tests/
```

**Step 2: Configure Agent**

Edit `config.yaml`:

```yaml
id: custom-legal-advisor
type: professional
version: 1.0.0
config:
  name: Custom Legal Advisor
  description: Specialized legal consultation agent
  capabilities:
    - contract-review
    - legal-research
    - compliance-checking
  parameters:
    temperature: 0.2
    maxTokens: 8192
    topP: 0.95
  knowledgeBase:
    enabled: true
    sources:
      - legal-documents
      - case-law
      - regulations
  customPrompts:
    system: |
      You are a specialized legal advisor with expertise in contract law,
      compliance, and regulatory matters. Always provide accurate legal
      information and cite relevant laws and precedents.
    instruction: |
      Analyze the provided legal document or question thoroughly.
      Identify key legal issues, potential risks, and provide actionable advice.
```

**Step 3: Add Knowledge Base**

```bash
# Add documents to knowledge base
info7 agent knowledge add --agent-id custom-legal-advisor --source ./legal-docs/ --type documents

# Add vector embeddings
info7 agent knowledge add --agent-id custom-legal-advisor --source ./embeddings/ --type vectors
```

**Step 4: Validate and Import**

```bash
# Validate configuration
info7 agent validate --path ./custom-agents/custom-legal-advisor/

# Import custom agent
info7 agent import --path ./custom-agents/custom-legal-advisor/ --build
```

#### 1.3.2 Creating Agent from Code

**TypeScript Example:**

```typescript
// custom-agents/sentiment-analyzer/index.ts
import { BaseAgent, AgentConfig, AgentCapability } from '@info7/orchestrator-kit';
import { Logger } from '@info7/common';

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  score: number;
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
}

export class SentimentAnalyzerAgent extends BaseAgent {
  private readonly logger: Logger;

  constructor(config: AgentConfig) {
    super(config);
    this.logger = new Logger('SentimentAnalyzerAgent');
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    this.logger.info('Analyzing sentiment', { textLength: text.length });

    // Implementation using NLP models
    const sentiment = await this.performSentimentAnalysis(text);
    const emotions = await this.detectEmotions(text);

    return {
      sentiment: sentiment.label,
      score: sentiment.score,
      confidence: sentiment.confidence,
      emotions
    };
  }

  private async performSentimentAnalysis(text: string) {
    // Use pre-trained model or API
    return {
      label: 'positive' as const,
      score: 0.85,
      confidence: 0.92
    };
  }

  private async detectEmotions(text: string) {
    return {
      joy: 0.7,
      sadness: 0.1,
      anger: 0.05,
      fear: 0.05,
      surprise: 0.1
    };
  }

  getCapabilities(): AgentCapability[] {
    return [
      {
        id: 'sentiment-analysis',
        name: 'Sentiment Analysis',
        description: 'Analyze sentiment in text'
      },
      {
        id: 'emotion-detection',
        name: 'Emotion Detection',
        description: 'Detect emotions in text'
      }
    ];
  }
}
```

**Build and Export:**

```bash
# Build custom agent
cd custom-agents/sentiment-analyzer
npm run build

# Package for distribution
info7 agent package --path ./dist --output sentiment-analyzer-v1.0.0.zip

# Import to platform
info7 agent import --file sentiment-analyzer-v1.0.0.zip --install-deps
```

### 1.4 Agent Configuration Management

#### 1.4.1 Exporting Configurations

```bash
# Export agent configuration only (no state)
info7 agent config export --id medical-diagnosis --output ./configs/

# Export all agent configurations
info7 agent config export --all --output ./configs/

# Export with environment-specific overrides
info7 agent config export --id investment-advisor --env production --output ./configs/prod/
```

**Configuration File Structure:**

```json
{
  "agent": "medical-diagnosis-assistant",
  "version": "1.0.0",
  "environment": "production",
  "config": {
    "parameters": {
      "temperature": 0.3,
      "maxTokens": 4096,
      "topP": 0.95,
      "frequencyPenalty": 0.0,
      "presencePenalty": 0.0
    },
    "rateLimit": {
      "requestsPerMinute": 60,
      "tokensPerMinute": 100000
    },
    "timeout": {
      "query": 30000,
      "stream": 60000
    },
    "retry": {
      "maxAttempts": 3,
      "backoff": "exponential",
      "initialDelay": 1000
    },
    "cache": {
      "enabled": true,
      "ttl": 3600,
      "maxSize": 1000
    },
    "monitoring": {
      "metrics": true,
      "tracing": true,
      "logging": {
        "level": "info",
        "format": "json"
      }
    }
  }
}
```

#### 1.4.2 Importing Configurations

```bash
# Import single configuration
info7 agent config import --file ./configs/medical-diagnosis-config.json

# Import all configurations from directory
info7 agent config import --dir ./configs/ --recursive

# Import with merge strategy
info7 agent config import --file ./configs/investment-advisor-config.json --merge-strategy deep
```

### 1.5 Agent Versioning

#### 1.5.1 Version Management

```bash
# List agent versions
info7 agent version list --id medical-diagnosis

# Export specific version
info7 agent export --id medical-diagnosis --version 1.0.0 --output ./exports/

# Export all versions
info7 agent export --id medical-diagnosis --all-versions --output ./exports/versions/

# Compare versions
info7 agent version diff --id medical-diagnosis --from 1.0.0 --to 1.1.0
```

**Version Metadata:**

```json
{
  "agent": "medical-diagnosis-assistant",
  "versions": [
    {
      "version": "1.0.0",
      "releaseDate": "2025-01-15T10:30:00Z",
      "changes": [
        "Initial release",
        "Basic symptom analysis",
        "Diagnosis suggestions"
      ],
      "breaking": false,
      "deprecated": false
    },
    {
      "version": "1.1.0",
      "releaseDate": "2025-02-01T14:22:00Z",
      "changes": [
        "Added lab result interpretation",
        "Improved diagnosis accuracy",
        "Enhanced knowledge base"
      ],
      "breaking": false,
      "deprecated": false
    },
    {
      "version": "2.0.0",
      "releaseDate": "2025-02-15T09:00:00Z",
      "changes": [
        "Major refactoring",
        "New API interface",
        "Multi-language support"
      ],
      "breaking": true,
      "deprecated": false,
      "migration": {
        "guide": "./docs/migration/v1-to-v2.md",
        "automated": true
      }
    }
  ]
}
```

#### 1.5.2 Version Migration

```bash
# Migrate agent to new version
info7 agent migrate --id medical-diagnosis --from 1.1.0 --to 2.0.0 --dry-run

# Perform migration
info7 agent migrate --id medical-diagnosis --from 1.1.0 --to 2.0.0 --backup

# Rollback migration
info7 agent migrate rollback --id medical-diagnosis --to-version 1.1.0
```

---

## 2. Skills & Capabilities

### 2.1 Overview

Skills and capabilities define what agents can do. This section covers management, import/export, composition, and dependency handling.

### 2.2 Skills Library

#### 2.2.1 Exporting Skills

```bash
# Export single skill
info7 skill export --id symptom-analysis --output ./exports/skills/

# Export skill with dependencies
info7 skill export --id diagnosis-suggestion --with-deps --output ./exports/skills/

# Export entire skill category
info7 skill export --category healthcare --output ./exports/skills/healthcare/
```

**Skill Definition Format:**

```json
{
  "id": "symptom-analysis",
  "version": "1.0.0",
  "category": "healthcare",
  "metadata": {
    "name": "Symptom Analysis",
    "description": "Analyze patient symptoms and identify patterns",
    "author": "Info7 Medical Team",
    "license": "MIT"
  },
  "interface": {
    "input": {
      "type": "object",
      "properties": {
        "symptoms": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "severity": { "type": "number", "min": 1, "max": 10 },
              "duration": { "type": "string" },
              "onset": { "type": "string" }
            }
          }
        },
        "patientContext": {
          "type": "object",
          "properties": {
            "age": { "type": "number" },
            "gender": { "type": "string" },
            "medicalHistory": { "type": "array" }
          }
        }
      }
    },
    "output": {
      "type": "object",
      "properties": {
        "analysis": { "type": "string" },
        "possibleConditions": {
          "type": "array",
          "items": { "type": "string" }
        },
        "urgency": {
          "type": "string",
          "enum": ["low", "medium", "high", "critical"]
        },
        "recommendations": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  },
  "implementation": {
    "type": "function",
    "runtime": "node",
    "entry": "./handlers/symptom-analysis.js",
    "dependencies": {
      "medical-knowledge-base": "^2.0.0",
      "nlp-processor": "^1.5.0"
    }
  },
  "requirements": {
    "memory": "512MB",
    "timeout": 30000,
    "concurrency": 10
  },
  "configuration": {
    "confidenceThreshold": 0.7,
    "maxConditions": 5,
    "includeRareDiseases": false
  }
}
```

#### 2.2.2 Importing Skills

```bash
# Import single skill
info7 skill import --file ./exports/skills/symptom-analysis.json

# Import with automatic dependency resolution
info7 skill import --file ./exports/skills/diagnosis-suggestion.json --resolve-deps

# Import from skill package
info7 skill import --package ./skills/healthcare-skills-v1.0.0.tar.gz
```

#### 2.2.3 Creating Custom Skills

**Step 1: Generate Skill Template**

```bash
# Create skill scaffold
info7 skill create --name custom-risk-assessment --category financial --template typescript

# This creates:
# ./skills/custom-risk-assessment/
#   ├── skill.json
#   ├── src/
#   │   ├── index.ts
#   │   ├── types.ts
#   │   └── handlers/
#   ├── tests/
#   ├── package.json
#   └── README.md
```

**Step 2: Implement Skill**

```typescript
// skills/custom-risk-assessment/src/index.ts
import { Skill, SkillContext, SkillResult } from '@info7/skills-sdk';

export interface RiskAssessmentInput {
  portfolio: {
    assets: Array<{
      symbol: string;
      quantity: number;
      currentPrice: number;
      costBasis: number;
    }>;
  };
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: number; // years
}

export interface RiskAssessmentOutput {
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number; // 0-100
  metrics: {
    beta: number;
    sharpeRatio: number;
    volatility: number;
    valueAtRisk: number;
  };
  recommendations: string[];
  warnings: string[];
}

export class CustomRiskAssessment extends Skill<RiskAssessmentInput, RiskAssessmentOutput> {
  async execute(
    input: RiskAssessmentInput,
    context: SkillContext
  ): Promise<SkillResult<RiskAssessmentOutput>> {
    context.logger.info('Performing risk assessment', {
      assetCount: input.portfolio.assets.length
    });

    // Calculate portfolio metrics
    const metrics = await this.calculateMetrics(input.portfolio);

    // Assess risk level
    const riskScore = this.calculateRiskScore(metrics, input.riskTolerance);
    const overallRisk = this.categorizeRisk(riskScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      metrics,
      input.riskTolerance,
      input.timeHorizon
    );

    // Check for warnings
    const warnings = this.checkWarnings(metrics, input.riskTolerance);

    return {
      success: true,
      data: {
        overallRisk,
        riskScore,
        metrics,
        recommendations,
        warnings
      },
      metadata: {
        executionTime: context.metrics.duration,
        version: '1.0.0'
      }
    };
  }

  private async calculateMetrics(portfolio: any) {
    // Implementation
    return {
      beta: 1.2,
      sharpeRatio: 0.85,
      volatility: 0.15,
      valueAtRisk: 0.05
    };
  }

  private calculateRiskScore(metrics: any, tolerance: string): number {
    // Implementation
    return 65;
  }

  private categorizeRisk(score: number): 'low' | 'medium' | 'high' {
    if (score < 33) return 'low';
    if (score < 67) return 'medium';
    return 'high';
  }

  private generateRecommendations(
    metrics: any,
    tolerance: string,
    timeHorizon: number
  ): string[] {
    // Implementation
    return [
      'Consider diversifying into bonds',
      'Rebalance portfolio quarterly',
      'Monitor beta exposure'
    ];
  }

  private checkWarnings(metrics: any, tolerance: string): string[] {
    const warnings: string[] = [];

    if (metrics.volatility > 0.2) {
      warnings.push('High portfolio volatility detected');
    }

    if (metrics.beta > 1.5) {
      warnings.push('Portfolio beta exceeds 1.5 - high market sensitivity');
    }

    return warnings;
  }
}
```

**Step 3: Build and Package**

```bash
# Build skill
cd skills/custom-risk-assessment
npm run build
npm test

# Package skill
info7 skill package --path ./dist --output custom-risk-assessment-v1.0.0.tar.gz

# Publish to registry (optional)
info7 skill publish --package custom-risk-assessment-v1.0.0.tar.gz --registry private
```

### 2.3 Capabilities Management

#### 2.3.1 Capability Definition

```json
{
  "id": "multi-language-support",
  "version": "1.0.0",
  "type": "capability",
  "metadata": {
    "name": "Multi-Language Support",
    "description": "Capability to process and respond in multiple languages",
    "category": "language"
  },
  "requirements": {
    "skills": [
      "language-detection",
      "translation",
      "localization"
    ],
    "models": [
      "multilingual-embeddings",
      "translation-model"
    ],
    "minMemory": "1GB"
  },
  "features": {
    "supportedLanguages": [
      "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"
    ],
    "autoDetect": true,
    "contextualTranslation": true,
    "culturalAdaptation": true
  },
  "configuration": {
    "defaultLanguage": "en",
    "fallbackLanguage": "en",
    "qualityThreshold": 0.85
  }
}
```

#### 2.3.2 Exporting Capabilities

```bash
# Export single capability
info7 capability export --id multi-language-support --output ./exports/capabilities/

# Export all capabilities for agent
info7 capability export --agent-id medical-diagnosis --output ./exports/capabilities/medical/

# Export capability with implementation
info7 capability export --id multi-language-support --with-implementation --output ./exports/
```

#### 2.3.3 Importing Capabilities

```bash
# Import capability
info7 capability import --file ./exports/capabilities/multi-language-support.json

# Import and attach to agent
info7 capability import --file ./exports/capabilities/multi-language-support.json --attach-to medical-diagnosis

# Import capability bundle
info7 capability import --bundle ./capabilities/language-bundle-v1.0.0.zip
```

### 2.4 Skill Compositions

#### 2.4.1 Creating Skill Compositions

**Composition Definition:**

```json
{
  "id": "complete-medical-assessment",
  "version": "1.0.0",
  "type": "composition",
  "metadata": {
    "name": "Complete Medical Assessment",
    "description": "Comprehensive medical assessment workflow"
  },
  "skills": [
    {
      "id": "symptom-analysis",
      "version": "^1.0.0",
      "stage": 1,
      "required": true
    },
    {
      "id": "lab-interpretation",
      "version": "^2.0.0",
      "stage": 2,
      "required": false,
      "condition": "hasLabResults"
    },
    {
      "id": "diagnosis-suggestion",
      "version": "^1.0.0",
      "stage": 3,
      "required": true,
      "inputs": {
        "symptoms": "${stage1.output.symptoms}",
        "labResults": "${stage2.output.interpretation}"
      }
    },
    {
      "id": "treatment-planning",
      "version": "^1.0.0",
      "stage": 4,
      "required": true,
      "inputs": {
        "diagnosis": "${stage3.output.primaryDiagnosis}",
        "patientProfile": "${input.patientContext}"
      }
    }
  ],
  "flow": {
    "type": "sequential",
    "errorHandling": "skip-optional",
    "timeout": 120000,
    "retryPolicy": {
      "maxAttempts": 2,
      "backoff": "linear"
    }
  },
  "output": {
    "transform": {
      "assessment": "${stage1.output}",
      "diagnosis": "${stage3.output}",
      "treatment": "${stage4.output}",
      "confidence": "${average(stage3.output.confidence, stage4.output.confidence)}"
    }
  }
}
```

**Export Composition:**

```bash
# Export composition
info7 composition export --id complete-medical-assessment --output ./exports/compositions/

# Export with all dependent skills
info7 composition export --id complete-medical-assessment --with-skills --output ./exports/
```

**Import Composition:**

```bash
# Import composition
info7 composition import --file ./exports/compositions/complete-medical-assessment.json

# Import and resolve dependencies
info7 composition import --file ./exports/compositions/complete-medical-assessment.json --resolve-deps --install
```

#### 2.4.2 Parallel Compositions

```json
{
  "id": "multi-source-research",
  "version": "1.0.0",
  "type": "composition",
  "metadata": {
    "name": "Multi-Source Research",
    "description": "Research from multiple sources in parallel"
  },
  "skills": [
    {
      "id": "academic-search",
      "version": "^1.0.0",
      "stage": 1,
      "parallel": true
    },
    {
      "id": "web-search",
      "version": "^1.0.0",
      "stage": 1,
      "parallel": true
    },
    {
      "id": "database-query",
      "version": "^1.0.0",
      "stage": 1,
      "parallel": true
    },
    {
      "id": "result-aggregation",
      "version": "^1.0.0",
      "stage": 2,
      "inputs": {
        "sources": [
          "${stage1.parallel1.output}",
          "${stage1.parallel2.output}",
          "${stage1.parallel3.output}"
        ]
      }
    }
  ],
  "flow": {
    "type": "parallel-then-sequential",
    "parallelTimeout": 30000,
    "waitForAll": false,
    "minSuccessful": 2
  }
}
```

### 2.5 Dependency Management

#### 2.5.1 Dependency Graph Export

```bash
# Export dependency graph for skill
info7 skill deps export --id diagnosis-suggestion --format graphml --output ./deps/

# Export as JSON
info7 skill deps export --id diagnosis-suggestion --format json --output ./deps/diagnosis-deps.json

# Visualize dependencies
info7 skill deps visualize --id diagnosis-suggestion --output ./deps/diagram.svg
```

**Dependency Graph Format:**

```json
{
  "root": "diagnosis-suggestion",
  "version": "1.0.0",
  "dependencies": {
    "direct": [
      {
        "id": "symptom-analysis",
        "version": "^1.0.0",
        "type": "required"
      },
      {
        "id": "medical-knowledge-base",
        "version": "^2.0.0",
        "type": "required"
      },
      {
        "id": "lab-interpretation",
        "version": "^2.0.0",
        "type": "optional"
      }
    ],
    "transitive": [
      {
        "id": "nlp-processor",
        "version": "^1.5.0",
        "requiredBy": "symptom-analysis"
      },
      {
        "id": "medical-terminology",
        "version": "^3.0.0",
        "requiredBy": "medical-knowledge-base"
      }
    ]
  },
  "conflicts": [],
  "suggestions": [
    {
      "type": "upgrade",
      "package": "medical-knowledge-base",
      "from": "2.0.0",
      "to": "2.1.0",
      "reason": "Security patch available"
    }
  ]
}
```

#### 2.5.2 Dependency Resolution

```bash
# Check for dependency conflicts
info7 skill deps check --id diagnosis-suggestion

# Resolve dependencies automatically
info7 skill deps resolve --id diagnosis-suggestion --strategy conservative

# Update dependencies
info7 skill deps update --id diagnosis-suggestion --dry-run

# Lock dependencies
info7 skill deps lock --id diagnosis-suggestion --output ./locks/diagnosis-suggestion.lock
```

---

## 3. Documentation

### 3.1 Overview

Documentation management for all platform components including markdown files, API docs, knowledge articles, and multi-language support.

### 3.2 Markdown Documentation

#### 3.2.1 Exporting Documentation

```bash
# Export all documentation
info7 docs export --output ./exports/docs/

# Export specific category
info7 docs export --category guides --output ./exports/docs/guides/

# Export with assets (images, diagrams)
info7 docs export --category guides --with-assets --output ./exports/docs/
```

**Documentation Metadata:**

```json
{
  "id": "medical-diagnosis-guide",
  "version": "1.0.0",
  "type": "guide",
  "metadata": {
    "title": "Medical Diagnosis Assistant - User Guide",
    "author": "Info7 Medical Team",
    "created": "2025-01-15T10:30:00Z",
    "updated": "2025-02-05T14:20:00Z",
    "language": "en",
    "tags": ["medical", "diagnosis", "guide", "healthcare"]
  },
  "content": {
    "format": "markdown",
    "file": "medical-diagnosis-guide.md",
    "sections": [
      {
        "id": "introduction",
        "title": "Introduction",
        "level": 1
      },
      {
        "id": "getting-started",
        "title": "Getting Started",
        "level": 1
      },
      {
        "id": "features",
        "title": "Features",
        "level": 1,
        "subsections": [
          {
            "id": "symptom-analysis",
            "title": "Symptom Analysis",
            "level": 2
          },
          {
            "id": "diagnosis-suggestions",
            "title": "Diagnosis Suggestions",
            "level": 2
          }
        ]
      }
    ]
  },
  "assets": [
    {
      "type": "image",
      "path": "assets/screenshots/symptom-input.png",
      "alt": "Symptom input interface"
    },
    {
      "type": "diagram",
      "path": "assets/diagrams/diagnosis-flow.svg",
      "alt": "Diagnosis workflow"
    }
  ],
  "links": [
    {
      "type": "related",
      "target": "api-reference",
      "text": "API Reference"
    },
    {
      "type": "external",
      "url": "https://docs.info7.ai/medical",
      "text": "Online Documentation"
    }
  ]
}
```

#### 3.2.2 Importing Documentation

```bash
# Import documentation
info7 docs import --file ./exports/docs/medical-diagnosis-guide.md

# Import with metadata
info7 docs import --file ./exports/docs/medical-diagnosis-guide.md --metadata ./exports/docs/medical-diagnosis-guide.json

# Import directory with structure
info7 docs import --dir ./exports/docs/ --preserve-structure
```

#### 3.2.3 Documentation Templates

```bash
# Create documentation from template
info7 docs create --template user-guide --name custom-agent-guide --output ./docs/

# Available templates:
# - user-guide: End-user documentation
# - api-reference: API documentation
# - tutorial: Step-by-step tutorial
# - troubleshooting: Problem-solving guide
# - architecture: Technical architecture docs
```

### 3.3 API Documentation

#### 3.3.1 OpenAPI/Swagger Export

```bash
# Export OpenAPI specification
info7 api docs export --format openapi --version 3.0 --output ./exports/api/openapi.yaml

# Export with examples
info7 api docs export --format openapi --with-examples --output ./exports/api/

# Export specific endpoints
info7 api docs export --endpoints /agents/* --format openapi --output ./exports/api/agents-api.yaml
```

**OpenAPI Example:**

```yaml
openapi: 3.0.3
info:
  title: Info7 Agents API
  version: 1.0.0
  description: REST API for managing and interacting with Info7 agents
  contact:
    name: Info7 Support
    email: support@info7.ai
servers:
  - url: https://api.info7.ai/v1
    description: Production server
  - url: https://staging-api.info7.ai/v1
    description: Staging server
paths:
  /agents:
    get:
      summary: List all agents
      operationId: listAgents
      tags:
        - Agents
      parameters:
        - name: type
          in: query
          schema:
            type: string
            enum: [professional, orchestrator, worker, meta]
          description: Filter by agent type
        - name: category
          in: query
          schema:
            type: string
          description: Filter by category
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  agents:
                    type: array
                    items:
                      $ref: '#/components/schemas/Agent'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
              examples:
                default:
                  value:
                    agents:
                      - id: medical-diagnosis
                        type: professional
                        name: Medical Diagnosis Assistant
                        category: healthcare
                        version: 1.0.0
                    pagination:
                      total: 11
                      limit: 20
                      offset: 0
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalError'
    post:
      summary: Create new agent
      operationId: createAgent
      tags:
        - Agents
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AgentCreate'
      responses:
        '201':
          description: Agent created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Agent'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /agents/{agentId}:
    get:
      summary: Get agent details
      operationId: getAgent
      tags:
        - Agents
      parameters:
        - name: agentId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Agent'
        '404':
          $ref: '#/components/responses/NotFound'

  /agents/{agentId}/query:
    post:
      summary: Query agent
      operationId: queryAgent
      tags:
        - Agents
      parameters:
        - name: agentId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - query
              properties:
                query:
                  type: string
                  description: The query to send to the agent
                context:
                  type: object
                  description: Additional context for the query
                stream:
                  type: boolean
                  default: false
                  description: Whether to stream the response
            examples:
              symptom-analysis:
                value:
                  query: "Patient presents with fever, cough, and fatigue for 3 days"
                  context:
                    patientAge: 45
                    medicalHistory: ["hypertension"]
      responses:
        '200':
          description: Query result
          content:
            application/json:
              schema:
                type: object
                properties:
                  response:
                    type: string
                  metadata:
                    type: object

components:
  schemas:
    Agent:
      type: object
      required:
        - id
        - type
        - name
        - version
      properties:
        id:
          type: string
        type:
          type: string
          enum: [professional, orchestrator, worker, meta]
        name:
          type: string
        description:
          type: string
        category:
          type: string
        version:
          type: string
        capabilities:
          type: array
          items:
            type: string
        config:
          type: object
        metadata:
          type: object

    Pagination:
      type: object
      properties:
        total:
          type: integer
        limit:
          type: integer
        offset:
          type: integer

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
              message:
                type: string

    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: "Unauthorized"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: "Not found"

    InternalError:
      description: Internal server error
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: "Internal server error"

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

#### 3.3.2 GraphQL Schema Export

```bash
# Export GraphQL schema
info7 api docs export --format graphql --output ./exports/api/schema.graphql

# Export with resolvers documentation
info7 api docs export --format graphql --with-resolvers --output ./exports/api/
```

**GraphQL Schema Example:**

```graphql
"""
Info7 Platform GraphQL API
"""

"""
An agent in the Info7 platform
"""
type Agent {
  """Unique agent identifier"""
  id: ID!

  """Agent type"""
  type: AgentType!

  """Display name"""
  name: String!

  """Description"""
  description: String

  """Category"""
  category: String

  """Semantic version"""
  version: String!

  """Agent capabilities"""
  capabilities: [String!]!

  """Configuration"""
  config: AgentConfig!

  """Metadata"""
  metadata: AgentMetadata!

  """Creation timestamp"""
  createdAt: DateTime!

  """Last update timestamp"""
  updatedAt: DateTime!
}

"""
Agent type enumeration
"""
enum AgentType {
  PROFESSIONAL
  ORCHESTRATOR
  WORKER
  META
}

"""
Agent configuration
"""
type AgentConfig {
  parameters: AgentParameters!
  knowledgeBase: KnowledgeBaseConfig
  rateLimit: RateLimitConfig
  monitoring: MonitoringConfig
}

"""
Agent parameters
"""
type AgentParameters {
  temperature: Float!
  maxTokens: Int!
  topP: Float!
  frequencyPenalty: Float
  presencePenalty: Float
}

"""
Query root
"""
type Query {
  """Get agent by ID"""
  agent(id: ID!): Agent

  """List agents"""
  agents(
    type: AgentType
    category: String
    limit: Int = 20
    offset: Int = 0
  ): AgentConnection!

  """Search agents"""
  searchAgents(
    query: String!
    filters: AgentFilters
    limit: Int = 20
  ): [Agent!]!
}

"""
Mutation root
"""
type Mutation {
  """Create new agent"""
  createAgent(input: CreateAgentInput!): Agent!

  """Update agent"""
  updateAgent(id: ID!, input: UpdateAgentInput!): Agent!

  """Delete agent"""
  deleteAgent(id: ID!): Boolean!

  """Query agent"""
  queryAgent(id: ID!, query: String!, context: JSON): AgentQueryResult!
}

"""
Subscription root
"""
type Subscription {
  """Subscribe to agent updates"""
  agentUpdated(id: ID!): Agent!

  """Subscribe to query results (streaming)"""
  streamQueryResult(id: ID!, query: String!): AgentQueryChunk!
}

"""
Agent connection for pagination
"""
type AgentConnection {
  edges: [AgentEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type AgentEdge {
  node: Agent!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

"""
Input for creating agent
"""
input CreateAgentInput {
  type: AgentType!
  name: String!
  description: String
  category: String
  config: AgentConfigInput!
}

"""
Input for agent configuration
"""
input AgentConfigInput {
  parameters: AgentParametersInput!
  knowledgeBase: KnowledgeBaseConfigInput
}

input AgentParametersInput {
  temperature: Float!
  maxTokens: Int!
  topP: Float!
}

"""
Custom scalar for JSON data
"""
scalar JSON

"""
Custom scalar for DateTime
"""
scalar DateTime
```

### 3.4 Knowledge Articles

#### 3.4.1 Creating Knowledge Articles

```bash
# Create knowledge article
info7 knowledge create --title "Diagnosing Respiratory Infections" --category medical --output ./knowledge/

# Import from existing document
info7 knowledge import --file ./documents/respiratory-infections.md --category medical
```

**Knowledge Article Format:**

```json
{
  "id": "respiratory-infections-diagnosis",
  "version": "1.0.0",
  "metadata": {
    "title": "Diagnosing Respiratory Infections",
    "category": "medical",
    "subcategory": "respiratory",
    "author": "Dr. Jane Smith",
    "reviewedBy": "Medical Review Board",
    "lastReview": "2025-02-01T00:00:00Z",
    "nextReview": "2026-02-01T00:00:00Z",
    "language": "en",
    "tags": ["respiratory", "infection", "diagnosis", "covid", "flu"],
    "difficulty": "advanced",
    "readingTime": 15
  },
  "content": {
    "summary": "Comprehensive guide to diagnosing common respiratory infections including COVID-19, influenza, and bacterial pneumonia.",
    "sections": [
      {
        "title": "Introduction",
        "content": "Respiratory infections are among the most common...",
        "references": ["ref-1", "ref-2"]
      },
      {
        "title": "Symptom Differentiation",
        "content": "Key differences in symptom presentation...",
        "subsections": [
          {
            "title": "COVID-19",
            "content": "Typical COVID-19 symptoms include...",
            "evidence": "high"
          },
          {
            "title": "Influenza",
            "content": "Influenza typically presents with...",
            "evidence": "high"
          }
        ]
      },
      {
        "title": "Diagnostic Tests",
        "content": "Available diagnostic tests and their accuracy...",
        "tables": [
          {
            "title": "Test Comparison",
            "headers": ["Test", "Sensitivity", "Specificity", "Time"],
            "rows": [
              ["PCR", "95-98%", "99%", "1-2 days"],
              ["Rapid Antigen", "65-80%", "95%", "15 min"],
              ["Chest X-Ray", "70%", "80%", "Same day"]
            ]
          }
        ]
      }
    ],
    "keyPoints": [
      "Early testing is crucial for accurate diagnosis",
      "Symptom overlap makes clinical diagnosis challenging",
      "PCR remains the gold standard for COVID-19"
    ],
    "references": [
      {
        "id": "ref-1",
        "type": "journal",
        "citation": "Smith J, et al. Respiratory Infection Diagnosis. NEJM. 2024;380(1):45-58.",
        "doi": "10.1056/NEJMra1234567",
        "url": "https://doi.org/10.1056/NEJMra1234567"
      }
    ]
  },
  "linkedArticles": [
    {
      "id": "covid-19-treatment",
      "title": "COVID-19 Treatment Guidelines",
      "relevance": "high"
    },
    {
      "id": "pneumonia-management",
      "title": "Bacterial Pneumonia Management",
      "relevance": "medium"
    }
  ],
  "attachments": [
    {
      "type": "pdf",
      "path": "attachments/respiratory-infections-flowchart.pdf",
      "description": "Diagnostic flowchart"
    },
    {
      "type": "image",
      "path": "attachments/chest-xray-examples.png",
      "description": "Chest X-ray examples"
    }
  ]
}
```

#### 3.4.2 Exporting Knowledge Base

```bash
# Export entire knowledge base
info7 knowledge export --output ./exports/knowledge/

# Export by category
info7 knowledge export --category medical --output ./exports/knowledge/medical/

# Export with embeddings
info7 knowledge export --category medical --with-embeddings --output ./exports/knowledge/

# Export as vector database dump
info7 knowledge export --format vectordb --output ./exports/knowledge/vectordb.dump
```

#### 3.4.3 Importing Knowledge Base

```bash
# Import knowledge articles
info7 knowledge import --file ./exports/knowledge/medical/respiratory-infections.json

# Import directory
info7 knowledge import --dir ./exports/knowledge/medical/ --recursive

# Import and generate embeddings
info7 knowledge import --dir ./exports/knowledge/ --generate-embeddings --model text-embedding-ada-002

# Import vector database dump
info7 knowledge import --format vectordb --file ./exports/knowledge/vectordb.dump
```

### 3.5 Multi-Language Support

#### 3.5.1 Translation Export

```bash
# Export documentation for translation
info7 docs export --language en --for-translation --output ./translations/source/

# Export with translation memory
info7 docs export --language en --with-tm --output ./translations/
```

**Translation Package Format:**

```json
{
  "sourceLanguage": "en",
  "targetLanguages": ["es", "fr", "de", "ru", "zh"],
  "documents": [
    {
      "id": "medical-diagnosis-guide",
      "sourceFile": "medical-diagnosis-guide.en.md",
      "translatedFiles": {
        "es": "medical-diagnosis-guide.es.md",
        "fr": "medical-diagnosis-guide.fr.md"
      },
      "status": {
        "es": "complete",
        "fr": "in-progress",
        "de": "pending",
        "ru": "pending",
        "zh": "pending"
      },
      "translationMemory": {
        "segments": 245,
        "translated": 245,
        "matches": {
          "100%": 180,
          "75-99%": 45,
          "50-74%": 15,
          "fuzzy": 5
        }
      }
    }
  ],
  "glossary": [
    {
      "term": "agent",
      "translations": {
        "es": "agente",
        "fr": "agent",
        "de": "Agent",
        "ru": "агент",
        "zh": "代理"
      },
      "context": "AI agent"
    },
    {
      "term": "diagnosis",
      "translations": {
        "es": "diagnóstico",
        "fr": "diagnostic",
        "de": "Diagnose",
        "ru": "диагноз",
        "zh": "诊断"
      }
    }
  ]
}
```

#### 3.5.2 Translation Import

```bash
# Import translated documentation
info7 docs import --file ./translations/medical-diagnosis-guide.es.md --language es

# Import translation package
info7 docs import --translation-package ./translations/medical-package-es.zip

# Validate translations
info7 docs validate --language es --check-completeness --check-formatting
```

---

## 4. Models

### 4.1 Overview

Management of various model types including reinforcement learning models, RAG embeddings, and fine-tuned models.

### 4.2 RL Models Export/Import

#### 4.2.1 Supported Model Formats

**TensorFlow/Keras (.h5, .keras):**

```bash
# Export RL model in Keras format
info7 model export --id meta-learner-v1 --format h5 --output ./exports/models/

# Export with training history
info7 model export --id meta-learner-v1 --format h5 --with-history --output ./exports/models/
```

**PyTorch (.pt, .pth):**

```bash
# Export PyTorch model
info7 model export --id strategy-selector --format pt --output ./exports/models/

# Export with optimizer state
info7 model export --id strategy-selector --format pt --with-optimizer --output ./exports/models/
```

**ONNX (. onnx):**

```bash
# Export to ONNX (for cross-platform deployment)
info7 model export --id meta-learner-v1 --format onnx --opset 13 --output ./exports/models/

# Export with optimization
info7 model export --id meta-learner-v1 --format onnx --optimize --output ./exports/models/
```

#### 4.2.2 Model Metadata

```json
{
  "id": "meta-learner-v1",
  "version": "1.0.0",
  "type": "reinforcement-learning",
  "framework": "tensorflow",
  "metadata": {
    "name": "Meta-Learning Strategy Selector",
    "description": "Meta-learning model for selecting optimal learning strategies",
    "author": "Info7 ML Team",
    "created": "2025-01-10T00:00:00Z",
    "trained": "2025-01-20T00:00:00Z",
    "framework": "TensorFlow 2.15",
    "pythonVersion": "3.11"
  },
  "architecture": {
    "type": "deep-q-network",
    "layers": [
      {
        "type": "dense",
        "units": 256,
        "activation": "relu"
      },
      {
        "type": "dropout",
        "rate": 0.3
      },
      {
        "type": "dense",
        "units": 128,
        "activation": "relu"
      },
      {
        "type": "dense",
        "units": 5,
        "activation": "softmax"
      }
    ],
    "inputShape": [64],
    "outputShape": [5],
    "parameters": 45892
  },
  "training": {
    "dataset": {
      "name": "strategy-selection-v1",
      "size": 100000,
      "split": {
        "train": 0.8,
        "validation": 0.1,
        "test": 0.1
      }
    },
    "hyperparameters": {
      "learningRate": 0.001,
      "batchSize": 32,
      "epochs": 100,
      "optimizer": "adam",
      "lossFunction": "categorical-crossentropy"
    },
    "metrics": {
      "finalLoss": 0.234,
      "accuracy": 0.892,
      "validationAccuracy": 0.876,
      "testAccuracy": 0.881
    },
    "earlyStoppingPatience": 10,
    "bestEpoch": 87
  },
  "performance": {
    "inferenceTime": {
      "mean": 12.5,
      "std": 2.3,
      "unit": "ms"
    },
    "throughput": 80,
    "memoryUsage": "512MB"
  },
  "files": {
    "model": "meta-learner-v1.h5",
    "weights": "meta-learner-v1-weights.h5",
    "architecture": "meta-learner-v1-architecture.json",
    "history": "meta-learner-v1-history.json",
    "config": "meta-learner-v1-config.json"
  },
  "deployment": {
    "minTensorFlow": "2.10",
    "minPython": "3.9",
    "gpuRequired": false,
    "recommendedGpu": true
  }
}
```

#### 4.2.3 Importing RL Models

```bash
# Import Keras model
info7 model import --file ./exports/models/meta-learner-v1.h5 --metadata ./exports/models/meta-learner-v1.json

# Import PyTorch model
info7 model import --file ./exports/models/strategy-selector.pt --framework pytorch

# Import ONNX model
info7 model import --file ./exports/models/meta-learner-v1.onnx --validate

# Import with automatic conversion
info7 model import --file ./exports/models/meta-learner-v1.h5 --convert-to onnx
```

### 4.3 RAG Embeddings

#### 4.3.1 Embedding Model Export

```bash
# Export embedding model
info7 embedding export --id medical-knowledge-embeddings --output ./exports/embeddings/

# Export with vector index
info7 embedding export --id medical-knowledge-embeddings --with-index --output ./exports/embeddings/

# Export embeddings for specific documents
info7 embedding export --id medical-knowledge-embeddings --documents medical/* --output ./exports/embeddings/
```

**Embedding Configuration:**

```json
{
  "id": "medical-knowledge-embeddings",
  "version": "1.0.0",
  "type": "embeddings",
  "metadata": {
    "name": "Medical Knowledge Embeddings",
    "description": "Embeddings for medical knowledge base",
    "created": "2025-01-15T00:00:00Z",
    "updated": "2025-02-05T00:00:00Z"
  },
  "model": {
    "provider": "openai",
    "name": "text-embedding-ada-002",
    "dimensions": 1536,
    "maxTokens": 8191
  },
  "vectorDatabase": {
    "type": "pinecone",
    "index": "medical-knowledge",
    "dimension": 1536,
    "metric": "cosine",
    "pods": 1,
    "replicas": 1
  },
  "documents": {
    "total": 15420,
    "categories": {
      "diagnosis": 4200,
      "treatment": 3800,
      "procedures": 2500,
      "medications": 2200,
      "guidelines": 1720,
      "research": 1000
    }
  },
  "statistics": {
    "averageChunkSize": 512,
    "totalVectors": 45680,
    "indexSize": "2.4GB",
    "queryLatency": {
      "p50": 45,
      "p95": 120,
      "p99": 180,
      "unit": "ms"
    }
  },
  "preprocessing": {
    "chunkSize": 512,
    "chunkOverlap": 50,
    "splitter": "recursive-character",
    "cleanHtml": true,
    "removeStopwords": false,
    "lowercase": false
  }
}
```

#### 4.3.2 Vector Database Export

```bash
# Export vector database (Pinecone)
info7 vectordb export --index medical-knowledge --format pinecone --output ./exports/vectordb/

# Export to FAISS
info7 vectordb export --index medical-knowledge --format faiss --output ./exports/vectordb/medical.faiss

# Export to Chroma
info7 vectordb export --index medical-knowledge --format chroma --output ./exports/vectordb/medical-chroma/

# Export with metadata
info7 vectordb export --index medical-knowledge --with-metadata --output ./exports/vectordb/
```

**Vector Database Formats:**

```bash
# FAISS Export Structure
exports/vectordb/
├── medical.faiss              # FAISS index file
├── medical-metadata.json      # Metadata mappings
└── medical-config.json        # Configuration

# Chroma Export Structure
exports/vectordb/medical-chroma/
├── chroma.sqlite3            # SQLite database
├── index/                    # Index files
└── config.json               # Configuration

# Pinecone Backup Structure
exports/vectordb/pinecone/
├── vectors/                  # Vector batches
│   ├── batch-0001.json
│   ├── batch-0002.json
│   └── ...
├── metadata.json            # Index metadata
└── config.json              # Configuration
```

#### 4.3.3 Importing Embeddings

```bash
# Import vector database
info7 vectordb import --file ./exports/vectordb/medical.faiss --index medical-knowledge

# Import from backup
info7 vectordb import --dir ./exports/vectordb/pinecone/ --format pinecone --create-index

# Import with re-indexing
info7 vectordb import --file ./exports/vectordb/medical.faiss --reindex --optimize

# Migrate between vector databases
info7 vectordb migrate --from faiss --to pinecone --source ./exports/vectordb/medical.faiss --target medical-knowledge
```

### 4.4 Fine-Tuned Models

#### 4.4.1 Fine-Tuned Model Export

```bash
# Export fine-tuned model
info7 finetune export --id medical-diagnosis-gpt --output ./exports/finetuned/

# Export with training data
info7 finetune export --id medical-diagnosis-gpt --with-training-data --output ./exports/finetuned/

# Export with evaluation results
info7 finetune export --id medical-diagnosis-gpt --with-eval --output ./exports/finetuned/
```

**Fine-Tuned Model Metadata:**

```json
{
  "id": "medical-diagnosis-gpt",
  "version": "1.0.0",
  "type": "fine-tuned-llm",
  "metadata": {
    "name": "Medical Diagnosis GPT",
    "description": "Fine-tuned GPT model for medical diagnosis",
    "baseModel": "gpt-4-1106-preview",
    "provider": "openai",
    "created": "2025-01-25T00:00:00Z"
  },
  "training": {
    "dataset": {
      "name": "medical-diagnosis-training",
      "examples": 10000,
      "format": "jsonl",
      "validation": {
        "examples": 1000,
        "split": 0.1
      }
    },
    "hyperparameters": {
      "nEpochs": 3,
      "batchSize": 32,
      "learningRateMultiplier": 0.1,
      "promptLossWeight": 0.1
    },
    "duration": "4h 32m",
    "cost": {
      "training": 125.50,
      "validation": 12.30,
      "currency": "USD"
    },
    "metrics": {
      "trainingLoss": 0.342,
      "validationLoss": 0.389,
      "trainingAccuracy": 0.912,
      "validationAccuracy": 0.887
    }
  },
  "performance": {
    "baselineComparison": {
      "baseModel": {
        "accuracy": 0.756,
        "f1Score": 0.723
      },
      "fineTunedModel": {
        "accuracy": 0.887,
        "f1Score": 0.856
      },
      "improvement": {
        "accuracy": "+17.3%",
        "f1Score": "+18.4%"
      }
    },
    "inferenceSpeed": {
      "tokensPerSecond": 45,
      "latency": {
        "mean": 850,
        "p95": 1200,
        "unit": "ms"
      }
    }
  },
  "deployment": {
    "modelId": "ft:gpt-4-1106:info7::8Xy9zZT1",
    "endpoint": "https://api.openai.com/v1/chat/completions",
    "maxTokens": 128000,
    "pricing": {
      "input": 0.03,
      "output": 0.06,
      "unit": "per 1K tokens"
    }
  },
  "files": {
    "trainingData": "medical-diagnosis-training.jsonl",
    "validationData": "medical-diagnosis-validation.jsonl",
    "results": "fine-tune-results.json",
    "evaluations": "evaluations/"
  }
}
```

#### 4.4.2 Importing Fine-Tuned Models

```bash
# Import fine-tuned model configuration
info7 finetune import --file ./exports/finetuned/medical-diagnosis-gpt.json

# Import and deploy
info7 finetune import --file ./exports/finetuned/medical-diagnosis-gpt.json --deploy

# Import training data for retraining
info7 finetune import --training-data ./exports/finetuned/medical-diagnosis-training.jsonl --model-id medical-diagnosis-gpt
```

### 4.5 Model Versioning

#### 4.5.1 Version Management

```bash
# List model versions
info7 model version list --id meta-learner

# Export specific version
info7 model export --id meta-learner --version 1.0.0 --output ./exports/models/

# Compare versions
info7 model version diff --id meta-learner --from 1.0.0 --to 1.1.0

# Rollback to previous version
info7 model version rollback --id meta-learner --to-version 1.0.0
```

**Version Comparison Output:**

```json
{
  "model": "meta-learner",
  "comparison": {
    "from": "1.0.0",
    "to": "1.1.0"
  },
  "changes": {
    "architecture": {
      "changed": true,
      "details": [
        "Added dropout layer after first dense layer",
        "Increased second dense layer from 128 to 256 units"
      ]
    },
    "parameters": {
      "from": 45892,
      "to": 78234,
      "change": "+70.5%"
    },
    "performance": {
      "accuracy": {
        "from": 0.881,
        "to": 0.912,
        "improvement": "+3.5%"
      },
      "inferenceTime": {
        "from": 12.5,
        "to": 18.3,
        "change": "+46.4%",
        "unit": "ms"
      }
    },
    "training": {
      "dataset": {
        "changed": true,
        "from": 100000,
        "to": 150000,
        "details": "Added 50,000 new examples"
      },
      "epochs": {
        "from": 100,
        "to": 120
      }
    }
  },
  "breakingChanges": false,
  "recommendedAction": "upgrade"
}
```

---

## 5. Experts & MoE

### 5.1 Overview

Management of expert systems, Mixture of Experts (MoE) configurations, expert ensembles, and weight management.

### 5.2 Expert Systems

#### 5.2.1 Expert Definition

```json
{
  "id": "cardiology-expert",
  "version": "1.0.0",
  "type": "domain-expert",
  "metadata": {
    "name": "Cardiology Expert System",
    "description": "Specialized expert system for cardiology diagnosis and treatment",
    "domain": "cardiology",
    "subdomain": "heart-disease",
    "expertise": ["diagnosis", "risk-assessment", "treatment-planning"],
    "created": "2025-01-20T00:00:00Z"
  },
  "knowledgeBase": {
    "rules": 1250,
    "facts": 8500,
    "ontologies": ["cardiovascular-disease", "cardiac-medications"],
    "guidelines": [
      "ACC/AHA Heart Disease Guidelines 2024",
      "ESC Cardiovascular Guidelines 2024"
    ]
  },
  "inferenceEngine": {
    "type": "rule-based",
    "strategy": "forward-chaining",
    "conflictResolution": "specificity",
    "uncertaintyHandling": "bayesian"
  },
  "capabilities": {
    "diagnosis": {
      "conditions": [
        "coronary-artery-disease",
        "heart-failure",
        "arrhythmias",
        "valvular-disease",
        "myocardial-infarction"
      ],
      "confidence": "high"
    },
    "riskAssessment": {
      "scores": ["ASCVD", "HEART", "GRACE", "TIMI"],
      "timeframes": ["10-year", "lifetime"]
    },
    "treatmentPlanning": {
      "medications": true,
      "procedures": true,
      "lifestyle": true,
      "followUp": true
    }
  },
  "performance": {
    "accuracy": 0.923,
    "precision": 0.915,
    "recall": 0.931,
    "f1Score": 0.923,
    "validatedAgainst": "clinical-trials-2024"
  }
}
```

#### 5.2.2 Expert Export/Import

```bash
# Export expert system
info7 expert export --id cardiology-expert --output ./exports/experts/

# Export with knowledge base
info7 expert export --id cardiology-expert --with-kb --output ./exports/experts/

# Export expert ensemble
info7 expert export --ensemble medical-diagnosis-ensemble --output ./exports/experts/ensembles/

# Import expert system
info7 expert import --file ./exports/experts/cardiology-expert.json

# Import with knowledge base
info7 expert import --file ./exports/experts/cardiology-expert.json --load-kb --validate
```

### 5.3 Mixture of Experts (MoE)

#### 5.3.1 MoE Configuration

```json
{
  "id": "medical-diagnosis-moe",
  "version": "1.0.0",
  "type": "mixture-of-experts",
  "metadata": {
    "name": "Medical Diagnosis MoE",
    "description": "Mixture of Experts system for comprehensive medical diagnosis",
    "created": "2025-01-25T00:00:00Z"
  },
  "architecture": {
    "type": "sparse-moe",
    "gating": "learned",
    "topK": 2,
    "loadBalancing": true
  },
  "experts": [
    {
      "id": "cardiology-expert",
      "domain": "cardiology",
      "weight": 1.0,
      "specialization": ["heart-disease", "cardiovascular"],
      "loadShare": 0.18
    },
    {
      "id": "neurology-expert",
      "domain": "neurology",
      "weight": 1.0,
      "specialization": ["brain", "nervous-system"],
      "loadShare": 0.15
    },
    {
      "id": "pulmonology-expert",
      "domain": "pulmonology",
      "weight": 1.0,
      "specialization": ["respiratory", "lungs"],
      "loadShare": 0.14
    },
    {
      "id": "gastroenterology-expert",
      "domain": "gastroenterology",
      "weight": 1.0,
      "specialization": ["digestive", "gi-tract"],
      "loadShare": 0.12
    },
    {
      "id": "endocrinology-expert",
      "domain": "endocrinology",
      "weight": 1.0,
      "specialization": ["hormones", "metabolism"],
      "loadShare": 0.11
    },
    {
      "id": "orthopedics-expert",
      "domain": "orthopedics",
      "weight": 1.0,
      "specialization": ["bones", "joints", "musculoskeletal"],
      "loadShare": 0.10
    },
    {
      "id": "general-medicine-expert",
      "domain": "general",
      "weight": 0.8,
      "specialization": ["general-practice", "primary-care"],
      "loadShare": 0.20
    }
  ],
  "gatingNetwork": {
    "type": "neural",
    "architecture": {
      "layers": [
        {
          "type": "dense",
          "units": 128,
          "activation": "relu"
        },
        {
          "type": "dense",
          "units": 7,
          "activation": "softmax"
        }
      ]
    },
    "training": {
      "loss": "categorical-crossentropy",
      "optimizer": "adam",
      "learningRate": 0.001
    },
    "performance": {
      "routingAccuracy": 0.945,
      "averageConfidence": 0.876
    }
  },
  "routing": {
    "strategy": "confidence-based",
    "fallback": "general-medicine-expert",
    "minConfidence": 0.6,
    "multiExpertMode": "weighted-average",
    "caching": {
      "enabled": true,
      "ttl": 3600
    }
  },
  "performance": {
    "overallAccuracy": 0.934,
    "averageLatency": 245,
    "throughput": 120,
    "expertUtilization": {
      "mean": 0.85,
      "std": 0.12
    }
  }
}
```

#### 5.3.2 MoE Export/Import

```bash
# Export MoE configuration
info7 moe export --id medical-diagnosis-moe --output ./exports/moe/

# Export with all experts
info7 moe export --id medical-diagnosis-moe --with-experts --output ./exports/moe/

# Export with gating network
info7 moe export --id medical-diagnosis-moe --with-gating --output ./exports/moe/

# Import MoE
info7 moe import --file ./exports/moe/medical-diagnosis-moe.json

# Import with experts
info7 moe import --file ./exports/moe/medical-diagnosis-moe.json --load-experts

# Import and retrain gating network
info7 moe import --file ./exports/moe/medical-diagnosis-moe.json --retrain-gating
```

### 5.4 Expert Ensembles

#### 5.4.1 Ensemble Configuration

```json
{
  "id": "financial-advisory-ensemble",
  "version": "1.0.0",
  "type": "expert-ensemble",
  "metadata": {
    "name": "Financial Advisory Ensemble",
    "description": "Ensemble of financial experts for comprehensive advisory",
    "domain": "financial",
    "created": "2025-02-01T00:00:00Z"
  },
  "ensemble": {
    "strategy": "weighted-voting",
    "aggregation": "bayesian-model-averaging",
    "diversityMeasure": "disagreement"
  },
  "members": [
    {
      "id": "investment-expert",
      "type": "rule-based",
      "weight": 0.30,
      "votingPower": 1.0,
      "specialization": "investment-strategy"
    },
    {
      "id": "risk-assessment-expert",
      "type": "ml-model",
      "weight": 0.25,
      "votingPower": 1.0,
      "specialization": "risk-analysis"
    },
    {
      "id": "portfolio-optimization-expert",
      "type": "optimization-model",
      "weight": 0.25,
      "votingPower": 1.0,
      "specialization": "portfolio-management"
    },
    {
      "id": "market-analysis-expert",
      "type": "hybrid",
      "weight": 0.20,
      "votingPower": 0.8,
      "specialization": "market-trends"
    }
  ],
  "voting": {
    "method": "weighted-majority",
    "quorum": 0.5,
    "unanimityBonus": 1.2,
    "tieBreaker": "highest-confidence"
  },
  "confidence": {
    "calculation": "weighted-average",
    "minThreshold": 0.65,
    "consensusThreshold": 0.80,
    "disagreementPenalty": 0.15
  },
  "performance": {
    "accuracy": 0.921,
    "precision": 0.908,
    "recall": 0.934,
    "f1Score": 0.921,
    "ensembleImprovement": "+8.4%",
    "diversity": 0.32
  }
}
```

#### 5.4.2 Ensemble Export/Import

```bash
# Export ensemble
info7 ensemble export --id financial-advisory-ensemble --output ./exports/ensembles/

# Export with all members
info7 ensemble export --id financial-advisory-ensemble --with-members --output ./exports/ensembles/

# Import ensemble
info7 ensemble import --file ./exports/ensembles/financial-advisory-ensemble.json

# Import with member validation
info7 ensemble import --file ./exports/ensembles/financial-advisory-ensemble.json --validate-members
```

### 5.5 Expert Weight Management

#### 5.5.1 Weight Optimization

```bash
# Export current weights
info7 expert weights export --ensemble financial-advisory-ensemble --output ./exports/weights/

# Optimize weights based on performance
info7 expert weights optimize --ensemble financial-advisory-ensemble --metric f1-score --iterations 1000

# Export optimized weights
info7 expert weights export --ensemble financial-advisory-ensemble --version optimized --output ./exports/weights/

# Import weights
info7 expert weights import --ensemble financial-advisory-ensemble --file ./exports/weights/optimized-weights.json

# Compare weight configurations
info7 expert weights compare --ensemble financial-advisory-ensemble --baseline default --candidate optimized
```

**Weight Configuration Format:**

```json
{
  "ensemble": "financial-advisory-ensemble",
  "version": "optimized-v1",
  "optimized": "2025-02-05T00:00:00Z",
  "optimization": {
    "method": "bayesian-optimization",
    "metric": "f1-score",
    "iterations": 1000,
    "convergence": true
  },
  "weights": {
    "investment-expert": {
      "base": 0.30,
      "optimized": 0.32,
      "change": "+6.7%"
    },
    "risk-assessment-expert": {
      "base": 0.25,
      "optimized": 0.28,
      "change": "+12.0%"
    },
    "portfolio-optimization-expert": {
      "base": 0.25,
      "optimized": 0.24,
      "change": "-4.0%"
    },
    "market-analysis-expert": {
      "base": 0.20,
      "optimized": 0.16,
      "change": "-20.0%"
    }
  },
  "performance": {
    "baseline": {
      "accuracy": 0.908,
      "f1Score": 0.901
    },
    "optimized": {
      "accuracy": 0.921,
      "f1Score": 0.921
    },
    "improvement": {
      "accuracy": "+1.4%",
      "f1Score": "+2.2%"
    }
  },
  "validation": {
    "crossValidation": "5-fold",
    "testSetPerformance": 0.918,
    "confidence": 0.95
  }
}
```

---

## 6. Batch Operations

### 6.1 Overview

Batch operations for bulk import/export, streaming, migration, and validation across all data types.

### 6.2 Bulk Import

#### 6.2.1 Bulk Agent Import

```bash
# Import multiple agents from directory
info7 batch import agents --dir ./exports/agents/ --recursive

# Import with concurrency
info7 batch import agents --dir ./exports/agents/ --parallel 4 --progress

# Import with validation
info7 batch import agents --dir ./exports/agents/ --validate --strict --continue-on-error

# Import from manifest
info7 batch import agents --manifest ./exports/agents-manifest.json
```

**Manifest Format:**

```json
{
  "version": "1.0.0",
  "type": "bulk-import",
  "category": "agents",
  "metadata": {
    "created": "2025-02-05T00:00:00Z",
    "source": "production-backup",
    "totalItems": 11
  },
  "items": [
    {
      "file": "agents/medical-diagnosis-assistant.json",
      "action": "import",
      "override": false,
      "validate": true
    },
    {
      "file": "agents/investment-advisor.json",
      "action": "import",
      "override": true,
      "validate": true
    },
    {
      "file": "agents/career-counselor.json",
      "action": "import",
      "override": false,
      "validate": true
    }
  ],
  "options": {
    "parallel": 4,
    "continueOnError": true,
    "backupBeforeImport": true,
    "dryRun": false
  }
}
```

**Batch Import Progress:**

```bash
$ info7 batch import agents --manifest ./exports/agents-manifest.json --progress

Batch Import Progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 11 agents
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ medical-diagnosis-assistant.json        [1/11] Success
✓ investment-advisor.json                 [2/11] Success
✓ career-counselor.json                   [3/11] Success
✓ mental-health-counselor.json            [4/11] Success
✓ nutrition-advisor.json                  [5/11] Success
✗ budget-planner.json                     [6/11] Error: Validation failed
✓ immigration-specialist.json             [7/11] Success
✓ contract-lawyer.json                    [8/11] Success
✓ benefits-calculator.json                [9/11] Success
✓ home-manager.json                      [10/11] Success
✓ elderly-care-coordinator.json          [11/11] Success

Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Successful: 10
✗ Failed: 1
⊘ Skipped: 0
Duration: 45.3s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Errors:
  budget-planner.json: Validation failed - missing required field 'config.parameters.temperature'
```

#### 6.2.2 Bulk Skills Import

```bash
# Import skills from directory
info7 batch import skills --dir ./exports/skills/ --resolve-deps

# Import skills with dependency graph
info7 batch import skills --dir ./exports/skills/ --build-dep-graph --validate-deps

# Import from package
info7 batch import skills --package ./skills-bundle-v1.0.0.tar.gz --extract
```

#### 6.2.3 Bulk Knowledge Import

```bash
# Import knowledge base
info7 batch import knowledge --dir ./exports/knowledge/ --category medical

# Import with embedding generation
info7 batch import knowledge --dir ./exports/knowledge/ --generate-embeddings --model text-embedding-ada-002

# Import and index
info7 batch import knowledge --dir ./exports/knowledge/ --index vectordb --batch-size 100
```

### 6.3 Streaming Export

#### 6.3.1 Streaming Large Datasets

```bash
# Stream export large knowledge base
info7 stream export knowledge --category medical --output ./exports/knowledge-stream/ --chunk-size 1000

# Stream with compression
info7 stream export knowledge --category medical --output ./exports/knowledge-stream.tar.gz --compress gzip --chunk-size 1000

# Stream to cloud storage
info7 stream export agents --all --output s3://backups/agents/ --chunk-size 50
```

**Streaming Configuration:**

```json
{
  "export": {
    "type": "streaming",
    "source": "knowledge-base",
    "category": "medical",
    "destination": "./exports/knowledge-stream/"
  },
  "streaming": {
    "chunkSize": 1000,
    "compression": "gzip",
    "parallel": 2,
    "bufferSize": "100MB"
  },
  "format": {
    "type": "jsonl",
    "encoding": "utf-8"
  },
  "options": {
    "includeMetadata": true,
    "includeEmbeddings": false,
    "validateChunks": true
  },
  "progress": {
    "total": 15420,
    "processed": 0,
    "chunks": 0,
    "estimatedTime": "~8 minutes"
  }
}
```

#### 6.3.2 Streaming Import

```bash
# Stream import from chunks
info7 stream import knowledge --source ./exports/knowledge-stream/ --decompress gzip

# Stream import with validation
info7 stream import knowledge --source ./exports/knowledge-stream/ --validate-each-chunk --parallel 4

# Stream import from cloud
info7 stream import agents --source s3://backups/agents/ --credentials ./aws-credentials.json
```

### 6.4 Migration Tools

#### 6.4.1 Platform Migration

```bash
# Export entire platform for migration
info7 migrate export --all --output ./migration/platform-backup/

# Export with structure
info7 migrate export --all --preserve-structure --with-metadata --output ./migration/platform-backup/
```

**Migration Package Structure:**

```
migration/platform-backup/
├── manifest.json
├── metadata/
│   ├── platform-info.json
│   ├── schema-version.json
│   └── export-log.json
├── agents/
│   ├── professional/
│   ├── orchestrator/
│   └── worker/
├── skills/
│   ├── healthcare/
│   ├── financial/
│   └── education/
├── documentation/
│   ├── guides/
│   ├── api/
│   └── knowledge/
├── models/
│   ├── rl/
│   ├── embeddings/
│   └── finetuned/
├── experts/
│   ├── domain-experts/
│   ├── moe/
│   └── ensembles/
└── configs/
    ├── agents/
    ├── system/
    └── security/
```

**Migration Manifest:**

```json
{
  "version": "1.0.0",
  "type": "full-platform-migration",
  "exported": "2025-02-05T10:00:00Z",
  "source": {
    "platform": "info7",
    "version": "1.0.0",
    "environment": "production",
    "hostname": "prod-server-01"
  },
  "contents": {
    "agents": {
      "count": 11,
      "path": "agents/",
      "size": "45MB"
    },
    "skills": {
      "count": 87,
      "path": "skills/",
      "size": "128MB"
    },
    "documentation": {
      "count": 234,
      "path": "documentation/",
      "size": "89MB"
    },
    "models": {
      "count": 15,
      "path": "models/",
      "size": "2.4GB"
    },
    "experts": {
      "count": 23,
      "path": "experts/",
      "size": "340MB"
    },
    "knowledgeBase": {
      "documents": 15420,
      "vectors": 45680,
      "path": "knowledge/",
      "size": "3.8GB"
    }
  },
  "totalSize": "6.8GB",
  "compression": "gzip",
  "checksum": {
    "algorithm": "sha256",
    "value": "a3f5b9c2d8e1f4g7h9i0j2k4l6m8n0p2q4r6s8t0u2v4w6x8y0z2"
  },
  "compatibility": {
    "minVersion": "1.0.0",
    "maxVersion": "1.x.x"
  }
}
```

#### 6.4.2 Importing Migration Package

```bash
# Import migration package
info7 migrate import --source ./migration/platform-backup/ --dry-run

# Import with validation
info7 migrate import --source ./migration/platform-backup/ --validate --verify-checksums

# Import to new environment
info7 migrate import --source ./migration/platform-backup/ --target-env staging --remap-configs

# Selective import
info7 migrate import --source ./migration/platform-backup/ --include agents,skills --exclude models
```

#### 6.4.3 Version Migration

```bash
# Migrate from older version
info7 migrate upgrade --source ./migration/v0.9-backup/ --target-version 1.0.0 --auto-migrate

# Migration with transformation
info7 migrate upgrade --source ./migration/v0.9-backup/ --target-version 1.0.0 --transform-schema

# Validate migration
info7 migrate validate --source ./migration/v0.9-backup/ --target-version 1.0.0 --check-compatibility
```

### 6.5 Validation

#### 6.5.1 Pre-Import Validation

```bash
# Validate export package before import
info7 validate package --file ./exports/agents-bundle.zip --verbose

# Validate against schema
info7 validate package --file ./exports/agents-bundle.zip --schema ./schemas/agent-v1.schema.json

# Validate dependencies
info7 validate deps --file ./exports/skills/diagnosis-suggestion.json --check-availability
```

**Validation Report:**

```json
{
  "package": "./exports/agents-bundle.zip",
  "validated": "2025-02-05T12:00:00Z",
  "status": "passed-with-warnings",
  "summary": {
    "total": 11,
    "passed": 10,
    "failed": 0,
    "warnings": 1
  },
  "results": [
    {
      "file": "medical-diagnosis-assistant.json",
      "status": "passed",
      "checks": {
        "schema": "passed",
        "structure": "passed",
        "dependencies": "passed",
        "versioning": "passed"
      }
    },
    {
      "file": "investment-advisor.json",
      "status": "warning",
      "checks": {
        "schema": "passed",
        "structure": "passed",
        "dependencies": "warning",
        "versioning": "passed"
      },
      "warnings": [
        {
          "type": "dependency",
          "message": "Optional dependency 'market-data-api' not available",
          "severity": "low",
          "resolution": "Agent will function with reduced capabilities"
        }
      ]
    }
  ],
  "checksumVerification": {
    "status": "passed",
    "algorithm": "sha256",
    "verified": 11
  },
  "compatibilityCheck": {
    "platformVersion": "1.0.0",
    "compatible": true,
    "requiredVersion": "^1.0.0"
  }
}
```

#### 6.5.2 Post-Import Validation

```bash
# Validate after import
info7 validate imported --category agents --recent 1h

# Verify functionality
info7 validate functional --agent-id medical-diagnosis --run-tests

# Performance validation
info7 validate performance --agent-id investment-advisor --benchmark
```

---

## 7. API Reference

### 7.1 Overview

Complete API reference covering REST APIs, GraphQL, CLI tools, and SDKs for all import/export operations.

### 7.2 REST API

#### 7.2.1 Authentication

```bash
# Get API token
curl -X POST https://api.info7.ai/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "your-password"
  }'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "refreshToken": "rt_abc123..."
}

# Use token in requests
curl -X GET https://api.info7.ai/v1/agents \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 7.2.2 Agent Export API

```bash
# Export agent as JSON
curl -X POST https://api.info7.ai/v1/agents/medical-diagnosis/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "json",
    "includeConfig": true,
    "includeState": false
  }' \
  -o medical-diagnosis.json

# Export with async job (for large exports)
curl -X POST https://api.info7.ai/v1/agents/medical-diagnosis/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "json",
    "async": true,
    "webhook": "https://your-app.com/webhook/export-complete"
  }'

# Response (async)
{
  "jobId": "export-job-abc123",
  "status": "queued",
  "estimatedTime": 120,
  "statusUrl": "/v1/jobs/export-job-abc123"
}

# Check job status
curl -X GET https://api.info7.ai/v1/jobs/export-job-abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response
{
  "jobId": "export-job-abc123",
  "status": "completed",
  "progress": 100,
  "result": {
    "downloadUrl": "https://api.info7.ai/v1/downloads/abc123",
    "expiresAt": "2025-02-06T12:00:00Z",
    "fileSize": 1024000
  }
}
```

#### 7.2.3 Agent Import API

```bash
# Import agent from JSON
curl -X POST https://api.info7.ai/v1/agents/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@medical-diagnosis.json" \
  -F "validate=true" \
  -F "override=false"

# Response
{
  "success": true,
  "agent": {
    "id": "medical-diagnosis-assistant",
    "version": "1.0.0",
    "imported": "2025-02-05T12:30:00Z"
  },
  "validation": {
    "passed": true,
    "warnings": []
  }
}

# Bulk import API
curl -X POST https://api.info7.ai/v1/agents/import/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "manifest=@agents-manifest.json" \
  -F "agents=@agents-bundle.zip"

# Response
{
  "jobId": "bulk-import-xyz789",
  "status": "processing",
  "total": 11,
  "statusUrl": "/v1/jobs/bulk-import-xyz789"
}
```

#### 7.2.4 Skills API

```bash
# List skills
curl -X GET "https://api.info7.ai/v1/skills?category=healthcare" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Export skill
curl -X POST https://api.info7.ai/v1/skills/symptom-analysis/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "json",
    "includeDependencies": true
  }' \
  -o symptom-analysis.json

# Import skill
curl -X POST https://api.info7.ai/v1/skills/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@symptom-analysis.json" \
  -F "resolveDeps=true"
```

#### 7.2.5 Models API

```bash
# List models
curl -X GET https://api.info7.ai/v1/models \
  -H "Authorization: Bearer YOUR_TOKEN"

# Export model
curl -X POST https://api.info7.ai/v1/models/meta-learner-v1/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "h5",
    "includeWeights": true,
    "includeHistory": true
  }'

# Response (async download)
{
  "jobId": "model-export-def456",
  "status": "processing",
  "downloadUrl": null,
  "estimatedTime": 300
}

# Import model
curl -X POST https://api.info7.ai/v1/models/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@meta-learner-v1.h5" \
  -F "metadata=@meta-learner-v1.json"
```

#### 7.2.6 Knowledge Base API

```bash
# Export knowledge base
curl -X POST https://api.info7.ai/v1/knowledge/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "medical",
    "format": "jsonl",
    "includeEmbeddings": true,
    "async": true
  }'

# Import knowledge articles
curl -X POST https://api.info7.ai/v1/knowledge/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@medical-knowledge.jsonl" \
  -F "generateEmbeddings=true" \
  -F "model=text-embedding-ada-002"

# Batch import
curl -X POST https://api.info7.ai/v1/knowledge/import/batch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@article1.json" \
  -F "files=@article2.json" \
  -F "files=@article3.json" \
  -F "batchSize=100"
```

### 7.3 GraphQL API

#### 7.3.1 Agent Queries

```graphql
# Query agents
query GetAgents {
  agents(type: PROFESSIONAL, limit: 10) {
    edges {
      node {
        id
        name
        type
        category
        version
        capabilities
        metadata {
          createdAt
          updatedAt
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}

# Get single agent
query GetAgent($id: ID!) {
  agent(id: $id) {
    id
    name
    description
    type
    category
    version
    config {
      parameters {
        temperature
        maxTokens
        topP
      }
      knowledgeBase {
        enabled
        sources
      }
    }
  }
}

# Export agent
mutation ExportAgent($id: ID!, $options: ExportOptions!) {
  exportAgent(id: $id, options: $options) {
    jobId
    status
    downloadUrl
  }
}

# Variables
{
  "id": "medical-diagnosis",
  "options": {
    "format": "JSON",
    "includeConfig": true,
    "includeState": false
  }
}
```

#### 7.3.2 Skills Mutations

```graphql
# Import skill
mutation ImportSkill($input: ImportSkillInput!) {
  importSkill(input: $input) {
    skill {
      id
      version
      name
    }
    validation {
      passed
      warnings
      errors
    }
  }
}

# Variables
{
  "input": {
    "file": "base64-encoded-file-content",
    "validate": true,
    "resolveDependencies": true
  }
}

# Export skill
mutation ExportSkill($id: ID!, $options: ExportOptions!) {
  exportSkill(id: $id, options: $options) {
    jobId
    status
    downloadUrl
  }
}
```

#### 7.3.3 Batch Operations

```graphql
# Bulk import mutation
mutation BulkImportAgents($input: BulkImportInput!) {
  bulkImportAgents(input: $input) {
    jobId
    status
    progress {
      total
      completed
      failed
    }
  }
}

# Variables
{
  "input": {
    "manifest": "base64-encoded-manifest",
    "files": ["base64-encoded-file1", "base64-encoded-file2"],
    "options": {
      "parallel": 4,
      "validateEach": true,
      "continueOnError": true
    }
  }
}

# Subscribe to batch progress
subscription BatchImportProgress($jobId: ID!) {
  batchImportProgress(jobId: $jobId) {
    progress {
      total
      completed
      failed
      current
    }
    status
    errors {
      item
      message
    }
  }
}
```

### 7.4 CLI Reference

#### 7.4.1 Global Options

```bash
# Global CLI options
info7 [command] [options]

Global Options:
  --config <path>       Config file path (default: ~/.info7/config.yaml)
  --api-key <key>       API key for authentication
  --endpoint <url>      API endpoint URL (default: https://api.info7.ai)
  --verbose, -v         Verbose output
  --quiet, -q           Quiet mode (errors only)
  --json                Output in JSON format
  --no-color            Disable colored output
  --help, -h            Show help
  --version, -V         Show version
```

#### 7.4.2 Agent Commands

```bash
# Agent commands
info7 agent <command> [options]

Commands:
  list                  List all agents
  get <id>              Get agent details
  create                Create new agent
  update <id>           Update agent
  delete <id>           Delete agent
  export <id>           Export agent
  import                Import agent
  validate <id>         Validate agent
  version               Manage agent versions
  config                Manage agent configuration
  query <id>            Query agent

Examples:
  info7 agent list --type professional
  info7 agent get medical-diagnosis
  info7 agent export medical-diagnosis --format json --output ./
  info7 agent import --file medical-diagnosis.json --validate
  info7 agent version list --id medical-diagnosis
```

#### 7.4.3 Skill Commands

```bash
# Skill commands
info7 skill <command> [options]

Commands:
  list                  List all skills
  get <id>              Get skill details
  create                Create new skill
  export <id>           Export skill
  import                Import skill
  validate <id>         Validate skill
  deps                  Manage dependencies
  package               Package skill
  publish               Publish skill

Examples:
  info7 skill list --category healthcare
  info7 skill export symptom-analysis --with-deps
  info7 skill import --file symptom-analysis.json --resolve-deps
  info7 skill deps check --id diagnosis-suggestion
  info7 skill package --path ./dist --output skill-v1.0.0.tar.gz
```

#### 7.4.4 Batch Commands

```bash
# Batch commands
info7 batch <command> [options]

Commands:
  import                Bulk import resources
  export                Bulk export resources
  validate              Validate batch operations

Subcommands:
  import agents         Import multiple agents
  import skills         Import multiple skills
  import knowledge      Import knowledge articles
  export agents         Export multiple agents
  export skills         Export multiple skills

Examples:
  info7 batch import agents --dir ./exports/agents/ --parallel 4
  info7 batch import agents --manifest ./manifest.json --progress
  info7 batch export agents --all --output ./backup/
  info7 batch validate --manifest ./manifest.json
```

### 7.5 SDK Examples

#### 7.5.1 TypeScript/JavaScript SDK

```typescript
import { Info7Client } from '@info7/sdk';

// Initialize client
const client = new Info7Client({
  apiKey: process.env.INFO7_API_KEY,
  endpoint: 'https://api.info7.ai'
});

// Export agent
async function exportAgent() {
  try {
    const result = await client.agents.export('medical-diagnosis', {
      format: 'json',
      includeConfig: true,
      includeState: false
    });

    console.log('Export job ID:', result.jobId);

    // Wait for completion
    const download = await client.jobs.wait(result.jobId);

    // Download file
    const buffer = await client.downloads.get(download.downloadUrl);
    fs.writeFileSync('./medical-diagnosis.json', buffer);

    console.log('Export completed');
  } catch (error) {
    console.error('Export failed:', error.message);
  }
}

// Import agent
async function importAgent() {
  try {
    const file = fs.readFileSync('./medical-diagnosis.json');

    const result = await client.agents.import(file, {
      validate: true,
      override: false
    });

    console.log('Import successful:', result.agent.id);
  } catch (error) {
    console.error('Import failed:', error.message);
  }
}

// Bulk import agents
async function bulkImportAgents() {
  const manifest = {
    version: '1.0.0',
    items: [
      { file: 'agent1.json', validate: true },
      { file: 'agent2.json', validate: true },
      { file: 'agent3.json', validate: true }
    ],
    options: {
      parallel: 2,
      continueOnError: true
    }
  };

  const job = await client.agents.bulkImport(manifest);

  // Monitor progress
  for await (const progress of client.jobs.stream(job.jobId)) {
    console.log(`Progress: ${progress.completed}/${progress.total}`);
  }

  console.log('Bulk import completed');
}

// Export agent (TypeScript)
exportAgent();

// Import agent (TypeScript)
importAgent();

// Bulk import (TypeScript)
bulkImportAgents();
```

#### 7.5.2 Python SDK

```python
from info7 import Info7Client
import os

# Initialize client
client = Info7Client(
    api_key=os.environ.get('INFO7_API_KEY'),
    endpoint='https://api.info7.ai'
)

# Export agent
def export_agent():
    try:
        # Start export
        result = client.agents.export(
            'medical-diagnosis',
            format='json',
            include_config=True,
            include_state=False
        )

        print(f'Export job ID: {result.job_id}')

        # Wait for completion
        download = client.jobs.wait(result.job_id)

        # Download file
        with open('medical-diagnosis.json', 'wb') as f:
            f.write(client.downloads.get(download.download_url))

        print('Export completed')
    except Exception as e:
        print(f'Export failed: {e}')

# Import agent
def import_agent():
    try:
        with open('medical-diagnosis.json', 'rb') as f:
            result = client.agents.import_file(
                f,
                validate=True,
                override=False
            )

        print(f'Import successful: {result.agent.id}')
    except Exception as e:
        print(f'Import failed: {e}')

# Bulk import with progress
def bulk_import_agents():
    manifest = {
        'version': '1.0.0',
        'items': [
            {'file': 'agent1.json', 'validate': True},
            {'file': 'agent2.json', 'validate': True},
            {'file': 'agent3.json', 'validate': True}
        ],
        'options': {
            'parallel': 2,
            'continue_on_error': True
        }
    }

    job = client.agents.bulk_import(manifest)

    # Monitor progress
    for progress in client.jobs.stream(job.job_id):
        print(f'Progress: {progress.completed}/{progress.total}')
        if progress.errors:
            for error in progress.errors:
                print(f'Error: {error.item} - {error.message}')

    print('Bulk import completed')

# Run examples
if __name__ == '__main__':
    export_agent()
    import_agent()
    bulk_import_agents()
```

---

## Best Practices

### General Guidelines

1. **Always Validate Before Import**
   - Run validation checks before importing
   - Verify checksums for large files
   - Check dependency availability

2. **Use Version Control**
   - Export with version information
   - Maintain version history
   - Document breaking changes

3. **Backup Before Modifications**
   - Create backups before bulk operations
   - Use dry-run mode for testing
   - Keep rollback options available

4. **Optimize Performance**
   - Use parallel operations for bulk imports
   - Enable compression for large exports
   - Stream large datasets instead of loading entirely

5. **Security Considerations**
   - Encrypt sensitive data in exports
   - Use secure transfer protocols
   - Implement access controls
   - Audit import/export operations

6. **Documentation**
   - Include metadata with exports
   - Document custom configurations
   - Maintain change logs
   - Version documentation alongside code

### Error Handling

```bash
# Always use error handling
info7 agent import --file agent.json --continue-on-error --log-errors ./errors.log

# Validate before operations
info7 validate package --file bundle.zip || exit 1

# Use dry-run for testing
info7 batch import agents --dir ./agents/ --dry-run

# Monitor job status
info7 jobs watch <job-id> --notify-on-complete
```

---

## Troubleshooting

### Common Issues

**Issue: Import fails with "Dependency not found"**
```bash
# Solution: Resolve dependencies automatically
info7 agent import --file agent.json --resolve-deps --install-missing
```

**Issue: Export times out for large datasets**
```bash
# Solution: Use async export with streaming
info7 knowledge export --category medical --async --stream --chunk-size 1000
```

**Issue: Version conflict during import**
```bash
# Solution: Migrate to compatible version
info7 migrate upgrade --source ./old-export/ --target-version 1.0.0 --auto-migrate
```

**Issue: Validation errors**
```bash
# Solution: Get detailed validation report
info7 validate package --file bundle.zip --verbose --output validation-report.json
```

---

## Appendix

### A. File Formats Reference

| Format | Extension | Use Case | Compression |
|--------|-----------|----------|-------------|
| JSON | .json | Human-readable, config files | Optional (gzip) |
| YAML | .yaml, .yml | Configuration, readability | Optional (gzip) |
| Binary | .bin | Performance, large models | Built-in |
| JSONL | .jsonl | Streaming, bulk data | Optional (gzip) |
| HDF5 | .h5 | ML models (Keras) | Built-in |
| PyTorch | .pt, .pth | ML models (PyTorch) | Optional |
| ONNX | .onnx | Cross-platform models | Optional |
| FAISS | .faiss | Vector indices | No |
| Tar/Zip | .tar.gz, .zip | Bundles, packages | Yes |

### B. API Rate Limits

| Endpoint | Rate Limit | Burst |
|----------|------------|-------|
| /agents | 100/min | 20 |
| /skills | 100/min | 20 |
| /models/export | 10/min | 2 |
| /models/import | 10/min | 2 |
| /knowledge | 200/min | 50 |
| /batch | 10/min | 2 |

### C. Model Size Guidelines

| Model Type | Typical Size | Max Size | Recommended Format |
|------------|--------------|----------|-------------------|
| RL Models | 50-500 MB | 2 GB | ONNX (optimized) |
| Embeddings | 1-5 GB | 10 GB | FAISS/Pinecone |
| Fine-tuned LLM | N/A (API) | N/A | API reference only |
| Expert Systems | 10-100 MB | 500 MB | JSON |
| MoE Configs | 1-10 MB | 50 MB | YAML/JSON |

---

## Support

For additional help:
- Documentation: https://docs.info7.ai
- API Reference: https://api.info7.ai/docs
- Community Forum: https://community.info7.ai
- GitHub Issues: https://github.com/info7/platform/issues
- Email: support@info7.ai

---

*Last Updated: February 5, 2025*
*Version: 1.0.0*
*© 2025 Info7 Platform. All rights reserved.*
