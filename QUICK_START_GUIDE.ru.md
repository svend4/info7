# Платформа Info7 - Краткое руководство

**[🇬🇧 English Version](QUICK_START_GUIDE.md)** | **[📖 Детальное руководство по импорту/экспорту](IMPORT_EXPORT_GUIDE.ru.md)**

⏱️ **Время чтения**: 5-10 минут
📦 **Версия**: 1.0.0
🎯 **Уровень**: От начинающего до среднего

---

## 🚀 Что такое платформа Info7?

Info7 - это **production-ready AI платформа** из 4 интегрированных пакетов:

```
┌─────────────────────────────────────────┐
│         Платформа Info7                 │
├─────────────────────────────────────────┤
│ Leonardo AI       │  Info7 Knowledge    │
│ (Рассуждение)     │  (Хранилище)        │
├─────────────────────────────────────────┤
│ Orchestrator Kit  │  OpenClaw           │
│ (Сервисы)         │  (Иерархия)         │
└─────────────────────────────────────────┘
```

**Ключевые возможности**:
- 🤖 **11 профессиональных AI агентов** в 8 областях
- 🧠 **Самообучающийся AI** с Meta-Learning и RL
- 📚 **Семантический граф знаний** с автообновлением
- ⚡ **Иерархическая оркестрация задач** (5 уровней)

---

## ⚡ Установка (3 минуты)

### Требования
- Node.js 18+ или Python 3.10+
- npm/yarn или pip
- Git

### Быстрая установка

```bash
# Клонирование репозитория
git clone https://github.com/svend4/info7.git
cd info7

# Установка зависимостей
npm install
# или
pip install -r requirements.txt

# Сборка всех пакетов
npm run build
# или
python setup.py build

# Проверка установки
npm test
```

---

## 🎯 Основные концепции (5 минут)

### 1. Агенты
**Профессиональные AI агенты** для конкретных областей:

```typescript
import { MedicalDiagnosisAssistant } from '@info7/orchestrator-kit-enterprise';

const agent = new MedicalDiagnosisAssistant();
const result = await agent.assessSymptoms([...symptoms], context);
```

**Доступные агенты**:
- 🏥 **Здравоохранение**: Медицинская диагностика, Психолог
- 💰 **Финансы**: Инвестиционный советник, Планировщик бюджета
- ⚖️ **Юриспруденция**: Договорный юрист, Иммиграционный специалист
- 📚 **Образование**: Карьерный консультант
- 🏠 **Дом**: Менеджер дома
- 👴 **Уход**: Уход за пожилыми
- 🤝 **Социальная сфера**: Калькулятор льгот
- 💪 **Здоровье**: Нутрициолог

### 2. Граф знаний
**Семантическое хранилище** для взаимосвязанных знаний:

```typescript
import { KnowledgeGraph } from '@info7/info7';

const kb = new KnowledgeGraph();

// Добавление знаний
await kb.addNode({
  type: 'concept',
  label: 'Машинное обучение',
  properties: { category: 'AI', difficulty: 'advanced' }
});

// Семантический поиск
const results = await kb.search('алгоритмы глубокого обучения', {
  semantic: true,
  limit: 10
});
```

### 3. Мета-обучение
**AI, который учится учиться**:

```typescript
import { MetaLearning, RLEngine } from '@info7/leonardo-ai';

const rl = new RLEngine();
const metaLearning = new MetaLearning(rl);

// AI выбирает лучшую стратегию
const strategy = await metaLearning.selectStrategy(task);
// → Выбирает: Standard RL, MAML, Few-Shot, Transfer, Exploration
```

### 4. Иерархическая оркестрация
**Многоуровневое делегирование задач**:

```typescript
import { MetaMetaAgent, TaskManager } from '@info7/openclaw-meta-agents';

const orchestrator = new MetaMetaAgent();

// Сложная задача автоматически разбивается
const result = await orchestrator.executeTask({
  description: 'Развернуть full-stack приложение',
  complexity: 'high'
});
// → Meta-Meta → Meta-Agents → Worker Agents
```

---

## 📖 Базовое использование (10 минут)

### Пример 1: Медицинская диагностика

```typescript
import { MedicalDiagnosisAssistant } from '@info7/orchestrator-kit-enterprise';

const doctor = new MedicalDiagnosisAssistant();

const assessment = await doctor.assessSymptoms([
  { name: 'fever', severity: 8, duration: '2 дня' },
  { name: 'cough', severity: 6, duration: '3 дня' }
], {
  age: 35,
  gender: 'female',
  medicalHistory: []
});

console.log(assessment.urgency);          // 'PROMPT'
console.log(assessment.possibleConditions); // [{ condition: 'грипп', likelihood: 0.7 }]
console.log(assessment.recommendations);   // Медицинские рекомендации
```

### Пример 2: Финансовое планирование

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

### Пример 3: Управление знаниями

```typescript
import { KnowledgeGraph, AutoUpdateSystem } from '@info7/info7';

const kb = new KnowledgeGraph();

// Добавление концепций
await kb.addNode({ type: 'concept', label: 'React' });
await kb.addNode({ type: 'concept', label: 'Next.js' });

// Создание связей
await kb.addEdge('Next.js', 'React', 'BUILT_ON');

// Автообновление из источников
const autoUpdate = new AutoUpdateSystem(kb);
await autoUpdate.addSource({
  type: 'github-repo',
  url: 'https://github.com/facebook/react',
  updateFrequency: 'daily'
});

// Семантический поиск
const results = await kb.search('серверный рендеринг');
```

