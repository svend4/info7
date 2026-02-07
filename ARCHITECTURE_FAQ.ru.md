# Архитектурные Вопросы и Ответы

## 📚 Содержание

1. [Монорепо Инфраструктура](#1-монорепо-инфраструктура)
2. [Расширяемость Системы](#2-расширяемость-системы)
3. [Импорт/Экспорт Данных](#3-импортэкспорт-данных)
4. [Модульная Архитектура](#4-модульная-архитектура)
5. [Коммуникация с Внешними Системами](#5-коммуникация-с-внешними-системами)

---

## 1. Монорепо Инфраструктура

### Что такое Монорепо?

**Монорепозиторий (Monorepo)** — это единый git-репозиторий, содержащий несколько связанных проектов/пакетов.

**Текущая структура info7:**

```
info7/                                    ← Один репозиторий
├── packages/
│   ├── common/                          ← Пакет 1: Общие утилиты
│   ├── leonardo-ai/                     ← Пакет 2: RL + RAG
│   ├── openclaw-meta-agents/            ← Пакет 3: Мета-агенты
│   └── orchestrator-kit-enterprise/     ← Пакет 4: Enterprise функции
├── package.json                         ← Единая конфигурация
└── node_modules/                        ← Общие зависимости
```

### ✅ Плюсы Монорепо

#### 1. **Упрощенное Управление Зависимостями**

**Проблема с мультирепо:**
```bash
# Нужно обновлять в каждом репозитории отдельно
cd common-utils && git pull && npm install
cd leonardo-ai && git pull && npm install
cd openclaw && git pull && npm install
cd enterprise && git pull && npm install
```

**Решение монорепо:**
```bash
# Одна команда для всего
git pull && npm install
```

#### 2. **Атомарные Изменения Через Границы Пакетов**

**Пример:** Изменение API в `@info7/common`

**Мультирепо (сложно):**
```
1. Изменить common-utils → Коммит → Push → Publish v1.1.0
2. Обновить leonardo-ai → package.json: "common-utils": "^1.1.0"
3. Обновить openclaw → package.json: "common-utils": "^1.1.0"
4. Обновить enterprise → package.json: "common-utils": "^1.1.0"
= 4 коммита в разных репозиториях
```

**Монорепо (просто):**
```typescript
// Один коммит меняет всё сразу
// packages/common/src/logger.ts
export class Logger {
  // Новый метод
  debug(message: string, meta?: any) { ... }
}

// packages/leonardo-ai/src/rl-engine.ts
import { Logger } from '@info7/common';
const logger = new Logger();
logger.debug('New feature!'); // ✅ Сразу доступно

// = 1 коммит в монорепо
```

#### 3. **Единые Стандарты Кода**

```json
// Один tsconfig.json для всех
{
  "compilerOptions": {
    "strict": true,
    "experimentalDecorators": true
  }
}
```

Все пакеты автоматически используют одинаковые настройки:
- TypeScript конфигурация
- ESLint правила
- Prettier форматирование
- Тестовые фреймворки

#### 4. **Кросс-пакетная Рефакторинг**

**Пример:** Переименование функции

```typescript
// IDE может рефакторить через все пакеты одновременно
// packages/common/src/errors.ts
export class AppError extends Error { } // Было: CustomError

// packages/leonardo-ai/src/engine.ts
throw new AppError(...) // Автоматически обновлено

// packages/openclaw-meta-agents/src/coordinator.ts
throw new AppError(...) // Автоматически обновлено
```

#### 5. **Упрощенная CI/CD**

```yaml
# .github/workflows/ci.yml
- name: Install
  run: npm install  # Одна команда

- name: Build
  run: npm run build  # Собирает все пакеты

- name: Test
  run: npm test  # Тестирует все пакеты
```

#### 6. **Лучшая Видимость Кода**

Разработчик видит весь код сразу:
```bash
# Поиск по всему проекту
grep -r "LeonardoRLEngine" packages/
# ✅ Находит использование во всех пакетах
```

### ❌ Минусы Монорепо

#### 1. **Размер Репозитория**

**Проблема:**
```bash
git clone https://github.com/user/info7.git
# Скачивает ВСЕ пакеты, даже если нужен только один
```

**Решение:**
```bash
# Partial clone (Git 2.19+)
git clone --filter=blob:none --sparse https://github.com/user/info7.git
cd info7
git sparse-checkout set packages/leonardo-ai
```

#### 2. **CI/CD Время Сборки**

**Проблема:**
```bash
# Изменение в packages/common/README.md
# Запускает тесты ВСЕХ пакетов (10+ минут)
```

**Решение - Smart CI:**
```yaml
# .github/workflows/ci.yml
- name: Detect changes
  id: changes
  run: |
    if git diff --name-only ${{ github.event.before }} ${{ github.sha }} | grep "packages/common/src"; then
      echo "::set-output name=common::true"
    fi

- name: Test Common
  if: steps.changes.outputs.common == 'true'
  run: npm run test:common
```

#### 3. **Права Доступа**

**Проблема:**
```
Нельзя дать разным командам доступ к разным пакетам.
Весь репозиторий = одинаковые права для всех.
```

**Решение:**
- GitHub CODEOWNERS файл
- Branch protection rules
- Pull request reviews

```
# CODEOWNERS
/packages/common/ @core-team
/packages/leonardo-ai/ @ai-team
/packages/enterprise/ @enterprise-team
```

#### 4. **Версионирование**

**Проблема:**
```
Все пакеты в одном коммите.
Как версионировать отдельные пакеты?
```

**Решение - Independent Versioning:**
```json
// packages/common/package.json
{ "version": "1.0.0" }

// packages/leonardo-ai/package.json
{ "version": "2.1.5" }

// Используем: changesets, lerna, или turborepo
```

### 📊 Сравнение

| Характеристика | Монорепо | Мультирепо |
|---|---|---|
| **Dependency Management** | ✅ Единое | ❌ Фрагментированное |
| **Atomic Changes** | ✅ Да | ❌ Сложно |
| **Code Sharing** | ✅ Легко | ⚠️ Через npm |
| **Build Time** | ⚠️ Медленнее | ✅ Быстрее |
| **Repository Size** | ❌ Большой | ✅ Маленький |
| **Access Control** | ❌ Сложно | ✅ Гранулярно |
| **Tooling** | ✅ Единое | ❌ Дублирование |
| **Refactoring** | ✅ Легко | ❌ Сложно |

### 🎯 Когда Использовать Монорепо?

**✅ Используйте монорепо если:**
- Пакеты тесно связаны (как в info7)
- Одна команда разработки
- Нужна синхронизация версий
- Частые изменения API между пакетами

**❌ Избегайте монорепо если:**
- Полностью независимые проекты
- Разные команды с разными правами
- Огромный размер (100+ пакетов, GB кода)
- Редкие изменения зависимостей

### 💡 Info7 - Идеальный Кейс для Монорепо

```
✅ Все пакеты используют @info7/common
✅ Единая архитектура (RL + Meta-Agents + Enterprise)
✅ Одна команда разработки
✅ Частые обновления API
✅ Общие TypeScript/ESLint настройки
```

---

## 2. Расширяемость Системы

### Как Добавлять Новые Компоненты

#### 2.1 Добавление Новых Агентов (Skills)

**Структура агента:**

```typescript
// packages/openclaw-meta-agents/src/agents/custom-agent.ts
import { BaseAgent } from '../core/base-agent';
import { Task, TaskResult } from '../types';
import { Logger, MetricsCollector } from '@info7/common';

export class CustomAgent extends BaseAgent {
  private logger: Logger;
  private metrics: MetricsCollector;

  constructor() {
    super({
      id: 'custom-agent-001',
      name: 'Custom Agent',
      capabilities: ['custom-task-1', 'custom-task-2'],
      description: 'Handles custom domain tasks',
    });

    this.logger = new Logger({ context: { agent: 'custom' } });
    this.metrics = new MetricsCollector();
  }

  async execute(task: Task): Promise<TaskResult> {
    this.logger.info('Executing custom task', { taskId: task.id });

    const timer = this.metrics.timer('custom.task.duration');

    try {
      const result = await timer.time(async () => {
        // Ваша логика
        return { data: 'Custom result' };
      });

      return {
        success: true,
        taskId: task.id,
        result,
        duration: Date.now() - task.createdAt,
      };
    } catch (error) {
      this.logger.error('Custom task failed', error);
      throw error;
    }
  }

  async validate(task: Task): Promise<boolean> {
    return this.capabilities.includes(task.type);
  }
}
```

**Регистрация агента:**

```typescript
// packages/openclaw-meta-agents/src/agents/index.ts
export * from './legal-agent';
export * from './medical-agent';
export * from './finance-agent';
export * from './custom-agent'; // ← Новый агент

// packages/openclaw-meta-agents/src/coordinator/meta-agent-coordinator.ts
import { CustomAgent } from '../agents/custom-agent';

export class MetaAgentCoordinator {
  private agents: Map<string, BaseAgent>;

  constructor() {
    this.agents = new Map([
      ['legal', new LegalAgent()],
      ['medical', new MedicalAgent()],
      ['finance', new FinanceAgent()],
      ['custom', new CustomAgent()], // ← Регистрация
    ]);
  }
}
```

#### 2.2 Добавление Новых Моделей AI

**Пример: Добавление новой embedding модели**

```typescript
// packages/leonardo-ai/src/rag/embeddings/custom-embedder.ts
import { EmbeddingService, EmbeddingResult } from '../types';
import { Logger } from '@info7/common';

export class CustomEmbedder implements EmbeddingService {
  private logger: Logger;
  private apiKey: string;

  constructor(config: { apiKey: string }) {
    this.logger = new Logger({ context: { service: 'custom-embedder' } });
    this.apiKey = config.apiKey;
  }

  async embed(text: string): Promise<EmbeddingResult> {
    this.logger.debug('Generating embedding', { textLength: text.length });

    // Вызов вашей модели
    const response = await fetch('https://api.custom-ai.com/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    return {
      vector: data.embedding,
      dimensions: data.embedding.length,
      model: 'custom-model-v1',
    };
  }

  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    return Promise.all(texts.map(text => this.embed(text)));
  }
}
```

**Использование:**

```typescript
// packages/leonardo-ai/src/rag/rag-engine.ts
import { CustomEmbedder } from './embeddings/custom-embedder';

const ragEngine = new RAGEngine({
  embeddingService: new CustomEmbedder({
    apiKey: process.env.CUSTOM_AI_API_KEY,
  }),
  // ... остальная конфигурация
});
```

#### 2.3 Добавление Экспертных Систем

**Создание нового домена экспертизы:**

```typescript
// packages/openclaw-meta-agents/src/experts/tax-expert.ts
import { Logger } from '@info7/common';

export interface TaxRule {
  id: string;
  jurisdiction: string;
  category: string;
  rule: (data: any) => boolean;
  recommendation: string;
}

export class TaxExpert {
  private logger: Logger;
  private rules: Map<string, TaxRule>;

  constructor() {
    this.logger = new Logger({ context: { expert: 'tax' } });
    this.rules = new Map();
    this.loadRules();
  }

  private loadRules(): void {
    // Правила из базы знаний
    this.addRule({
      id: 'vat-eu-001',
      jurisdiction: 'EU',
      category: 'VAT',
      rule: (data) => data.country === 'EU' && data.revenue > 10000,
      recommendation: 'VAT registration required',
    });
  }

  addRule(rule: TaxRule): void {
    this.rules.set(rule.id, rule);
    this.logger.info('Tax rule added', { ruleId: rule.id });
  }

  evaluate(data: any): string[] {
    const recommendations: string[] = [];

    for (const [id, rule] of this.rules) {
      if (rule.rule(data)) {
        recommendations.push(rule.recommendation);
        this.logger.info('Tax rule matched', { ruleId: id });
      }
    }

    return recommendations;
  }
}
```

**Интеграция в агента:**

```typescript
// packages/openclaw-meta-agents/src/agents/finance-agent.ts
import { TaxExpert } from '../experts/tax-expert';

export class FinanceAgent extends BaseAgent {
  private taxExpert: TaxExpert;

  constructor() {
    super({ /* ... */ });
    this.taxExpert = new TaxExpert();
  }

  async execute(task: Task): Promise<TaskResult> {
    if (task.type === 'tax-analysis') {
      const recommendations = this.taxExpert.evaluate(task.data);
      return {
        success: true,
        result: { recommendations },
        // ...
      };
    }
    // ...
  }
}
```

#### 2.4 Plugin System (Расширяемая Архитектура)

**Создание plugin системы:**

```typescript
// packages/common/src/plugins/plugin-manager.ts
import { Logger } from '../logging/logger';

export interface Plugin {
  name: string;
  version: string;
  init(): Promise<void>;
  execute(context: any): Promise<any>;
  cleanup(): Promise<void>;
}

export class PluginManager {
  private plugins: Map<string, Plugin>;
  private logger: Logger;

  constructor() {
    this.plugins = new Map();
    this.logger = new Logger({ context: { service: 'plugin-manager' } });
  }

  async register(plugin: Plugin): Promise<void> {
    this.logger.info('Registering plugin', { name: plugin.name });

    await plugin.init();
    this.plugins.set(plugin.name, plugin);

    this.logger.info('Plugin registered', { name: plugin.name });
  }

  async execute(pluginName: string, context: any): Promise<any> {
    const plugin = this.plugins.get(pluginName);

    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    return await plugin.execute(context);
  }

  async unregister(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);

    if (plugin) {
      await plugin.cleanup();
      this.plugins.delete(pluginName);
      this.logger.info('Plugin unregistered', { name: pluginName });
    }
  }
}
```

**Пример plugin:**

```typescript
// plugins/sentiment-analysis-plugin.ts
import { Plugin } from '@info7/common';

export class SentimentAnalysisPlugin implements Plugin {
  name = 'sentiment-analysis';
  version = '1.0.0';

  async init(): Promise<void> {
    // Загрузка модели
    console.log('Loading sentiment model...');
  }

  async execute(context: { text: string }): Promise<any> {
    // Анализ тональности
    const sentiment = this.analyzeSentiment(context.text);
    return { sentiment };
  }

  async cleanup(): Promise<void> {
    // Очистка ресурсов
    console.log('Cleaning up sentiment model...');
  }

  private analyzeSentiment(text: string) {
    // Логика анализа
    return { score: 0.75, label: 'positive' };
  }
}
```

---

## 3. Импорт/Экспорт Данных

### 3.1 Импорт Данных в RAG Knowledge Base

**Загрузка документов:**

```typescript
// packages/leonardo-ai/src/rag/import/document-importer.ts
import { RAGEngine } from '../rag-engine';
import { Document } from '../types';
import { Logger } from '@info7/common';
import * as fs from 'fs';
import * as path from 'path';

export class DocumentImporter {
  private ragEngine: RAGEngine;
  private logger: Logger;

  constructor(ragEngine: RAGEngine) {
    this.ragEngine = ragEngine;
    this.logger = new Logger({ context: { service: 'document-importer' } });
  }

  /**
   * Импорт из файла
   */
  async importFromFile(filePath: string): Promise<void> {
    this.logger.info('Importing from file', { filePath });

    const content = fs.readFileSync(filePath, 'utf-8');
    const extension = path.extname(filePath);

    const document: Document = {
      id: path.basename(filePath, extension),
      content,
      metadata: {
        source: filePath,
        type: extension.slice(1),
        importedAt: Date.now(),
      },
    };

    await this.ragEngine.addDocument(document);
    this.logger.info('Document imported', { documentId: document.id });
  }

  /**
   * Импорт из директории
   */
  async importFromDirectory(dirPath: string): Promise<void> {
    this.logger.info('Importing from directory', { dirPath });

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile() && this.isSupportedFile(file)) {
        await this.importFromFile(filePath);
      }
    }
  }

  /**
   * Импорт из JSON
   */
  async importFromJSON(jsonPath: string): Promise<void> {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    if (Array.isArray(data.documents)) {
      for (const doc of data.documents) {
        await this.ragEngine.addDocument(doc);
      }
    }
  }

  /**
   * Импорт из API
   */
  async importFromAPI(apiUrl: string): Promise<void> {
    const response = await fetch(apiUrl);
    const data = await response.json();

    for (const item of data.items) {
      const document: Document = {
        id: item.id,
        content: item.content,
        metadata: {
          source: 'api',
          apiUrl,
          ...item.metadata,
        },
      };

      await this.ragEngine.addDocument(document);
    }
  }

  /**
   * Импорт из базы данных
   */
  async importFromDatabase(
    connectionString: string,
    query: string
  ): Promise<void> {
    // Подключение к БД (например, PostgreSQL)
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString });

    const result = await pool.query(query);

    for (const row of result.rows) {
      const document: Document = {
        id: row.id,
        content: row.content,
        metadata: {
          source: 'database',
          ...row,
        },
      };

      await this.ragEngine.addDocument(document);
    }

    await pool.end();
  }

  private isSupportedFile(filename: string): boolean {
    const supported = ['.txt', '.md', '.json', '.csv'];
    return supported.some(ext => filename.endsWith(ext));
  }
}
```

**Использование:**

```typescript
import { DocumentImporter } from './import/document-importer';

const importer = new DocumentImporter(ragEngine);

// Из файла
await importer.importFromFile('./data/document.txt');

// Из директории
await importer.importFromDirectory('./data/documents/');

// Из JSON
await importer.importFromJSON('./data/knowledge-base.json');

// Из API
await importer.importFromAPI('https://api.example.com/documents');

// Из БД
await importer.importFromDatabase(
  'postgresql://user:pass@localhost/db',
  'SELECT id, content FROM documents'
);
```

### 3.2 Экспорт Данных и Результатов

**Экспортер результатов:**

```typescript
// packages/common/src/export/result-exporter.ts
import { Logger } from '../logging/logger';
import * as fs from 'fs';
import * as path from 'path';

export interface ExportOptions {
  format: 'json' | 'csv' | 'xml' | 'pdf';
  destination: string;
  includeMetadata?: boolean;
}

export class ResultExporter {
  private logger: Logger;

  constructor() {
    this.logger = new Logger({ context: { service: 'exporter' } });
  }

  /**
   * Экспорт в JSON
   */
  async exportToJSON(data: any, filePath: string): Promise<void> {
    this.logger.info('Exporting to JSON', { filePath });

    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, json, 'utf-8');

    this.logger.info('Export completed', { filePath });
  }

  /**
   * Экспорт в CSV
   */
  async exportToCSV(data: any[], filePath: string): Promise<void> {
    this.logger.info('Exporting to CSV', { filePath });

    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const rows = data.map(item =>
      headers.map(h => JSON.stringify(item[h] ?? '')).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    fs.writeFileSync(filePath, csv, 'utf-8');

    this.logger.info('Export completed', { filePath });
  }

  /**
   * Экспорт метрик
   */
  async exportMetrics(metrics: any[], options: ExportOptions): Promise<void> {
    switch (options.format) {
      case 'json':
        await this.exportToJSON(metrics, options.destination);
        break;
      case 'csv':
        await this.exportToCSV(metrics, options.destination);
        break;
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Экспорт в базу данных
   */
  async exportToDatabase(
    data: any[],
    connectionString: string,
    tableName: string
  ): Promise<void> {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString });

    for (const item of data) {
      const columns = Object.keys(item).join(', ');
      const values = Object.values(item);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      await pool.query(
        `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
        values
      );
    }

    await pool.end();
  }

  /**
   * Экспорт через API
   */
  async exportToAPI(data: any, apiUrl: string, apiKey: string): Promise<void> {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    this.logger.info('Data exported to API', { apiUrl });
  }
}
```

**Использование:**

```typescript
import { ResultExporter } from '@info7/common';

const exporter = new ResultExporter();

// Экспорт результатов в JSON
const results = await leonardoAI.query('contract analysis');
await exporter.exportToJSON(results, './output/results.json');

// Экспорт метрик в CSV
const metrics = metricsCollector.export();
await exporter.exportToCSV(metrics, './output/metrics.csv');

// Экспорт в БД
await exporter.exportToDatabase(
  results,
  'postgresql://user:pass@localhost/db',
  'ai_results'
);

// Экспорт через API
await exporter.exportToAPI(
  results,
  'https://api.client.com/results',
  process.env.CLIENT_API_KEY
);
```

### 3.3 Интеграция с Внешними Источниками

**Webhook система для получения данных:**

```typescript
// packages/common/src/webhooks/webhook-receiver.ts
import express from 'express';
import { Logger } from '../logging/logger';

export class WebhookReceiver {
  private app: express.Application;
  private logger: Logger;
  private handlers: Map<string, (data: any) => Promise<void>>;

  constructor(port: number = 3001) {
    this.app = express();
    this.logger = new Logger({ context: { service: 'webhook' } });
    this.handlers = new Map();

    this.app.use(express.json());
    this.setupRoutes();
    this.app.listen(port);

    this.logger.info('Webhook receiver started', { port });
  }

  private setupRoutes(): void {
    this.app.post('/webhook/:eventType', async (req, res) => {
      const { eventType } = req.params;
      const handler = this.handlers.get(eventType);

      if (!handler) {
        return res.status(404).json({ error: 'Event type not found' });
      }

      try {
        await handler(req.body);
        res.json({ success: true });
      } catch (error) {
        this.logger.error('Webhook handler failed', error);
        res.status(500).json({ error: 'Handler failed' });
      }
    });
  }

  registerHandler(
    eventType: string,
    handler: (data: any) => Promise<void>
  ): void {
    this.handlers.set(eventType, handler);
    this.logger.info('Webhook handler registered', { eventType });
  }
}
```

---

## 4. Модульная Архитектура

### Можно ли Разделить Систему на Части?

**✅ Да! Система уже модульная.**

### 4.1 Текущая Модульность

```
info7/
├── @info7/common               ← Модуль 1: Независимый
├── @info7/leonardo-ai          ← Модуль 2: Зависит от common
├── @info7/openclaw-meta-agents ← Модуль 3: Зависит от common
└── @info7/orchestrator-kit-enterprise ← Модуль 4: Зависит от common
```

**Каждый пакет может работать отдельно:**

```typescript
// Использование только Leonardo AI
import { LeonardoRLEngine, RAGEngine } from '@info7/leonardo-ai';
import { Logger } from '@info7/common';

const rlEngine = new LeonardoRLEngine({...});
const ragEngine = new RAGEngine({...});
// Работает БЕЗ openclaw и enterprise

// Использование только OpenClaw
import { MetaAgentCoordinator } from '@info7/openclaw-meta-agents';
import { Logger } from '@info7/common';

const coordinator = new MetaAgentCoordinator();
// Работает БЕЗ leonardo и enterprise
```

### 4.2 Микросервисная Архитектура

**Можно развернуть каждый модуль как отдельный сервис:**

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Leonardo AI    │      │  OpenClaw       │      │  Enterprise     │
│  Service        │      │  Service        │      │  Service        │
│  Port: 3000     │      │  Port: 3001     │      │  Port: 3002     │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         └────────────────────────┴────────────────────────┘
                                  │
                         ┌────────┴────────┐
                         │  API Gateway    │
                         │  Port: 8080     │
                         └─────────────────┘
```

**Пример микросервиса:**

```typescript
// services/leonardo-ai-service/server.ts
import express from 'express';
import { LeonardoRLEngine, RAGEngine } from '@info7/leonardo-ai';
import { Logger, HealthCheckManager } from '@info7/common';

const app = express();
const logger = new Logger({ context: { service: 'leonardo-api' } });
const health = new HealthCheckManager({ version: '1.0.0' });

const rlEngine = new LeonardoRLEngine({...});
const ragEngine = new RAGEngine({...});

app.use(express.json());

// Эндпоинт для RL
app.post('/api/rl/action', async (req, res) => {
  try {
    const action = await rlEngine.selectAction(req.body.state);
    res.json({ action });
  } catch (error) {
    logger.error('RL action failed', error);
    res.status(500).json({ error: 'Action selection failed' });
  }
});

// Эндпоинт для RAG
app.post('/api/rag/query', async (req, res) => {
  try {
    const results = await ragEngine.query(req.body.query, req.body.topK);
    res.json({ results });
  } catch (error) {
    logger.error('RAG query failed', error);
    res.status(500).json({ error: 'Query failed' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  const healthStatus = await health.check();
  res.json(healthStatus);
});

app.listen(3000, () => {
  logger.info('Leonardo AI service started', { port: 3000 });
});
```

**Docker Compose для микросервисов:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  leonardo-ai:
    build: ./services/leonardo-ai-service
    ports:
      - "3000:3000"
    environment:
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}

  openclaw:
    build: ./services/openclaw-service
    ports:
      - "3001:3001"

  enterprise:
    build: ./services/enterprise-service
    ports:
      - "3002:3002"
    environment:
      - JWT_SECRET=${JWT_SECRET}

  api-gateway:
    build: ./services/api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - leonardo-ai
      - openclaw
      - enterprise