### Пример 4: AI обучение и адаптация

```typescript
import { RLEngine, MetaLearning, ConsciousnessLayer } from '@info7/leonardo-ai';

const rl = new RLEngine({
  stateSize: 128,
  actionSize: 10,
  learningRate: 0.001
});

// Обучение на задаче
await rl.train({
  episodes: 1000,
  environment: customEnv
});

// Мета-обучение для выбора стратегии
const metaLearning = new MetaLearning(rl);
const strategy = await metaLearning.selectStrategy(newTask);

// Получение объяснений
const consciousness = new ConsciousnessLayer(rl);
const explanation = await consciousness.explainDecision(action, {
  style: 'step-by-step',
  depth: 'intermediate'
});
```

---

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env`:

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

### Базовый конфиг

Создайте `info7.config.js`:

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

## 📚 Частые операции

### Импорт данных

```typescript
// Импорт агентов
import { importAgent } from '@info7/orchestrator-kit-enterprise';
await importAgent('./my-custom-agent.json');

// Импорт знаний
import { KnowledgeGraph } from '@info7/info7';
const kb = new KnowledgeGraph();
await kb.importFromFile('./knowledge-base.json');

// Импорт RL моделей
import { RLEngine } from '@info7/leonardo-ai';
const rl = new RLEngine();
await rl.loadModel('./trained-model.h5');
```

### Экспорт данных

```typescript
// Экспорт агентов
import { exportAgent } from '@info7/orchestrator-kit-enterprise';
await exportAgent('MedicalDiagnosisAssistant', './export/');

// Экспорт знаний
const exported = await kb.exportToFile('./knowledge-export.json');

// Экспорт RL моделей
await rl.saveModel('./models/my-model.h5');
```

**📖 Подробное руководство по импорту/экспорту: [IMPORT_EXPORT_GUIDE.ru.md](IMPORT_EXPORT_GUIDE.ru.md)**

---

## 🎨 Продвинутые возможности

### Multi-Tenancy

```typescript
import { TenantManager, RBACManager } from '@info7/orchestrator-kit-enterprise';

const tenantManager = new TenantManager();
const rbac = new RBACManager();

// Создание тенанта
const tenant = await tenantManager.createTenant({
  name: 'Acme Corp',
  plan: 'enterprise',
  features: ['all-agents', 'audit-logging']
});

// Назначение ролей
await rbac.assignRole(userId, 'admin', tenant.id);
```

### Коллаборация агентов

```typescript
import { MetaMetaAgent } from '@info7/openclaw-meta-agents';

const orchestrator = new MetaMetaAgent();

// Агенты работают вместе
const result = await orchestrator.executeTask({
  description: 'Создать маркетинговую кампанию с анализом бюджета',
  requiresAgents: ['CareerCounselorAgent', 'BudgetPlannerAgent']
});
```

### Аналитика графа знаний

```typescript
const analytics = await kb.analyzeGraph();

console.log(analytics.centralNodes);    // Наиболее связанные узлы
console.log(analytics.communities);     // Обнаруженные сообщества
console.log(analytics.patterns);        // Найденные паттерны
```

---

## 🐛 Решение проблем

### Частые проблемы

**1. Ошибки импорта**
```bash
# Отсутствующие зависимости
npm install --save @info7/common @info7/leonardo-ai

# Проблемы с Python путями
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

**2. Проблемы с памятью**
```typescript
// Уменьшить batch size
const rl = new RLEngine({ batchSize: 16 }); // вместо 32

// Ограничить размер графа
const kb = new KnowledgeGraph({ maxNodes: 50000 });
```

**3. Лимиты API**
```typescript
// Добавить retry логику
const rag = new RAGEngine({
  vectorDb: 'pinecone',
  retryAttempts: 3,
  retryDelay: 1000 // ms
});
```

---

## 📖 Следующие шаги

1. **📘 Читайте детальное руководство**: [IMPORT_EXPORT_GUIDE.ru.md](IMPORT_EXPORT_GUIDE.ru.md)
2. **🎓 Изучите примеры**: директория `examples/`
3. **📚 API документация**: В каждом пакете есть `docs/API.md`
4. **🏗️ Архитектура**: [ARCHITECTURE.md](ARCHITECTURE.md)
5. **💡 Лучшие практики**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🆘 Получение помощи

- 📧 **Email**: [email protected]
- 💬 **Обсуждения**: [GitHub Discussions](https://github.com/svend4/info7/discussions)
- 🐛 **Проблемы**: [GitHub Issues](https://github.com/svend4/info7/issues)
- 📖 **Wiki**: [GitHub Wiki](https://github.com/svend4/info7/wiki)

---

## ⭐ Ключевые выводы

✅ **Info7 = 4 интегрированных пакета** (Leonardo AI, Info7 KB, Orchestrator Kit, OpenClaw)
✅ **11 профессиональных агентов** готовых к использованию
✅ **Самообучающийся AI** с мета-обучением
✅ **Семантическое управление знаниями**
✅ **Production-ready** с 31,000+ строками кода

**Начните строить с Info7 уже сегодня!** 🚀

---

**© 2026 Info7 Project | MIT License**