```

---

## 5. Коммуникация с Внешними Системами

### 5.1 REST API

**Самый распространённый протокол:**

```typescript
// packages/common/src/api/rest-server.ts
import express, { Express } from 'express';
import { Logger } from '../logging/logger';

export class RESTServer {
  private app: Express;
  private logger: Logger;

  constructor(port: number = 3000) {
    this.app = express();
    this.logger = new Logger({ context: { service: 'rest-api' } });

    this.app.use(express.json());
    this.setupMiddleware();
    this.app.listen(port);

    this.logger.info('REST API started', { port });
  }

  private setupMiddleware(): void {
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });

    // Logging
    this.app.use((req, res, next) => {
      this.logger.info('Request received', {
        method: req.method,
        path: req.path,
      });
      next();
    });
  }

  registerRoute(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    handler: (req: any, res: any) => Promise<void>
  ): void {
    this.app[method](path, async (req, res) => {
      try {
        await handler(req, res);
      } catch (error) {
        this.logger.error('Route handler failed', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  getApp(): Express {
    return this.app;
  }
}
```

**Использование:**

```typescript
import { RESTServer } from '@info7/common';
import { LeonardoRLEngine } from '@info7/leonardo-ai';

const server = new RESTServer(3000);
const rlEngine = new LeonardoRLEngine({...});

// POST /api/actions
server.registerRoute('post', '/api/actions', async (req, res) => {
  const action = await rlEngine.selectAction(req.body.state);
  res.json({ action });
});

// GET /api/stats
server.registerRoute('get', '/api/stats', async (req, res) => {
  const stats = rlEngine.getStatistics();
  res.json({ stats });
});
```

### 5.2 GraphQL API

**Более гибкий протокол для сложных запросов:**

```typescript
// packages/common/src/api/graphql-server.ts
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Logger } from '../logging/logger';

export class GraphQLServer {
  private server: ApolloServer;
  private logger: Logger;

  constructor(
    typeDefs: string,
    resolvers: any,
    port: number = 4000
  ) {
    this.logger = new Logger({ context: { service: 'graphql-api' } });

    this.server = new ApolloServer({
      typeDefs,
      resolvers,
    });
  }

  async start(port: number = 4000): Promise<void> {
    const { url } = await startStandaloneServer(this.server, {
      listen: { port },
    });

    this.logger.info('GraphQL server started', { url });
  }
}
```

**Схема и резолверы:**

```typescript
// services/api/schema.ts
const typeDefs = `
  type Query {
    selectAction(state: StateInput!): Action
    queryRAG(query: String!, topK: Int): [RAGResult!]!
    getTasks(status: TaskStatus): [Task!]!
  }

  type Mutation {
    learn(
      state: StateInput!
      action: ActionInput!
      reward: Float!
      nextState: StateInput!
      done: Boolean!
    ): Boolean

    addDocument(document: DocumentInput!): Document
    createTask(input: TaskInput!): Task
  }

  input StateInput {
    task: String!
    complexity: Float!
  }

  type Action {
    type: String!
    confidence: Float!
  }

  type RAGResult {
    content: String!
    score: Float!
    metadata: JSON
  }
`;

const resolvers = {
  Query: {
    selectAction: async (_, { state }, { rlEngine }) => {
      return await rlEngine.selectAction(state);
    },
    queryRAG: async (_, { query, topK }, { ragEngine }) => {
      return await ragEngine.query(query, topK || 5);
    },
    getTasks: async (_, { status }, { taskManager }) => {
      return taskManager.getTasksByStatus(status);
    },
  },
  Mutation: {
    learn: async (_, args, { rlEngine }) => {
      await rlEngine.learn(
        args.state,
        args.action,
        args.reward,
        args.nextState,
        args.done
      );
      return true;
    },
    addDocument: async (_, { document }, { ragEngine }) => {
      await ragEngine.addDocument(document);
      return document;
    },
  },
};
```

### 5.3 gRPC (High Performance)

**Для высокопроизводительной коммуникации между сервисами:**

```protobuf
// proto/leonardo.proto
syntax = "proto3";

package leonardo;

service LeonardoAI {
  rpc SelectAction (StateRequest) returns (ActionResponse);
  rpc Learn (LearnRequest) returns (LearnResponse);
  rpc QueryRAG (RAGQueryRequest) returns (RAGQueryResponse);
}

message StateRequest {
  string task = 1;
  float complexity = 2;
  map<string, string> metadata = 3;
}

message ActionResponse {
  string type = 1;
  float confidence = 2;
}

message LearnRequest {
  StateRequest state = 1;
  ActionResponse action = 2;
  float reward = 3;
  StateRequest next_state = 4;
  bool done = 5;
}

message LearnResponse {
  bool success = 1;
}
```

### 5.4 WebSocket (Real-time)

**Для real-time обновлений:**

```typescript
// packages/common/src/api/websocket-server.ts
import WebSocket from 'ws';
import { Logger } from '../logging/logger';

export class WebSocketServer {
  private wss: WebSocket.Server;
  private logger: Logger;
  private clients: Set<WebSocket>;

  constructor(port: number = 8080) {
    this.wss = new WebSocket.Server({ port });
    this.logger = new Logger({ context: { service: 'websocket' } });
    this.clients = new Set();

    this.setupHandlers();
    this.logger.info('WebSocket server started', { port });
  }

  private setupHandlers(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      this.logger.info('Client connected', { total: this.clients.size });

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleMessage(ws, data);
        } catch (error) {
          this.logger.error('Message handling failed', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        this.logger.info('Client disconnected', { total: this.clients.size });
      });
    });
  }

  private async handleMessage(ws: WebSocket, data: any): Promise<void> {
    // Обработка сообщения
    const response = { type: 'response', data: 'Processed' };
    ws.send(JSON.stringify(response));
  }

  broadcast(message: any): void {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}
```

### 5.5 Message Queue (Асинхронная Коммуникация)

**RabbitMQ / BullMQ для асинхронных задач:**

```typescript
// packages/common/src/queue/message-queue.ts
import { Queue, Worker } from 'bullmq';
import { Logger } from '../logging/logger';

export class MessageQueue {
  private queue: Queue;
  private logger: Logger;

  constructor(queueName: string, redisConfig: any) {
    this.queue = new Queue(queueName, { connection: redisConfig });
    this.logger = new Logger({ context: { queue: queueName } });
  }

  async addJob(name: string, data: any, options?: any): Promise<void> {
    await this.queue.add(name, data, options);
    this.logger.info('Job added', { name });
  }

  createWorker(
    processor: (job: any) => Promise<any>
  ): Worker {
    return new Worker(
      this.queue.name,
      async (job) => {
        this.logger.info('Processing job', { id: job.id, name: job.name });
        return await processor(job);
      },
      { connection: this.queue.opts.connection }
    );
  }
}
```

**Использование:**

```typescript
import { MessageQueue } from '@info7/common';

const queue = new MessageQueue('leonardo-tasks', {
  host: 'localhost',
  port: 6379,
});

// Добавление задачи
await queue.addJob('rl-training', {
  state: {...},
  action: {...},
  reward: 0.85,
});

// Обработка задач
queue.createWorker(async (job) => {
  if (job.name === 'rl-training') {
    await rlEngine.learn(
      job.data.state,
      job.data.action,
      job.data.reward,
      job.data.nextState,
      false
    );
  }
});
```

### 5.6 Сводная Таблица Протоколов

| Протокол | Использование | Преимущества | Недостатки |
|---|---|---|---|
| **REST** | Web API, CRUD операции | Простота, HTTP стандарт | Overfetching, Underfetching |
| **GraphQL** | Гибкие запросы данных | Точные запросы, Type safety | Сложность кеширования |
| **gRPC** | Микросервисы, High perf | Производительность, Streaming | Сложность отладки |
| **WebSocket** | Real-time updates | Двусторонний канал | Сложность масштабирования |
| **Message Queue** | Async tasks, Events | Decoupling, Reliability | Задержки |

---

## 📚 Заключение

### Ключевые Возможности info7

✅ **Монорепо** - единая кодовая база с модульной структурой
✅ **Расширяемость** - plugin system, новые агенты, модели
✅ **Импорт/Экспорт** - файлы, API, БД, webhooks
✅ **Модульность** - каждый пакет работает независимо
✅ **Коммуникация** - REST, GraphQL, gRPC, WebSocket, Message Queues

### Следующие Шаги

1. Выбрать архитектуру развёртывания (монолит vs микросервисы)
2. Настроить API layer (REST/GraphQL)
3. Добавить message queue для async задач
4. Интегрировать с внешними системами

---

**Вопросы?** Готов детализировать любой раздел!

https://claude.ai/code/session_01WnQdgU1MrECnhh3xfVNRAg
