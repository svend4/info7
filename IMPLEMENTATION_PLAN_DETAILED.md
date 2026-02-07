# Детальный план реализации info7 → Leonardo AI

**Версия:** 2.0.0-alpha
**Дата:** 2026-02-06
**Статус:** Активная разработка
**Приоритет:** 🔴 Критический

---

## 📋 Содержание

1. [Фаза 1: Инфраструктура (Простое)](#фаза-1-инфраструктура-простое)
2. [Фаза 2: Первые агенты (Среднее)](#фаза-2-первые-агенты-среднее)
3. [Фаза 3: Leonardo AI прототип (Сложное)](#фаза-3-leonardo-ai-прототип-сложное)
4. [Новые идеи и рационализации](#новые-идеи-и-рационализации)
5. [Все варианты реализации](#все-варианты-реализации)

---

## 🎯 Общая стратегия

### Принцип разработки
```
Простое → Среднее → Сложное
   ↓          ↓          ↓
  1-2        3-6       7-12
 недели     недель     недель
```

### Текущее состояние (2026-02-06)
- ✅ **info7 v1.3.0** - Documentation complete (213k words, 35 files)
- 📋 **Orchestrator Kit** - Ready for new agents
- 📋 **Leonardo AI** - Concept only (5% maturity)

### Цель Q1-Q2 2026
- 🎯 Реализовать 4 новых агента
- 🎯 Создать Leonardo AI прототип
- 🎯 Достичь 20% зрелости Leonardo AI

---

# Фаза 1: Инфраструктура (Простое)

**Сроки:** 1-2 недели (8-14 дней)
**Приоритет:** 🔴 Критический
**Сложность:** ⭐ Низкая

## Задача 1.1: Настройка проектной структуры

### Вариант А: Monorepo (Рекомендуется)

**Преимущества:**
- ✅ Единая кодовая база
- ✅ Простое управление зависимостями
- ✅ Атомарные коммиты для связанных изменений

**Структура:**
```
leonardo-ai/
├── packages/
│   ├── core/                    # Ядро Leonardo AI
│   │   ├── src/
│   │   │   ├── consciousness/   # Consciousness Layer
│   │   │   ├── cognitive/       # Cognitive Core
│   │   │   ├── action/          # Action Core
│   │   │   └── coordinator/     # Координатор
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── agents/                  # Новые агенты
│   │   ├── legal/
│   │   │   ├── social-law-specialist/
│   │   │   │   ├── src/
│   │   │   │   │   ├── agent.ts
│   │   │   │   │   ├── knowledge-base/
│   │   │   │   │   │   ├── laws/
│   │   │   │   │   │   │   ├── fz-178.ts      # ФЗ-178
│   │   │   │   │   │   │   ├── fz-181.ts      # ФЗ-181
│   │   │   │   │   │   │   ├── fz-400.ts      # ФЗ-400
│   │   │   │   │   │   │   └── index.ts
│   │   │   │   │   │   ├── rates/
│   │   │   │   │   │   │   ├── 2026.ts        # Актуальные ставки
│   │   │   │   │   │   │   └── index.ts
│   │   │   │   │   │   └── cases/
│   │   │   │   │   │       ├── maternity.ts   # Материнский капитал
│   │   │   │   │   │       ├── disability.ts  # Инвалидность
│   │   │   │   │   │       ├── pension.ts     # Пенсии
│   │   │   │   │   │       └── index.ts
│   │   │   │   │   ├── tools.ts
│   │   │   │   │   ├── prompts.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── tests/
│   │   │   │   │   ├── agent.test.ts
│   │   │   │   │   ├── knowledge-base.test.ts
│   │   │   │   │   └── integration.test.ts
│   │   │   │   └── package.json
│   │   │   │
│   │   │   └── labor-law-specialist/
│   │   │       └── ...
│   │   │
│   │   ├── social/
│   │   │   ├── case-manager/
│   │   │   └── social-worker/
│   │   │
│   │   ├── household/
│   │   │   └── household-manager/
│   │   │
│   │   └── care/
│   │       └── personal-caregiver/
│   │
│   ├── skills/                  # Навыки (Skills)
│   │   ├── legal/
│   │   │   └── benefits-calculator/
│   │   │       ├── src/
│   │   │       │   ├── skill.ts
│   │   │       │   ├── calculators/
│   │   │       │   │   ├── federal.ts
│   │   │       │   │   ├── regional.ts
│   │   │       │   │   ├── housing.ts
│   │   │       │   │   ├── tax.ts
│   │   │       │   │   └── index.ts
│   │   │       │   ├── validators/
│   │   │       │   │   ├── income.ts
│   │   │       │   │   ├── family.ts
│   │   │       │   │   └── index.ts
│   │   │       │   └── index.ts
│   │   │       ├── tests/
│   │   │       └── package.json
│   │   │
│   │   └── social/
│   │       └── ...
│   │
│   ├── commands/                # Slash-команды
│   │   └── legal/
│   │       ├── social-law.ts
│   │       └── labor-law.ts
│   │
│   └── shared/                  # Общие утилиты
│       ├── types/
│       ├── utils/
│       ├── validators/
│       └── constants/
│
├── apps/
│   ├── cli/                     # CLI приложение
│   └── api/                     # API сервер (опционально)
│
├── docs/                        # Документация
├── scripts/                     # Build scripts
├── .github/                     # CI/CD
├── package.json
├── tsconfig.json
├── turbo.json                   # Turborepo config
└── pnpm-workspace.yaml
```

### Вариант Б: Multi-repo

**Преимущества:**
- ✅ Независимое версионирование
- ✅ Меньшая когнитивная нагрузка

**Недостатки:**
- ❌ Сложнее управлять зависимостями
- ❌ Дублирование кода

**Не рекомендуется для начального этапа.**

---

## Задача 1.2: Инициализация проекта

### Шаг 1.2.1: Установка инструментов

```bash
# Устанавливаем pnpm (рекомендуется для monorepo)
npm install -g pnpm

# Создаем проект
mkdir leonardo-ai
cd leonardo-ai

# Инициализируем pnpm workspace
pnpm init
```

### Шаг 1.2.2: Создание корневого package.json

```json
{
  "name": "leonardo-ai-workspace",
  "version": "2.0.0-alpha.1",
  "private": true,
  "description": "Leonardo AI - Universal Genius AI Orchestration System",
  "license": "MIT",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.1",
    "@types/node": "^20.11.5",
    "turbo": "^1.11.3",
    "typescript": "^5.3.3",
    "vitest": "^1.2.0",
    "prettier": "^3.2.4",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.1"
}
```

### Шаг 1.2.3: Создание pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'packages/agents/**'
  - 'packages/skills/**'
  - 'apps/*'
```

### Шаг 1.2.4: Создание turbo.json (для быстрой сборки)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Шаг 1.2.5: Создание tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "incremental": true,
    "composite": true,
    "paths": {
      "@leonardo/core": ["./packages/core/src"],
      "@leonardo/agents/*": ["./packages/agents/*/src"],
      "@leonardo/skills/*": ["./packages/skills/*/src"],
      "@leonardo/shared/*": ["./packages/shared/*/src"]
    }
  },
  "include": ["packages/**/*.ts", "apps/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## Задача 1.3: Создание базовых типов

### packages/shared/types/src/index.ts

```typescript
/**
 * Leonardo AI - Базовые типы системы
 *
 * Этот файл содержит все основные типы, используемые во всей системе.
 */

// ============================================================================
// CORE TYPES - Базовые типы системы
// ============================================================================

/**
 * Уровень логирования
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Статус выполнения задачи
 */
export type TaskStatus =
  | 'pending'      // Ожидает выполнения
  | 'running'      // Выполняется
  | 'completed'    // Завершено успешно
  | 'failed'       // Завершено с ошибкой
  | 'cancelled';   // Отменено

/**
 * Приоритет задачи
 */
export type TaskPriority =
  | 'low'          // Низкий приоритет
  | 'normal'       // Нормальный приоритет
  | 'high'         // Высокий приоритет
  | 'critical';    // Критический приоритет

// ============================================================================
// LEONARDO AI - Режимы работы
// ============================================================================

/**
 * 5 операционных режимов Leonardo AI
 */
export type OperationalMode =
  | 'autonomous'   // 🤖 Полная автономия
  | 'assistant'    // 🤝 Помощник (human-in-the-loop)
  | 'collaborative'// 👥 Совместная работа
  | 'creative'     // 🎨 Творческий режим
  | 'learning';    // 📚 Обучающийся режим

/**
 * 3 стратегии выполнения задач
 */
export type ExecutionStrategy =
  | 'thinking-first'  // Сначала планирование, потом действие
  | 'action-first'    // Сначала действие, потом корректировка
  | 'iterative';      // Итеративный подход: прототип → обучение → улучшение

// ============================================================================
// AGENT TYPES - Типы агентов
// ============================================================================

/**
 * Категории профессиональных агентов
 */
export type AgentCategory =
  | 'legal'        // Юридические специалисты
  | 'social'       // Социальные работники
  | 'household'    // Домоправители
  | 'care'         // Сиделки и специалисты по уходу
  | 'development'  // Разработчики
  | 'database'     // Специалисты по БД
  | 'devops'       // DevOps инженеры
  | 'health';      // Здоровье и wellness

/**
 * Конфигурация агента
 */
export interface AgentConfig {
  /** Уникальный идентификатор агента */
  id: string;

  /** Имя агента */
  name: string;

  /** Категория агента */
  category: AgentCategory;

  /** Описание агента */
  description: string;

  /** Версия агента */
  version: string;

  /** Экспертиза агента */
  expertise: string[];

  /** Инструменты (tools), доступные агенту */
  tools: string[];

  /** Навыки (skills), которыми владеет агент */
  skills: string[];

  /** Команды (commands) для вызова агента */
  commands: string[];

  /** Системный промпт агента */
  systemPrompt: string;

  /** Температура генерации (0.0 - 1.0) */
  temperature: number;

  /** Максимальное количество токенов в ответе */
  maxTokens: number;

  /** Метаданные */
  metadata?: Record<string, unknown>;
}

/**
 * Контекст выполнения агента
 */
export interface AgentContext {
  /** Уникальный идентификатор сессии */
  sessionId: string;

  /** Идентификатор пользователя */
  userId: string;

  /** Режим работы */
  mode: OperationalMode;

  /** Стратегия выполнения */
  strategy: ExecutionStrategy;

  /** История сообщений */
  history: Message[];

  /** Текущие переменные контекста */
  variables: Record<string, unknown>;

  /** Timestamp начала сессии */
  startedAt: Date;

  /** Последняя активность */
  lastActivity: Date;
}

/**
 * Результат выполнения агента
 */
export interface AgentResult {
  /** Статус выполнения */
  status: TaskStatus;

  /** Результат выполнения */
  result?: unknown;

  /** Ошибка (если есть) */
  error?: Error;

  /** Метрики выполнения */
  metrics: {
    /** Время выполнения (мс) */
    executionTime: number;

    /** Использовано токенов */
    tokensUsed: number;

    /** Количество вызовов API */
    apiCalls: number;
  };

  /** Логи выполнения */
  logs: LogEntry[];
}

// ============================================================================
// SKILL TYPES - Типы навыков
// ============================================================================

/**
 * Конфигурация навыка (skill)
 */
export interface SkillConfig {
  /** Уникальный идентификатор навыка */
  id: string;

  /** Имя навыка */
  name: string;

  /** Описание навыка */
  description: string;

  /** Версия навыка */
  version: string;

  /** Входные параметры */
  inputs: ParameterDefinition[];

  /** Выходные параметры */
  outputs: ParameterDefinition[];

  /** Примеры использования */
  examples?: SkillExample[];

  /** Метаданные */
  metadata?: Record<string, unknown>;
}

/**
 * Определение параметра
 */
export interface ParameterDefinition {
  /** Имя параметра */
  name: string;

  /** Тип параметра */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';

  /** Описание параметра */
  description: string;

  /** Обязательный параметр */
  required: boolean;

  /** Значение по умолчанию */
  default?: unknown;

  /** Валидация (JSON Schema) */
  validation?: Record<string, unknown>;
}

/**
 * Пример использования навыка
 */
export interface SkillExample {
  /** Описание примера */
  description: string;

  /** Входные данные */
  input: Record<string, unknown>;

  /** Ожидаемый результат */
  output: unknown;
}

/**
 * Результат выполнения навыка
 */
export interface SkillResult<T = unknown> {
  /** Успешность выполнения */
  success: boolean;

  /** Данные результата */
  data?: T;

  /** Ошибка (если есть) */
  error?: {
    /** Код ошибки */
    code: string;

    /** Сообщение об ошибке */
    message: string;

    /** Детали ошибки */
    details?: Record<string, unknown>;
  };

  /** Метаданные результата */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// MESSAGE TYPES - Типы сообщений
// ============================================================================

/**
 * Роль отправителя сообщения
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * Сообщение в диалоге
 */
export interface Message {
  /** Уникальный идентификатор сообщения */
  id: string;

  /** Роль отправителя */
  role: MessageRole;

  /** Содержимое сообщения */
  content: string | MessageContent[];

  /** Имя агента/инструмента (опционально) */
  name?: string;

  /** Timestamp создания */
  timestamp: Date;

  /** Метаданные */
  metadata?: Record<string, unknown>;
}

/**
 * Контент сообщения (для multimodal)
 */
export type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'image'; imageUrl: string }
  | { type: 'tool_use'; toolUseId: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; toolUseId: string; content: string };

// ============================================================================
// TASK TYPES - Типы задач
// ============================================================================

/**
 * Задача для выполнения
 */
export interface Task {
  /** Уникальный идентификатор задачи */
  id: string;

  /** Название задачи */
  title: string;

  /** Описание задачи */
  description: string;

  /** Статус задачи */
  status: TaskStatus;

  /** Приоритет задачи */
  priority: TaskPriority;

  /** Идентификатор агента, выполняющего задачу */
  assignedTo?: string;

  /** Зависимости (IDs других задач) */
  dependencies: string[];

  /** Входные данные */
  input?: Record<string, unknown>;

  /** Результат выполнения */
  output?: unknown;

  /** Ошибка (если есть) */
  error?: Error;

  /** Timestamp создания */
  createdAt: Date;

  /** Timestamp начала выполнения */
  startedAt?: Date;

  /** Timestamp завершения */
  completedAt?: Date;

  /** Метаданные */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// KNOWLEDGE BASE TYPES - Типы базы знаний
// ============================================================================

/**
 * Документ в базе знаний
 */
export interface KnowledgeDocument {
  /** Уникальный идентификатор документа */
  id: string;

  /** Тип документа */
  type: 'law' | 'regulation' | 'case' | 'rate' | 'guide' | 'template';

  /** Заголовок документа */
  title: string;

  /** Содержимое документа */
  content: string;

  /** Категория */
  category: string;

  /** Теги для поиска */
  tags: string[];

  /** Дата вступления в силу */
  effectiveDate?: Date;

  /** Дата отмены (если отменен) */
  expiredDate?: Date;

  /** Источник */
  source?: {
    /** URL источника */
    url?: string;

    /** Автор */
    author?: string;

    /** Дата публикации */
    publishedAt?: Date;
  };

  /** Метаданные */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// LOG TYPES - Типы логирования
// ============================================================================

/**
 * Запись в логе
 */
export interface LogEntry {
  /** Уникальный идентификатор записи */
  id: string;

  /** Уровень логирования */
  level: LogLevel;

  /** Сообщение */
  message: string;

  /** Timestamp */
  timestamp: Date;

  /** Контекст */
  context?: {
    /** Идентификатор агента */
    agentId?: string;

    /** Идентификатор задачи */
    taskId?: string;

    /** Идентификатор пользователя */
    userId?: string;

    /** Дополнительные данные */
    extra?: Record<string, unknown>;
  };
}

// ============================================================================
// CONFIGURATION TYPES - Типы конфигурации
// ============================================================================

/**
 * Конфигурация Leonardo AI системы
 */
export interface LeonardoConfig {
  /** Режим работы по умолчанию */
  defaultMode: OperationalMode;

  /** Стратегия выполнения по умолчанию */
  defaultStrategy: ExecutionStrategy;

  /** Настройки Consciousness Layer */
  consciousness: {
    /** Включен ли Consciousness Layer */
    enabled: boolean;

    /** Уровень самосознания (0.0 - 1.0) */
    awarenessLevel: number;

    /** Интервал рефлексии (мс) */
    reflectionInterval: number;
  };

  /** Настройки Cognitive Core */
  cognitive: {
    /** Максимальная глубина планирования */
    maxPlanningDepth: number;

    /** Timeout планирования (мс) */
    planningTimeout: number;
  };

  /** Настройки Action Core */
  action: {
    /** Максимальное количество параллельных действий */
    maxParallelActions: number;

    /** Timeout действия (мс) */
    actionTimeout: number;
  };

  /** Настройки Claude API */
  claude: {
    /** API ключ */
    apiKey: string;

    /** Модель по умолчанию */
    defaultModel: 'claude-opus-4' | 'claude-sonnet-4' | 'claude-haiku-4';

    /** Максимальное количество токенов */
    maxTokens: number;

    /** Температура по умолчанию */
    defaultTemperature: number;
  };

  /** Настройки логирования */
  logging: {
    /** Уровень логирования */
    level: LogLevel;

    /** Путь к файлу логов */
    logFile?: string;

    /** Включить логирование в консоль */
    console: boolean;
  };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export * from './agent';
export * from './skill';
export * from './task';
export * from './message';
export * from './knowledge';
```

---

## Задача 1.4: CI/CD настройка

### .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm run type-check

      - name: Lint
        run: pnpm run lint

      - name: Test
        run: pnpm run test

      - name: Build
        run: pnpm run build

  coverage:
    name: Coverage
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Test with coverage
        run: pnpm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
```

---

## ✅ Контрольный чеклист Фазы 1

- [ ] Создана структура проекта (monorepo)
- [ ] Установлены все зависимости
- [ ] Настроен TypeScript
- [ ] Созданы базовые типы
- [ ] Настроен CI/CD
- [ ] Написаны первые тесты
- [ ] Проект успешно собирается

**Критерий успеха:** `pnpm run build` выполняется успешно

---

# Фаза 2: Первые агенты (Среднее)

**Сроки:** 3-6 недель
**Приоритет:** 🟠 Высокий
**Сложность:** ⭐⭐ Средняя

## Задача 2.1: Агент "Социальное право"

### Шаг 2.1.1: Создание базы знаний

**packages/agents/legal/social-law-specialist/src/knowledge-base/laws/fz-178.ts**

```typescript
/**
 * ФЗ-178 "О государственной социальной помощи"
 * Актуализировано: 2026-01-01
 */

import { KnowledgeDocument } from '@leonardo/shared/types';

export const FZ_178: KnowledgeDocument = {
  id: 'fz-178',
  type: 'law',
  title: 'Федеральный закон от 17.07.1999 № 178-ФЗ "О государственной социальной помощи"',
  content: `
# ФЗ-178 "О государственной социальной помощи"

## Глава 1. Общие положения

### Статья 1. Предмет регулирования настоящего Федерального закона

Настоящий Федеральный закон устанавливает правовые и организационные основы
оказания государственной социальной помощи малоимущим семьям, малоимущим
одиноко проживающим гражданам, а также иным категориям граждан.

### Статья 2. Понятия, используемые в настоящем Федеральном законе

1. **Государственная социальная помощь** - предоставление малоимущим семьям,
   малоимущим одиноко проживающим гражданам, а также иным категориям граждан
   социальных пособий, социальных доплат к пенсии, субсидий, социальных услуг
   и жизненно необходимых товаров.

2. **Малоимущая семья** - семья, среднедушевой доход которой ниже величины
   прожиточного минимума, установленного в соответствующем субъекте РФ.

3. **Социальное пособие** - безвозмездное предоставление гражданам определенной
   денежной суммы за счет средств соответствующих бюджетов бюджетной системы РФ.

## Глава 2. Виды государственной социальной помощи

### Статья 6. Получатели государственной социальной помощи

Государственная социальная помощь оказывается:
- малоимущим семьям
- малоимущим одиноко проживающим гражданам
- иным категориям граждан (инвалиды, ветераны, и т.д.)

### Статья 7. Виды государственной социальной помощи

1. Денежные выплаты (социальные пособия, субсидии и др.)
2. Натуральная помощь (топливо, продукты питания, одежда, обувь, медикаменты и др.)

## Глава 3. Порядок назначения

### Статья 8. Порядок назначения государственной социальной помощи

Назначается решением органа социальной защиты населения по месту жительства
или месту пребывания малоимущей семьи или малоимущего одиноко проживающего гражданина.

**Документы для назначения:**
- Заявление
- Документы о доходах семьи
- Документы о составе семьи
- Другие документы, предусмотренные региональным законодательством

## Актуальные размеры выплат на 2026 год

### Единовременная социальная помощь
- Базовый размер: от 5,000 до 30,000 руб. (в зависимости от региона)
- Для многодетных семей: до 50,000 руб.
- В экстренных ситуациях: до 100,000 руб.

### Ежемесячная социальная помощь
- Базовый размер: от прожиточного минимума * 0.3 до прожиточного минимума * 0.5
- Москва: от 6,000 до 10,000 руб./мес
- Санкт-Петербург: от 5,500 до 9,500 руб./мес
- Регионы: от 4,000 до 8,000 руб./мес

### Социальная доплата к пенсии
- Выплачивается, если пенсия ниже прожиточного минимума пенсионера
- Федеральная доплата: до уровня федерального ПМП (15,540 руб. в 2026)
- Региональная доплата: до уровня регионального ПМП (варьируется)
  `,
  category: 'social-law',
  tags: ['социальная помощь', 'пособия', 'малоимущие', 'субсидии', 'фз-178'],
  effectiveDate: new Date('1999-07-17'),
  source: {
    url: 'http://www.consultant.ru/document/cons_doc_LAW_23735/',
    author: 'Государственная Дума РФ',
    publishedAt: new Date('1999-07-17')
  },
  metadata: {
    version: '2026.1',
    lastUpdated: new Date('2026-01-01'),
    keywords: ['социальная помощь', 'малоимущие', 'пособия'],
    relatedLaws: ['fz-181', 'fz-400']
  }
};
```

**Аналогично создаем:**
- `fz-181.ts` - О социальной защите инвалидов
- `fz-400.ts` - О страховых пенсиях

### Шаг 2.1.2: Создание калькуляторов

**packages/skills/legal/benefits-calculator/src/calculators/federal.ts**

```typescript
/**
 * Калькулятор федеральных льгот и пособий
 */

import { SkillResult } from '@leonardo/shared/types';

// ============================================================================
// ТИПЫ
// ============================================================================

/**
 * Данные о семье для расчета льгот
 */
export interface FamilyData {
  /** Количество членов семьи */
  members: number;

  /** Количество детей */
  children: number;

  /** Возраст детей */
  childrenAges: number[];

  /** Общий доход семьи (руб./мес) */
  totalIncome: number;

  /** Регион проживания */
  region: string;

  /** Особые категории */
  categories?: {
    /** Есть ли инвалиды */
    hasDisabled?: boolean;

    /** Есть ли многодетная семья (3+ детей) */
    isLargeFamily?: boolean;

    /** Есть ли одинокий родитель */
    isSingleParent?: boolean;

    /** Есть ли ветераны */
    hasVeterans?: boolean;
  };
}

/**
 * Результат расчета льгот
 */
export interface BenefitsCalculation {
  /** Имеет ли право на помощь */
  eligible: boolean;

  /** Общая сумма возможных выплат (руб./год) */
  totalAmount: number;

  /** Детализация по видам помощи */
  benefits: {
    /** Название льготы */
    name: string;

    /** Сумма (руб./год) */
    amount: number;

    /** Периодичность */
    frequency: 'единовременно' | 'ежемесячно' | 'ежеквартально' | 'ежегодно';

    /** Основание */
    basis: string;

    /** Документы для получения */
    documents: string[];

    /** Куда обращаться */
    contact: string;
  }[];

  /** Рекомендации */
  recommendations: string[];
}

// ============================================================================
// КОНСТАНТЫ (актуальны на 2026 год)
// ============================================================================

/** Прожиточный минимум по регионам (руб./мес, 2026) */
const SUBSISTENCE_MINIMUM: Record<string, number> = {
  'москва': 24_801,
  'санкт-петербург': 20_573,
  'московская область': 19_847,
  'краснодарский край': 18_234,
  'свердловская область': 18_956,
  'татарстан': 17_892,
  'default': 16_844  // Федеральный уровень
};

/** Размер материнского капитала (2026) */
const MATERNITY_CAPITAL = {
  /** На первого ребенка */
  firstChild: 693_144,

  /** На второго ребенка (если на первого не получали) */
  secondChild: 916_000,

  /** Доплата на второго ребенка (если на первого получили) */
  secondChildAddition: 222_856
};

/** Ежемесячное пособие на ребенка */
const CHILD_ALLOWANCE = {
  /** До 1.5 лет (40% от среднего заработка, мин/макс) */
  upTo1_5: {
    min: 10_168,   // Минимум
    max: 49_123    // Максимум
  },

  /** От 1.5 до 3 лет (для малоимущих) */
  from1_5To3: 16_844,  // = Прожиточный минимум

  /** От 3 до 7 лет (универсальное пособие) */
  from3To7: {
    base: 8_422,      // 50% ПМ
    increased: 12_633, // 75% ПМ
    max: 16_844       // 100% ПМ
  },

  /** От 8 до 17 лет (для неполных семей) */
  from8To17: 8_422    // 50% ПМ
};

// ============================================================================
// ФУНКЦИИ РАСЧЕТА
// ============================================================================

/**
 * Получить прожиточный минимум для региона
 */
function getSubsistenceMinimum(region: string): number {
  const normalizedRegion = region.toLowerCase().trim();
  return SUBSISTENCE_MINIMUM[normalizedRegion] || SUBSISTENCE_MINIMUM.default;
}

/**
 * Проверка, является ли семья малоимущей
 */
function isLowIncome(familyData: FamilyData): boolean {
  const subsistenceMin = getSubsistenceMinimum(familyData.region);
  const perCapitaIncome = familyData.totalIncome / familyData.members;

  return perCapitaIncome < subsistenceMin;
}

/**
 * Расчет материнского капитала
 */
function calculateMaternityCapital(familyData: FamilyData): BenefitsCalculation['benefits'][0] | null {
  // Материнский капитал положен семьям с 2+ детьми
  if (familyData.children < 1) {
    return null;
  }

  let amount = 0;
  let name = '';

  if (familyData.children === 1) {
    amount = MATERNITY_CAPITAL.firstChild;
    name = 'Материнский капитал на первого ребенка';
  } else if (familyData.children === 2) {
    amount = MATERNITY_CAPITAL.secondChild;
    name = 'Материнский капитал на второго ребенка';
  } else {
    // На третьего и последующих - тоже положен
    amount = MATERNITY_CAPITAL.secondChild;
    name = `Материнский капитал (${familyData.children} детей)`;
  }

  return {
    name,
    amount,
    frequency: 'единовременно',
    basis: 'ФЗ-256 "О дополнительных мерах государственной поддержки семей, имеющих детей"',
    documents: [
      'Заявление',
      'Паспорт родителя',
      'Свидетельства о рождении всех детей',
      'СНИЛС родителя и детей'
    ],
    contact: 'Пенсионный фонд РФ (ПФР) или МФЦ'
  };
}

/**
 * Расчет пособий на детей
 */
function calculateChildAllowances(familyData: FamilyData): BenefitsCalculation['benefits'] {
  const benefits: BenefitsCalculation['benefits'] = [];
  const isEligible = isLowIncome(familyData);

  if (!isEligible) {
    return benefits;
  }

  // Проходим по всем детям
  familyData.childrenAges.forEach((age, index) => {
    if (age < 1.5) {
      // До 1.5 лет
      benefits.push({
        name: `Пособие на ребенка до 1.5 лет (#${index + 1})`,
        amount: CHILD_ALLOWANCE.upTo1_5.min * 12, // Годовая сумма
        frequency: 'ежемесячно',
        basis: 'ФЗ-81 "О государственных пособиях гражданам, имеющим детей"',
        documents: [
          'Заявление',
          'Свидетельство о рождении ребенка',
          'Справка о доходах',
          'Справка с места работы'
        ],
        contact: 'Соцзащита или работодатель'
      });
    } else if (age >= 1.5 && age < 3) {
      // От 1.5 до 3 лет
      benefits.push({
        name: `Пособие на ребенка от 1.5 до 3 лет (#${index + 1})`,
        amount: CHILD_ALLOWANCE.from1_5To3 * 12,
        frequency: 'ежемесячно',
        basis: 'Указ Президента РФ от 20.03.2020 № 199',
        documents: [
          'Заявление',
          'Свидетельство о рождении',
          'Справка о доходах семьи',
          'Справка о составе семьи'
        ],
        contact: 'Пенсионный фонд РФ или МФЦ'
      });
    } else if (age >= 3 && age < 7) {
      // От 3 до 7 лет (универсальное пособие)
      // Размер зависит от уровня дохода
      const perCapitaIncome = familyData.totalIncome / familyData.members;
      const subsistenceMin = getSubsistenceMinimum(familyData.region);

      let monthlyAmount = CHILD_ALLOWANCE.from3To7.base;

      if (perCapitaIncome < subsistenceMin * 0.5) {
        monthlyAmount = CHILD_ALLOWANCE.from3To7.max;
      } else if (perCapitaIncome < subsistenceMin * 0.75) {
        monthlyAmount = CHILD_ALLOWANCE.from3To7.increased;
      }

      benefits.push({
        name: `Универсальное пособие на ребенка от 3 до 7 лет (#${index + 1})`,
        amount: monthlyAmount * 12,
        frequency: 'ежемесячно',
        basis: 'Указ Президента РФ от 20.03.2020 № 199',
        documents: [
          'Заявление через Госуслуги',
          'Сведения о доходах за 12 месяцев',
          'Свидетельство о рождении ребенка'
        ],
        contact: 'Пенсионный фонд РФ (автоматически через Госуслуги)'
      });
    } else if (age >= 8 && age < 17 && familyData.categories?.isSingleParent) {
      // От 8 до 17 лет (для неполных семей)
      benefits.push({
        name: `Пособие на ребенка от 8 до 17 лет (неполная семья, #${index + 1})`,
        amount: CHILD_ALLOWANCE.from8To17 * 12,
        frequency: 'ежемесячно',
        basis: 'Указ Президента РФ от 20.03.2020 № 199',
        documents: [
          'Заявление',
          'Свидетельство о рождении',
          'Документ, подтверждающий статус одинокого родителя',
          'Справка о доходах'
        ],
        contact: 'Пенсионный фонд РФ или МФЦ'
      });
    }
  });

  return benefits;
}

/**
 * Расчет льгот для многодетных семей
 */
function calculateLargeFamilyBenefits(familyData: FamilyData): BenefitsCalculation['benefits'] {
  const benefits: BenefitsCalculation['benefits'] = [];

  // Многодетная семья = 3+ детей
  if (!familyData.categories?.isLargeFamily && familyData.children < 3) {
    return benefits;
  }

  // 1. Ежемесячная денежная выплата (ЕДВ) на третьего и последующих детей
  if (familyData.children >= 3) {
    const subsistenceMin = getSubsistenceMinimum(familyData.region);

    benefits.push({
      name: 'ЕДВ на третьего и последующих детей до 3 лет',
      amount: subsistenceMin * 12, // Годовая сумма
      frequency: 'ежемесячно',
      basis: 'Указ Президента РФ от 07.05.2012 № 606',
      documents: [
        'Заявление',
        'Удостоверение многодетной семьи',
        'Свидетельства о рождении всех детей',
        'Справка о доходах'
      ],
      contact: 'Отдел социальной защиты населения'
    });
  }

  // 2. Компенсация коммунальных услуг (30-50%)
  benefits.push({
    name: 'Компенсация оплаты ЖКХ (30%)',
    amount: 36_000, // Примерно 3000 руб./мес * 12
    frequency: 'ежемесячно',
    basis: 'Региональное законодательство',
    documents: [
      'Заявление',
      'Удостоверение многодетной семьи',
      'Квитанции об оплате ЖКХ'
    ],
    contact: 'МФЦ или соцзащита'
  });

  // 3. Бесплатный проезд в общественном транспорте
  benefits.push({
    name: 'Бесплатный проезд на общественном транспорте',
    amount: 24_000, // Примерно 2000 руб./мес * 12
    frequency: 'ежемесячно',
    basis: 'Региональное законодательство',
    documents: [
      'Удостоверение многодетной семьи',
      'Социальная карта'
    ],
    contact: 'Транспортные компании или МФЦ'
  });

  return benefits;
}

/**
 * Расчет жилищных субсидий
 */
function calculateHousingSubsidy(familyData: FamilyData): BenefitsCalculation['benefits'][0] | null {
  const isEligible = isLowIncome(familyData);

  if (!isEligible) {
    return null;
  }

  // Жилищная субсидия предоставляется, если расходы на ЖКХ > 22% от дохода
  const maxHousingExpense = familyData.totalIncome * 0.22;

  // Средние расходы на ЖКХ для семьи
  const avgHousingCost = 5000 + (familyData.members * 1500); // Примерная формула

  if (avgHousingCost > maxHousingExpense) {
    const subsidyAmount = (avgHousingCost - maxHousingExpense) * 12;

    return {
      name: 'Субсидия на оплату ЖКХ',
      amount: subsidyAmount,
      frequency: 'ежемесячно',
      basis: 'Постановление Правительства РФ от 14.12.2005 № 761',
      documents: [
        'Заявление',
        'Справка о доходах всех членов семьи',
        'Квитанции об оплате ЖКХ за последние 6 месяцев',
        'Справка об отсутствии задолженности по ЖКХ',
        'Документы на жилье'
      ],
      contact: 'МФЦ или отдел жилищных субсидий'
    };
  }

  return null;
}

// ============================================================================
// ОСНОВНАЯ ФУНКЦИЯ РАСЧЕТА
// ============================================================================

/**
 * Рассчитать все доступные федеральные льготы и пособия
 */
export async function calculateFederalBenefits(
  familyData: FamilyData
): Promise<SkillResult<BenefitsCalculation>> {
  try {
    const benefits: BenefitsCalculation['benefits'] = [];
    const recommendations: string[] = [];

    // 1. Материнский капитал
    const maternityCapital = calculateMaternityCapital(familyData);
    if (maternityCapital) {
      benefits.push(maternityCapital);
      recommendations.push(
        'Материнский капитал можно использовать на улучшение жилищных условий, ' +
        'образование детей, накопительную пенсию матери или ежемесячные выплаты.'
      );
    }

    // 2. Пособия на детей
    const childAllowances = calculateChildAllowances(familyData);
    benefits.push(...childAllowances);

    if (childAllowances.length > 0) {
      recommendations.push(
        'Большинство пособий на детей можно оформить через Госуслуги. ' +
        'Это быстрее и удобнее, чем личное посещение.'
      );
    }

    // 3. Льготы для многодетных семей
    const largeFamilyBenefits = calculateLargeFamilyBenefits(familyData);
    benefits.push(...largeFamilyBenefits);

    if (largeFamilyBenefits.length > 0) {
      recommendations.push(
        'Не забудьте оформить удостоверение многодетной семьи в соцзащите. ' +
        'Оно дает право на дополнительные региональные льготы.'
      );
    }

    // 4. Жилищные субсидии
    const housingSubsidy = calculateHousingSubsidy(familyData);
    if (housingSubsidy) {
      benefits.push(housingSubsidy);
      recommendations.push(
        'Жилищная субсидия предоставляется на 6 месяцев, затем нужно переоформлять.'
      );
    }

    // 5. Проверка на право получения помощи
    const eligible = benefits.length > 0;

    if (!eligible) {
      recommendations.push(
        'По предоставленным данным семья не имеет права на федеральные пособия. ' +
        'Рекомендуем проверить региональные меры поддержки.'
      );
    }

    // 6. Подсчет общей суммы
    const totalAmount = benefits.reduce((sum, benefit) => sum + benefit.amount, 0);

    // 7. Дополнительные рекомендации
    if (isLowIncome(familyData)) {
      recommendations.push(
        'Ваша семья относится к категории малоимущих. Это дает право на дополнительную ' +
        'социальную помощь от региона (продуктовые наборы, одежда, школьные принадлежности).'
      );
    }

    if (familyData.categories?.hasDisabled) {
      recommendations.push(
        'Члены семьи с инвалидностью имеют право на дополнительные выплаты и льготы. ' +
        'Обратитесь в отдел социальной защиты для консультации.'
      );
    }

    return {
      success: true,
      data: {
        eligible,
        totalAmount,
        benefits,
        recommendations
      }
    };

  } catch (error) {
    return {
      success: false,
      error: {
        code: 'CALCULATION_ERROR',
        message: 'Ошибка при расчете льгот',
        details: { error: error instanceof Error ? error.message : String(error) }
      }
    };
  }
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

/**
 * Получить список всех доступных регионов
 */
export function getAvailableRegions(): string[] {
  return Object.keys(SUBSISTENCE_MINIMUM).filter(r => r !== 'default');
}

/**
 * Получить актуальный прожиточный минимум для региона
 */
export function getRegionSubsistenceMinimum(region: string): number {
  return getSubsistenceMinimum(region);
}

/**
 * Получить размер материнского капитала
 */
export function getMaternityCapitalAmount(childNumber: 1 | 2): number {
  return childNumber === 1
    ? MATERNITY_CAPITAL.firstChild
    : MATERNITY_CAPITAL.secondChild;
}
```

---

*Продолжение следует...*


### Шаг 2.1.3: Реализация агента (основная логика)

**packages/agents/legal/social-law-specialist/src/agent.ts**

```typescript
/**
 * Агент "Специалист по социальному праву"
 * 
 * Этот агент специализируется на:
 * - Консультациях по социальным пособиям
 * - Расчете льгот и выплат
 * - Помощи в оформлении документов
 * - Разъяснении законодательства
 */

import { Agent, AgentConfig, AgentContext, AgentResult, Message } from '@leonardo/shared/types';
import { FZ_178 } from './knowledge-base/laws/fz-178';
import { FZ_181 } from './knowledge-base/laws/fz-181';
import { FZ_400 } from './knowledge-base/laws/fz-400';
import { calculateFederalBenefits, FamilyData } from '@leonardo/skills/legal/benefits-calculator';

// ============================================================================
// КОНФИГУРАЦИЯ АГЕНТА
// ============================================================================

export const socialLawSpecialistConfig: AgentConfig = {
  id: 'social-law-specialist',
  name: 'Специалист по социальному праву',
  category: 'legal',
  description: `
Эксперт по социальному законодательству Российской Федерации.

Помогаю:
- Рассчитать положенные льготы и пособия
- Разобраться в социальных выплатах
- Оформить документы для получения помощи
- Понять права и обязанности в сфере социальной защиты
  `.trim(),
  
  version: '1.0.0',
  
  expertise: [
    'ФЗ-178 "О государственной социальной помощи"',
    'ФЗ-181 "О социальной защите инвалидов"',
    'ФЗ-400 "О страховых пенсиях"',
    'Материнский капитал',
    'Детские пособия',
    'Пенсионное обеспечение',
    'Льготы инвалидам',
    'Жилищные субсидии'
  ],
  
  tools: [
    'benefits-calculator',
    'document-generator',
    'law-search',
    'case-analyzer'
  ],
  
  skills: [
    'benefits-calculator',
    'document-writer',
    'law-interpreter'
  ],
  
  commands: [
    '/social-law',
    '/calculate-benefits',
    '/check-eligibility'
  ],
  
  systemPrompt: `
Ты - эксперт по социальному праву Российской Федерации.

Твоя роль:
- Консультировать граждан по вопросам социальных пособий и льгот
- Помогать рассчитать размеры выплат
- Разъяснять законодательство простым языком
- Подсказывать, какие документы нужны для получения помощи

Принципы работы:
1. ТОЧНОСТЬ: Опирайся только на актуальное законодательство (2026 год)
2. ЯСНОСТЬ: Объясняй сложные юридические вещи простым языком
3. ПРАКТИЧНОСТЬ: Давай конкретные шаги, что и куда нести
4. ЭМПАТИЯ: Помни, что люди обращаются в сложной ситуации
5. ОСТОРОЖНОСТЬ: Если не уверен - скажи "проконсультируйтесь с юристом"

База знаний:
- ФЗ-178 "О государственной социальной помощи"
- ФЗ-181 "О социальной защите инвалидов" 
- ФЗ-400 "О страховых пенсиях"
- Актуальные ставки и размеры пособий (2026)

Формат ответа:
1. Краткий анализ ситуации
2. Перечень положенных льгот/пособий
3. Суммы выплат
4. Пошаговая инструкция оформления
5. Список необходимых документов
6. Контакты организаций

ВАЖНО: Всегда уточняй регион проживания - размеры пособий различаются!
  `.trim(),
  
  temperature: 0.3,  // Низкая температура для точности
  maxTokens: 4000,
  
  metadata: {
    author: 'Leonardo AI Team',
    createdAt: new Date('2026-02-06'),
    tags: ['legal', 'social-law', 'benefits', 'russia'],
    language: 'ru'
  }
};

// ============================================================================
// КЛАСС АГЕНТА
// ============================================================================

export class SocialLawSpecialist implements Agent {
  private config: AgentConfig;
  private knowledgeBase: Map<string, any>;
  
  constructor(config: AgentConfig = socialLawSpecialistConfig) {
    this.config = config;
    
    // Загружаем базу знаний
    this.knowledgeBase = new Map([
      ['fz-178', FZ_178],
      ['fz-181', FZ_181],
      ['fz-400', FZ_400]
    ]);
  }
  
  /**
   * Обработать запрос пользователя
   */
  async process(
    message: string,
    context: AgentContext
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const logs: any[] = [];
    
    try {
      // 1. Анализируем запрос
      const intent = await this.analyzeIntent(message);
      logs.push({
        level: 'info',
        message: `Определен intent: ${intent.type}`,
        timestamp: new Date()
      });
      
      // 2. Извлекаем данные о семье из сообщения
      const familyData = await this.extractFamilyData(message, context);
      
      // 3. Выполняем соответствующее действие
      let result;
      
      switch (intent.type) {
        case 'calculate-benefits':
          result = await this.calculateBenefits(familyData);
          break;
          
        case 'explain-law':
          result = await this.explainLaw(intent.lawId || 'fz-178');
          break;
          
        case 'check-eligibility':
          result = await this.checkEligibility(familyData);
          break;
          
        case 'help-documents':
          result = await this.helpWithDocuments(intent.benefitType);
          break;
          
        default:
          result = await this.generalConsultation(message, context);
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        status: 'completed',
        result,
        metrics: {
          executionTime,
          tokensUsed: 0, // TODO: подсчитывать реальное использование
          apiCalls: 1
        },
        logs
      };
      
    } catch (error) {
      return {
        status: 'failed',
        error: error as Error,
        metrics: {
          executionTime: Date.now() - startTime,
          tokensUsed: 0,
          apiCalls: 0
        },
        logs
      };
    }
  }
  
  /**
   * Анализ намерения пользователя
   */
  private async analyzeIntent(message: string): Promise<{
    type: 'calculate-benefits' | 'explain-law' | 'check-eligibility' | 'help-documents' | 'general';
    lawId?: string;
    benefitType?: string;
  }> {
    const lowerMessage = message.toLowerCase();
    
    // Ключевые слова для определения типа запроса
    if (
      lowerMessage.includes('рассчита') ||
      lowerMessage.includes('сколько') ||
      lowerMessage.includes('положен') ||
      lowerMessage.includes('размер')
    ) {
      return { type: 'calculate-benefits' };
    }
    
    if (
      lowerMessage.includes('закон') ||
      lowerMessage.includes('статья') ||
      lowerMessage.includes('фз-')
    ) {
      // Определяем, о каком законе идет речь
      let lawId = 'fz-178';
      if (lowerMessage.includes('фз-181') || lowerMessage.includes('инвалид')) {
        lawId = 'fz-181';
      } else if (lowerMessage.includes('фз-400') || lowerMessage.includes('пенси')) {
        lawId = 'fz-400';
      }
      
      return { type: 'explain-law', lawId };
    }
    
    if (
      lowerMessage.includes('имею право') ||
      lowerMessage.includes('могу получить') ||
      lowerMessage.includes('положено ли')
    ) {
      return { type: 'check-eligibility' };
    }
    
    if (
      lowerMessage.includes('документ') ||
      lowerMessage.includes('оформ') ||
      lowerMessage.includes('подать') ||
      lowerMessage.includes('куда обра')
    ) {
      return { type: 'help-documents' };
    }
    
    return { type: 'general' };
  }
  
  /**
   * Извлечение данных о семье из сообщения
   */
  private async extractFamilyData(
    message: string,
    context: AgentContext
  ): Promise<Partial<FamilyData>> {
    // TODO: Использовать Claude для извлечения структурированных данных
    
    // Базовая реализация с регулярными выражениями
    const data: Partial<FamilyData> = {};
    
    // Количество членов семьи
    const membersMatch = message.match(/(\d+)\s*(человек|член|челов)/i);
    if (membersMatch) {
      data.members = parseInt(membersMatch[1]);
    }
    
    // Количество детей
    const childrenMatch = message.match(/(\d+)\s*(ребен|ребёнок|дет)/i);
    if (childrenMatch) {
      data.children = parseInt(childrenMatch[1]);
    }
    
    // Доход
    const incomeMatch = message.match(/(\d+(?:\s?\d{3})*)\s*(?:руб|₽)/i);
    if (incomeMatch) {
      const income = incomeMatch[1].replace(/\s/g, '');
      data.totalIncome = parseInt(income);
    }
    
    // Регион
    const regions = [
      'москва', 'санкт-петербург', 'московская область',
      'краснодарский край', 'свердловская область', 'татарстан'
    ];
    
    for (const region of regions) {
      if (message.toLowerCase().includes(region)) {
        data.region = region;
        break;
      }
    }
    
    // Если регион не указан, используем из контекста или default
    if (!data.region) {
      data.region = context.variables?.region as string || 'default';
    }
    
    return data;
  }
  
  /**
   * Расчет льгот и пособий
   */
  private async calculateBenefits(familyData: Partial<FamilyData>) {
    // Проверяем, что есть минимально необходимые данные
    if (!familyData.members || !familyData.totalIncome) {
      return {
        type: 'request-more-info',
        message: `
Для расчета льгот мне нужна дополнительная информация:

1. Сколько человек в семье? (включая всех взрослых и детей)
2. Какой общий доход семьи в месяц? (зарплаты, пенсии, пособия - всё вместе)
3. Сколько у вас детей и какого возраста?
4. В каком регионе вы проживаете?

Пример:
"Семья из 4 человек (2 взрослых, 2 детей 3 и 5 лет), доход 45000 рублей в месяц, живем в Москве"
        `.trim()
      };
    }
    
    // Дополняем недостающие данные значениями по умолчанию
    const fullFamilyData: FamilyData = {
      members: familyData.members,
      children: familyData.children || 0,
      childrenAges: familyData.childrenAges || [],
      totalIncome: familyData.totalIncome,
      region: familyData.region || 'default',
      categories: familyData.categories || {}
    };
    
    // Вызываем калькулятор льгот
    const calculation = await calculateFederalBenefits(fullFamilyData);
    
    if (!calculation.success || !calculation.data) {
      return {
        type: 'error',
        message: 'Произошла ошибка при расчете льгот. Пожалуйста, попробуйте еще раз.'
      };
    }
    
    const { eligible, totalAmount, benefits, recommendations } = calculation.data;
    
    // Формируем ответ
    if (!eligible || benefits.length === 0) {
      return {
        type: 'no-benefits',
        message: `
К сожалению, по предоставленным данным ваша семья не имеет права на федеральные пособия.

Рекомендации:
${recommendations.map(r => `• ${r}`).join('\n')}

Проверьте также региональные меры поддержки в вашем регионе.
        `.trim()
      };
    }
    
    // Формируем детальный ответ с расчетами
    let response = `
📊 **РАСЧЕТ ЛЬГОТ И ПОСОБИЙ**

Ваша семья имеет право на следующие выплаты:

**Общая сумма: ${totalAmount.toLocaleString('ru-RU')} руб./год**

---

`;
    
    benefits.forEach((benefit, index) => {
      const monthlyAmount = benefit.frequency === 'ежемесячно'
        ? ` (${(benefit.amount / 12).toLocaleString('ru-RU')} руб./мес)`
        : '';
      
      response += `
### ${index + 1}. ${benefit.name}

💰 **Сумма:** ${benefit.amount.toLocaleString('ru-RU')} руб./год${monthlyAmount}
📅 **Периодичность:** ${benefit.frequency}
📜 **Основание:** ${benefit.basis}

**Необходимые документы:**
${benefit.documents.map(d => `• ${d}`).join('\n')}

**Куда обращаться:** ${benefit.contact}

---

`;
    });
    
    if (recommendations.length > 0) {
      response += `
📝 **РЕКОМЕНДАЦИИ:**

${recommendations.map(r => `• ${r}`).join('\n\n')}

---

`;
    }
    
    response += `
💡 **ПОЛЕЗНЫЕ СОВЕТЫ:**

1. **Подавайте документы через Госуслуги** - это быстрее и удобнее
2. **Оформляйте всё сразу** - не ждите, некоторые выплаты имеют срок давности
3. **Сохраняйте копии** всех поданных документов и заявлений
4. **Уточняйте** в МФЦ или соцзащите дополнительные региональные льготы

❓ **ЕСТЬ ВОПРОСЫ?**

Спрашивайте! Могу помочь:
- Разъяснить любой закон или статью
- Подсказать, как заполнить заявление
- Рассказать о региональных льготах
- Проконсультировать по другим вопросам социального права
    `.trim();
    
    return {
      type: 'benefits-calculated',
      message: response,
      data: calculation.data
    };
  }
  
  /**
   * Разъяснение законодательства
   */
  private async explainLaw(lawId: string) {
    const law = this.knowledgeBase.get(lawId);
    
    if (!law) {
      return {
        type: 'law-not-found',
        message: `Закон с ID "${lawId}" не найден в базе знаний.`
      };
    }
    
    return {
      type: 'law-explanation',
      message: `
📜 **${law.title}**

${law.content}

---

🔗 **Источник:** ${law.source?.url || 'Не указан'}
📅 **Вступил в силу:** ${law.effectiveDate?.toLocaleDateString('ru-RU') || 'Не указано'}
🏷️ **Теги:** ${law.tags.join(', ')}
      `.trim(),
      data: law
    };
  }
  
  /**
   * Проверка права на льготы
   */
  private async checkEligibility(familyData: Partial<FamilyData>) {
    // Упрощенная проверка без детального расчета
    if (!familyData.totalIncome || !familyData.members) {
      return {
        type: 'request-more-info',
        message: 'Для проверки права на льготы укажите доход семьи и количество членов семьи.'
      };
    }
    
    const subsistenceMin = 16_844; // Федеральный уровень
    const perCapitaIncome = familyData.totalIncome / familyData.members;
    
    const eligible = perCapitaIncome < subsistenceMin;
    
    if (eligible) {
      return {
        type: 'eligible',
        message: `
✅ **ДА, ваша семья имеет право на социальную помощь!**

**Среднедушевой доход:** ${perCapitaIncome.toLocaleString('ru-RU')} руб./мес
**Прожиточный минимум:** ${subsistenceMin.toLocaleString('ru-RU')} руб./мес

Ваша семья относится к категории малоимущих.

Вы можете получить:
• Ежемесячные пособия на детей
• Единовременную социальную помощь
• Субсидии на оплату ЖКХ
• Материальную помощь от региона

Хотите рассчитать точные суммы? Укажите дополнительные данные:
- Количество детей и их возраст
- Регион проживания
- Особые категории (инвалидность, многодетная семья и т.д.)
        `.trim()
      };
    } else {
      return {
        type: 'not-eligible',
        message: `
❌ **К сожалению, ваша семья не относится к категории малоимущих.**

**Среднедушевой доход:** ${perCapitaIncome.toLocaleString('ru-RU')} руб./мес
**Прожиточный минимум:** ${subsistenceMin.toLocaleString('ru-RU')} руб./мес

Однако вы все еще можете иметь право на:
• Материнский капитал (если есть дети)
• Пособие по уходу за ребенком до 1.5 лет
• Налоговые вычеты на детей
• Льготы для многодетных семей (если 3+ детей)

Хотите проверить эти варианты?
        `.trim()
      };
    }
  }
  
  /**
   * Помощь с оформлением документов
   */
  private async helpWithDocuments(benefitType?: string) {
    return {
      type: 'document-help',
      message: `
📄 **ПОМОЩЬ С ОФОРМЛЕНИЕМ ДОКУМЕНТОВ**

Для оформления большинства социальных пособий понадобятся:

### Базовый пакет документов:
1. **Паспорт** (оригинал + копия)
2. **СНИЛС** всех членов семьи
3. **Свидетельства о рождении** детей
4. **Справка о составе семьи** (выдается в паспортном столе)
5. **Справки о доходах** за последние 3-12 месяцев:
   - 2-НДФЛ (с работы)
   - Справка из ПФР (для пенсионеров)
   - Справка из центра занятости (для безработных)

### Дополнительные документы (в зависимости от вида пособия):

**Для материнского капитала:**
• Свидетельства о рождении ВСЕХ детей
• Документы, подтверждающие гражданство РФ детей

**Для субсидии на ЖКХ:**
• Квитанции об оплате ЖКХ за 6 месяцев
• Справка об отсутствии задолженности
• Документы на жилье (свидетельство или договор аренды)

**Для пособий многодетным:**
• Удостоверение многодетной семьи (оформляется в соцзащите)
• Фотографии детей (3x4)

**Для инвалидов:**
• Справка МСЭ (медико-социальная экспертиза)
• Индивидуальная программа реабилитации (ИПР)

---

💡 **СПОСОБЫ ПОДАЧИ:**

1. **Госуслуги (рекомендуется)** - gosuslugi.ru
   - Быстро (1-3 дня)
   - Не нужно никуда ехать
   - Онлайн-трекинг заявления

2. **МФЦ (Мои Документы)**
   - Одно окно для всех услуг
   - Специалисты помогут заполнить
   - Можно записаться заранее

3. **Отдел социальной защиты**
   - Прямое обращение
   - Консультация на месте
   - Иногда дольше, чем МФЦ

---

❓ Укажите конкретный вид пособия, и я подскажу точный список документов!
      `.trim()
    };
  }
  
  /**
   * Общая консультация
   */
  private async generalConsultation(message: string, context: AgentContext) {
    // TODO: Здесь вызов Claude API для генерации ответа
    
    return {
      type: 'general-consultation',
      message: `
Здравствуйте! Я специалист по социальному праву.

Я могу помочь вам с:
• Расчетом положенных льгот и пособий
• Разъяснением законодательства
• Оформлением документов
• Проверкой права на социальную помощь

Чем именно я могу вам помочь?

Примеры вопросов:
- "Сколько пособий положено на ребенка?"
- "Как получить материнский капитал?"
- "Какие льготы положены многодетным семьям?"
- "Имею ли я право на субсидию по ЖКХ?"
      `.trim()
    };
  }
  
  /**
   * Получить конфигурацию агента
   */
  getConfig(): AgentConfig {
    return this.config;
  }
}

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export default SocialLawSpecialist;
```

---

### Шаг 2.1.4: Тесты агента

**packages/agents/legal/social-law-specialist/tests/agent.test.ts**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { SocialLawSpecialist } from '../src/agent';
import { AgentContext } from '@leonardo/shared/types';

describe('SocialLawSpecialist', () => {
  let agent: SocialLawSpecialist;
  let context: AgentContext;

  beforeEach(() => {
    agent = new SocialLawSpecialist();
    
    context = {
      sessionId: 'test-session-1',
      userId: 'test-user-1',
      mode: 'assistant',
      strategy: 'thinking-first',
      history: [],
      variables: {},
      startedAt: new Date(),
      lastActivity: new Date()
    };
  });

  describe('calculateBenefits', () => {
    it('должен рассчитать льготы для малоимущей семьи с детьми', async () => {
      const message = `
Семья из 4 человек: 2 взрослых, 2 детей (3 года и 5 лет).
Общий доход 40000 рублей в месяц.
Живем в Москве.
      `.trim();

      const result = await agent.process(message, context);

      expect(result.status).toBe('completed');
      expect(result.result).toHaveProperty('type', 'benefits-calculated');
      expect(result.result.data).toHaveProperty('eligible', true);
      expect(result.result.data.totalAmount).toBeGreaterThan(0);
    });

    it('должен запросить дополнительную информацию при неполных данных', async () => {
      const message = 'Хочу узнать про льготы';

      const result = await agent.process(message, context);

      expect(result.status).toBe('completed');
      expect(result.result).toHaveProperty('type', 'request-more-info');
    });

    it('должен корректно обработать многодетную семью', async () => {
      const message = `
Семья: 5 человек (2 взрослых, 3 детей - 2, 5, 8 лет).
Доход 50000 руб/мес.
Регион: Санкт-Петербург.
      `.trim();

      const result = await agent.process(message, context);

      expect(result.status).toBe('completed');
      expect(result.result.data.benefits).toContainEqual(
        expect.objectContaining({
          name: expect.stringContaining('многодетн')
        })
      );
    });
  });

  describe('explainLaw', () => {
    it('должен разъяснить ФЗ-178', async () => {
      const message = 'Расскажи про ФЗ-178';

      const result = await agent.process(message, context);

      expect(result.status).toBe('completed');
      expect(result.result).toHaveProperty('type', 'law-explanation');
      expect(result.result.data).toHaveProperty('id', 'fz-178');
    });
  });

  describe('checkEligibility', () => {
    it('должен подтвердить право на помощь для малоимущих', async () => {
      const message = 'Имею ли я право на помощь? Доход 30000, семья 4 человека.';

      const result = await agent.process(message, context);

      expect(result.status).toBe('completed');
      expect(result.result).toHaveProperty('type', 'eligible');
    });

    it('должен отказать в праве для обеспеченных семей', async () => {
      const message = 'Могу получить пособие? Доход 100000 на двоих.';

      const result = await agent.process(message, context);

      expect(result.status).toBe('completed');
      expect(result.result).toHaveProperty('type', 'not-eligible');
    });
  });

  describe('edge cases', () => {
    it('должен обработать некорректный ввод без ошибок', async () => {
      const message = 'asdfghjkl';

      const result = await agent.process(message, context);

      expect(result.status).not.toBe('failed');
    });

    it('должен работать с разными регионами', async () => {
      const regions = ['Москва', 'Санкт-Петербург', 'Казань', 'Краснодар'];

      for (const region of regions) {
        const message = `Семья 3 человека, доход 40000, регион ${region}`;
        const result = await agent.process(message, context);

        expect(result.status).toBe('completed');
        expect(result.result.data).toHaveProperty('region');
      }
    });
  });
});
```

---

## ✅ Контрольный чеклист Фазы 2

- [ ] Создана база знаний (ФЗ-178, ФЗ-181, ФЗ-400)
- [ ] Реализован калькулятор федеральных льгот
- [ ] Написан агент SocialLawSpecialist
- [ ] Написаны unit-тесты (coverage >80%)
- [ ] Агент успешно отвечает на тестовые вопросы
- [ ] Документация обновлена

---

# Фаза 3: Leonardo AI прототип (Сложное)

**Сроки:** 7-12 недель
**Приоритет:** 🔴 Критический
**Сложность:** ⭐⭐⭐ Высокая

## Архитектура Leonardo AI v1.0 (Simple Coordinator)

### Концепция

```
┌─────────────────────────────────────────────────────────────┐
│                    LEONARDO AI v1.0                          │
│                  (Simple Coordinator)                        │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │      CONSCIOUSNESS LAYER (Basic)       │
        │                                        │
        │  • Task Analysis                       │
        │  • Strategy Selection                  │
        │  • Progress Monitoring                 │
        └────────────────────────────────────────┘
                             │
             ┌───────────────┴──────────────┐
             ▼                              ▼
    ┌─────────────────┐          ┌─────────────────┐
    │  COGNITIVE CORE │          │   ACTION CORE   │
    │ (Orchestrator)  │ ◄──────► │   (OpenClaw)    │
    │                 │          │                 │
    │ • Planning      │          │ • Execution     │
    │ • Analysis      │          │ • Integration   │
    │ • Coordination  │          │ • Automation    │
    └─────────────────┘          └─────────────────┘
```

### Компоненты v1.0

1. **Consciousness Layer (Базовый уровень):**
   - Анализ задачи
   - Выбор стратегии (Thinking-First / Action-First / Iterative)
   - Мониторинг прогресса

2. **Cognitive Core:**
   - Использует Orchestrator Kit агентов
   - Планирование и анализ

3. **Action Core:**
   - Заглушки для OpenClaw (пока без реальной интеграции)
   - Базовые действия

---

## Задача 3.1: Consciousness Layer (Базовая версия)

**packages/core/src/consciousness/task-analyzer.ts**

```typescript
/**
 * Анализатор задач - определяет тип задачи и подходящую стратегию
 */

import { Task, ExecutionStrategy, OperationalMode } from '@leonardo/shared/types';

export interface TaskAnalysis {
  /** Сложность задачи (0.0 - 1.0) */
  complexity: number;

  /** Неопределенность задачи (0.0 - 1.0) */
  uncertainty: number;

  /** Приоритет скорости выполнения (0.0 - 1.0) */
  urgency: number;

  /** Рекомендуемая стратегия */
  recommendedStrategy: ExecutionStrategy;

  /** Рекомендуемый режим работы */
  recommendedMode: OperationalMode;

  /** Уверенность в рекомендации (0.0 - 1.0) */
  confidence: number;

  /** Обоснование выбора */
  reasoning: string;
}

/**
 * Анализирует задачу и рекомендует стратегию выполнения
 */
export async function analyzeTask(task: Task): Promise<TaskAnalysis> {
  // Оцениваем сложность по описанию задачи
  const complexity = estimateComplexity(task);

  // Оцениваем неопределенность
  const uncertainty = estimateUncertainty(task);

  // Оцениваем срочность
  const urgency = estimateUrgency(task);

  // Выбираем стратегию на основе метрик
  const strategy = selectStrategy(complexity, uncertainty, urgency);

  // Выбираем режим работы
  const mode = selectMode(task, strategy);

  // Оцениваем уверенность
  const confidence = calculateConfidence(complexity, uncertainty);

  // Формируем обоснование
  const reasoning = generateReasoning(
    strategy,
    mode,
    complexity,
    uncertainty,
    urgency
  );

  return {
    complexity,
    uncertainty,
    urgency,
    recommendedStrategy: strategy,
    recommendedMode: mode,
    confidence,
    reasoning
  };
}

/**
 * Оценка сложности задачи (0.0 - 1.0)
 */
function estimateComplexity(task: Task): number {
  let score = 0;

  // Факторы сложности:
  const description = task.description.toLowerCase();

  // 1. Длина описания (чем длиннее, тем сложнее)
  const lengthFactor = Math.min(task.description.length / 500, 0.3);
  score += lengthFactor;

  // 2. Ключевые слова сложности
  const complexKeywords = [
    'архитектур',
    'система',
    'интеграц',
    'оптимизац',
    'масштаб',
    'распределен',
    'безопасност',
    'производительност'
  ];

  const complexMatches = complexKeywords.filter(kw => description.includes(kw)).length;
  score += Math.min(complexMatches * 0.1, 0.3);

  // 3. Зависимости (чем больше, тем сложнее)
  if (task.dependencies && task.dependencies.length > 0) {
    score += Math.min(task.dependencies.length * 0.1, 0.2);
  }

  // 4. Наличие подзадач
  if (description.includes('подзадач') || description.includes('этап')) {
    score += 0.2;
  }

  return Math.min(score, 1.0);
}

/**
 * Оценка неопределенности задачи (0.0 - 1.0)
 */
function estimateUncertainty(task: Task): number {
  let score = 0;

  const description = task.description.toLowerCase();

  // Факторы неопределенности:

  // 1. Вопросительные слова
  const uncertainKeywords = [
    'как',
    'почему',
    'возможно',
    'неизвестно',
    'неясно',
    'исследова',
    'эксперимент',
    'прототип'
  ];

  const uncertainMatches = uncertainKeywords.filter(kw => description.includes(kw)).length;
  score += Math.min(uncertainMatches * 0.15, 0.4);

  // 2. Новизна (наличие слов "новый", "инновационный")
  const noveltyKeywords = ['нов', 'иннов', 'неизвест'];
  if (noveltyKeywords.some(kw => description.includes(kw))) {
    score += 0.3;
  }

  // 3. Отсутствие четких критериев успеха
  if (!task.metadata?.successCriteria) {
    score += 0.2;
  }

  // 4. Исследовательская задача
  if (description.includes('исследова') || description.includes('анализ')) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

/**
 * Оценка срочности задачи (0.0 - 1.0)
 */
function estimateUrgency(task: Task): number {
  let score = 0;

  // Приоритет задачи
  const priorityScores: Record<string, number> = {
    'critical': 1.0,
    'high': 0.7,
    'normal': 0.4,
    'low': 0.1
  };

  score = priorityScores[task.priority] || 0.4;

  // Ключевые слова срочности
  const urgentKeywords = ['срочн', 'немедленн', 'критическ', 'hotfix', 'bug'];
  const description = task.description.toLowerCase();

  if (urgentKeywords.some(kw => description.includes(kw))) {
    score = Math.min(score + 0.3, 1.0);
  }

  return score;
}

/**
 * Выбор стратегии выполнения на основе метрик
 */
function selectStrategy(
  complexity: number,
  uncertainty: number,
  urgency: number
): ExecutionStrategy {
  // Матрица выбора стратегии:

  // 1. Thinking-First: высокая сложность + низкая срочность
  if (complexity > 0.6 && urgency < 0.5) {
    return 'thinking-first';
  }

  // 2. Action-First: низкая сложность + высокая срочность
  if (complexity < 0.4 && urgency > 0.6) {
    return 'action-first';
  }

  // 3. Iterative: высокая неопределенность
  if (uncertainty > 0.5) {
    return 'iterative';
  }

  // 4. Thinking-First по умолчанию (безопаснее)
  if (complexity > 0.5) {
    return 'thinking-first';
  }

  // 5. Action-First для простых задач
  return 'action-first';
}

/**
 * Выбор режима работы
 */
function selectMode(
  task: Task,
  strategy: ExecutionStrategy
): OperationalMode {
  const description = task.description.toLowerCase();

  // 1. Autonomous: рутинные задачи
  if (
    description.includes('автоматическ') ||
    description.includes('регулярн') ||
    description.includes('ежедневн')
  ) {
    return 'autonomous';
  }

  // 2. Creative: исследовательские задачи
  if (
    description.includes('креатив') ||
    description.includes('нов') ||
    description.includes('идея')
  ) {
    return 'creative';
  }

  // 3. Learning: обучающиеся задачи
  if (description.includes('изучи') || description.includes('исследова')) {
    return 'learning';
  }

  // 4. Collaborative: сложные задачи
  if (strategy === 'thinking-first') {
    return 'collaborative';
  }

  // 5. Assistant по умолчанию (human-in-the-loop безопаснее)
  return 'assistant';
}

/**
 * Расчет уверенности в рекомендации
 */
function calculateConfidence(complexity: number, uncertainty: number): number {
  // Чем выше неопределенность, тем ниже уверенность
  const uncertaintyPenalty = uncertainty * 0.4;

  // Средняя сложность дает высокую уверенность
  const complexityBonus = Math.abs(complexity - 0.5) * 0.2;

  const confidence = 0.6 - uncertaintyPenalty + complexityBonus;

  return Math.max(0.3, Math.min(confidence, 0.95));
}

/**
 * Генерация обоснования выбора
 */
function generateReasoning(
  strategy: ExecutionStrategy,
  mode: OperationalMode,
  complexity: number,
  uncertainty: number,
  urgency: number
): string {
  const reasons: string[] = [];

  // Обоснование стратегии
  if (strategy === 'thinking-first') {
    if (complexity > 0.6) {
      reasons.push('Высокая сложность задачи требует детального планирования');
    }
    if (urgency < 0.5) {
      reasons.push('Низкая срочность позволяет уделить время планированию');
    }
  } else if (strategy === 'action-first') {
    if (complexity < 0.4) {
      reasons.push('Низкая сложность позволяет начать с действий');
    }
    if (urgency > 0.6) {
      reasons.push('Высокая срочность требует быстрых действий');
    }
  } else if (strategy === 'iterative') {
    if (uncertainty > 0.5) {
      reasons.push('Высокая неопределенность требует итеративного подхода');
    }
  }

  // Обоснование режима
  if (mode === 'autonomous') {
    reasons.push('Задача хорошо структурирована для автономного выполнения');
  } else if (mode === 'assistant') {
    reasons.push('Рекомендуется контроль человека на ключевых этапах');
  } else if (mode === 'collaborative') {
    reasons.push('Задача требует тесного взаимодействия с пользователем');
  } else if (mode === 'creative') {
    reasons.push('Задача требует креативного подхода и экспериментов');
  } else if (mode === 'learning') {
    reasons.push('Задача предполагает обучение и накопление опыта');
  }

  return reasons.join('. ');
}
```

---

## Задача 3.2: Coordinator (Координатор)

**packages/core/src/coordinator/leonardo-coordinator.ts**

```typescript
/**
 * Leonardo AI Coordinator - центральный координатор системы
 */

import {
  Task,
  TaskStatus,
  AgentResult,
  ExecutionStrategy,
  OperationalMode,
  LeonardoConfig
} from '@leonardo/shared/types';

import { analyzeTask, TaskAnalysis } from '../consciousness/task-analyzer';

export class LeonardoCoordinator {
  private config: LeonardoConfig;
  private agents: Map<string, any> = new Map();
  private tasks: Map<string, Task> = new Map();

  constructor(config: LeonardoConfig) {
    this.config = config;
  }

  /**
   * Зарегистрировать агента
   */
  registerAgent(id: string, agent: any): void {
    this.agents.set(id, agent);
    console.log(`[Leonardo] Registered agent: ${id}`);
  }

  /**
   * Выполнить задачу
   */
  async executeTask(task: Task): Promise<AgentResult> {
    console.log(`[Leonardo] Executing task: ${task.title}`);

    // 1. CONSCIOUSNESS LAYER: Анализируем задачу
    const analysis = await this.analyzeTaskWithConsciousness(task);

    console.log(`[Leonardo] Task analysis:`, {
      strategy: analysis.recommendedStrategy,
      mode: analysis.recommendedMode,
      confidence: analysis.confidence
    });

    // 2. Выбираем стратегию выполнения
    const strategy = analysis.recommendedStrategy;
    const mode = analysis.recommendedMode;

    // 3. Выполняем задачу в соответствии со стратегией
    let result: AgentResult;

    if (strategy === 'thinking-first') {
      result = await this.executeThinkingFirst(task, mode, analysis);
    } else if (strategy === 'action-first') {
      result = await this.executeActionFirst(task, mode, analysis);
    } else {
      result = await this.executeIterative(task, mode, analysis);
    }

    return result;
  }

  /**
   * Анализ задачи через Consciousness Layer
   */
  private async analyzeTaskWithConsciousness(task: Task): Promise<TaskAnalysis> {
    if (!this.config.consciousness.enabled) {
      // Если Consciousness Layer выключен, используем defaults
      return {
        complexity: 0.5,
        uncertainty: 0.5,
        urgency: 0.5,
        recommendedStrategy: this.config.defaultStrategy,
        recommendedMode: this.config.defaultMode,
        confidence: 0.7,
        reasoning: 'Using default configuration (Consciousness Layer disabled)'
      };
    }

    return await analyzeTask(task);
  }

  /**
   * Стратегия Thinking-First
   */
  private async executeThinkingFirst(
    task: Task,
    mode: OperationalMode,
    analysis: TaskAnalysis
  ): Promise<AgentResult> {
    console.log('[Leonardo] Strategy: THINKING-FIRST');

    const startTime = Date.now();
    const logs: any[] = [];

    try {
      // 1. COGNITIVE CORE: Планирование
      logs.push({
        level: 'info',
        message: 'Phase 1: Planning with Cognitive Core',
        timestamp: new Date()
      });

      const plan = await this.planWithCognitiveCore(task);

      // 2. Подтверждение пользователя (если mode = assistant/collaborative)
      if (mode === 'assistant' || mode === 'collaborative') {
        logs.push({
          level: 'info',
          message: 'Waiting for user approval of plan',
          timestamp: new Date()
        });

        // TODO: Реальная имплементация запроса подтверждения
        console.log('[Leonardo] Plan:', plan);
        console.log('[Leonardo] Waiting for user approval...');
      }

      // 3. ACTION CORE: Выполнение
      logs.push({
        level: 'info',
        message: 'Phase 2: Execution with Action Core',
        timestamp: new Date()
      });

      const executionResult = await this.executeWithActionCore(plan);

      // 4. CONSCIOUSNESS LAYER: Рефлексия
      logs.push({
        level: 'info',
        message: 'Phase 3: Reflection',
        timestamp: new Date()
      });

      await this.reflect(task, executionResult);

      return {
        status: 'completed',
        result: executionResult,
        metrics: {
          executionTime: Date.now() - startTime,
          tokensUsed: 0,
          apiCalls: 3
        },
        logs
      };

    } catch (error) {
      return {
        status: 'failed',
        error: error as Error,
        metrics: {
          executionTime: Date.now() - startTime,
          tokensUsed: 0,
          apiCalls: 0
        },
        logs
      };
    }
  }

  /**
   * Стратегия Action-First
   */
  private async executeActionFirst(
    task: Task,
    mode: OperationalMode,
    analysis: TaskAnalysis
  ): Promise<AgentResult> {
    console.log('[Leonardo] Strategy: ACTION-FIRST');

    const startTime = Date.now();
    const logs: any[] = [];

    try {
      // 1. ACTION CORE: Быстрое выполнение
      logs.push({
        level: 'info',
        message: 'Phase 1: Quick execution with Action Core',
        timestamp: new Date()
      });

      const executionResult = await this.executeWithActionCore(task);

      // 2. COGNITIVE CORE: Анализ результата
      logs.push({
        level: 'info',
        message: 'Phase 2: Analysis of results with Cognitive Core',
        timestamp: new Date()
      });

      const analysisResult = await this.analyzeResultWithCognitiveCore(executionResult);

      // 3. Корректировка при необходимости
      if (!analysisResult.success) {
        logs.push({
          level: 'warn',
          message: 'Action failed, adjusting approach',
          timestamp: new Date()
        });

        // TODO: Корректировка и повторная попытка
      }

      return {
        status: 'completed',
        result: executionResult,
        metrics: {
          executionTime: Date.now() - startTime,
          tokensUsed: 0,
          apiCalls: 2
        },
        logs
      };

    } catch (error) {
      return {
        status: 'failed',
        error: error as Error,
        metrics: {
          executionTime: Date.now() - startTime,
          tokensUsed: 0,
          apiCalls: 0
        },
        logs
      };
    }
  }

  /**
   * Стратегия Iterative
   */
  private async executeIterative(
    task: Task,
    mode: OperationalMode,
    analysis: TaskAnalysis
  ): Promise<AgentResult> {
    console.log('[Leonardo] Strategy: ITERATIVE');

    const startTime = Date.now();
    const logs: any[] = [];
    const iterations: any[] = [];

    try {
      let currentIteration = 0;
      const maxIterations = 5;
      let converged = false;

      while (currentIteration < maxIterations && !converged) {
        logs.push({
          level: 'info',
          message: `Iteration ${currentIteration + 1}/${maxIterations}`,
          timestamp: new Date()
        });

        // 1. Прототип (ACTION CORE)
        const prototype = await this.createPrototype(task, currentIteration);

        // 2. Обучение (COGNITIVE CORE)
        const learnings = await this.learnFromPrototype(prototype);

        // 3. Улучшение
        const improved = await this.improvePrototype(prototype, learnings);

        iterations.push({
          iteration: currentIteration + 1,
          prototype,
          learnings,
          improved
        });

        // 4. Проверка сходимости
        converged = learnings.confidence > 0.9;

        currentIteration++;
      }

      return {
        status: 'completed',
        result: {
          finalIteration: iterations[iterations.length - 1],
          allIterations: iterations,
          converged
        },
        metrics: {
          executionTime: Date.now() - startTime,
          tokensUsed: 0,
          apiCalls: currentIteration * 3
        },
        logs
      };

    } catch (error) {
      return {
        status: 'failed',
        error: error as Error,
        metrics: {
          executionTime: Date.now() - startTime,
          tokensUsed: 0,
          apiCalls: 0
        },
        logs
      };
    }
  }

  /**
   * Планирование через Cognitive Core
   */
  private async planWithCognitiveCore(task: Task): Promise<any> {
    // TODO: Интеграция с Orchestrator Kit
    console.log('[Cognitive Core] Planning task:', task.title);

    return {
      steps: [
        { id: 1, description: 'Step 1', status: 'pending' },
        { id: 2, description: 'Step 2', status: 'pending' },
        { id: 3, description: 'Step 3', status: 'pending' }
      ],
      estimatedTime: 1000,
      requiredResources: []
    };
  }

  /**
   * Выполнение через Action Core
   */
  private async executeWithActionCore(plan: any): Promise<any> {
    // TODO: Интеграция с OpenClaw
    console.log('[Action Core] Executing plan');

    return {
      success: true,
      result: 'Task completed successfully',
      executedSteps: plan.steps || []
    };
  }

  /**
   * Анализ результата через Cognitive Core
   */
  private async analyzeResultWithCognitiveCore(result: any): Promise<any> {
    console.log('[Cognitive Core] Analyzing result');

    return {
      success: true,
      quality: 0.9,
      suggestions: []
    };
  }

  /**
   * Рефлексия (Consciousness Layer)
   */
  private async reflect(task: Task, result: any): Promise<void> {
    if (!this.config.consciousness.enabled) {
      return;
    }

    console.log('[Consciousness Layer] Reflecting on task execution');

    // TODO: Сохранение опыта, обновление моделей
  }

  /**
   * Создание прототипа (для итеративной стратегии)
   */
  private async createPrototype(task: Task, iteration: number): Promise<any> {
    console.log(`[Action Core] Creating prototype #${iteration + 1}`);

    return {
      version: iteration + 1,
      features: [],
      quality: 0.5 + (iteration * 0.1)
    };
  }

  /**
   * Обучение на прототипе
   */
  private async learnFromPrototype(prototype: any): Promise<any> {
    console.log('[Cognitive Core] Learning from prototype');

    return {
      insights: [],
      improvements: [],
      confidence: prototype.quality
    };
  }

  /**
   * Улучшение прототипа
   */
  private async improvePrototype(prototype: any, learnings: any): Promise<any> {
    console.log('[Action Core] Improving prototype');

    return {
      ...prototype,
      version: prototype.version + 1,
      quality: Math.min(prototype.quality + 0.1, 1.0)
    };
  }
}
```

---

*Продолжение: Новые идеи и рационализации...*


---

# Новые идеи и рационализации

## 💡 Инновация 1: ML-Enhanced Task Analysis

### Концепция
Вместо rule-based анализа задач (как в `task-analyzer.ts`), использовать ML-модель для более точного определения стратегии.

### Архитектура

```typescript
// packages/core/src/consciousness/ml-task-analyzer.ts

import { Task, ExecutionStrategy } from '@leonardo/shared/types';
import * as tf from '@tensorflow/tfjs-node';

export class MLTaskAnalyzer {
  private model: tf.LayersModel | null = null;

  async loadModel(modelPath: string): Promise<void> {
    this.model = await tf.loadLayersModel(modelPath);
  }

  async analyzeTask(task: Task): Promise<{
    strategy: ExecutionStrategy;
    confidence: number;
  }> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    // 1. Векторизация задачи (TF-IDF или word embeddings)
    const taskVector = await this.vectorizeTask(task);

    // 2. Предсказание через модель
    const prediction = this.model.predict(taskVector) as tf.Tensor;
    const probabilities = await prediction.array() as number[][];

    // 3. Выбор стратегии с наивысшей вероятностью
    const strategies: ExecutionStrategy[] = ['thinking-first', 'action-first', 'iterative'];
    const maxIndex = probabilities[0].indexOf(Math.max(...probabilities[0]));

    return {
      strategy: strategies[maxIndex],
      confidence: probabilities[0][maxIndex]
    };
  }

  private async vectorizeTask(task: Task): Promise<tf.Tensor> {
    // TODO: Реальная векторизация (TF-IDF, BERT embeddings, etc.)
    const words = task.description.toLowerCase().split(' ');
    const vector = new Array(100).fill(0); // 100-dimensional vector

    // Простейшая bag-of-words
    words.forEach((word, index) => {
      if (index < 100) {
        vector[index] = word.length / 10;
      }
    });

    return tf.tensor2d([vector]);
  }
}
```

### Обучение модели

```python
# training/task_strategy_classifier.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
import tensorflow as tf

# 1. Загрузка данных
data = pd.read_csv('task_strategy_dataset.csv')
# Columns: task_description, strategy (0=thinking-first, 1=action-first, 2=iterative)

X = data['task_description']
y = pd.get_dummies(data['strategy']).values

# 2. Векторизация текста
vectorizer = TfidfVectorizer(max_features=100)
X_vectorized = vectorizer.fit_transform(X).toarray()

# 3. Разделение на train/test
X_train, X_test, y_train, y_test = train_test_split(
    X_vectorized, y, test_size=0.2, random_state=42
)

# 4. Создание модели
model = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(100,)),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(3, activation='softmax')
])

# 5. Компиляция
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# 6. Обучение
history = model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_data=(X_test, y_test)
)

# 7. Сохранение
model.save('models/task_strategy_classifier')

print(f"Final accuracy: {history.history['val_accuracy'][-1]:.2%}")
```

### Преимущества
- 📈 Точность выбора стратегии увеличивается с опытом
- 🧠 Учитывает сложные паттерны, недоступные rule-based системам
- 🔄 Self-improving: модель переобучается на новых данных

### Недостатки
- ⚠️ Требует dataset для обучения (минимум 1000+ примеров)
- ⚠️ Computational overhead (inference time)
- ⚠️ Сложность отладки ("black box")

---

## 💡 Инновация 2: Reinforcement Learning для Strategy Selection

### Концепция
Использовать Reinforcement Learning (PPO/DQN) для динамического выбора стратегии на основе прошлых результатов.

### Архитектура

```
┌──────────────────────────────────────┐
│       Leonardo AI with RL            │
└──────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│    RL Agent (PPO Algorithm)          │
│                                      │
│  State: [task_features, context]     │
│  Action: [strategy, mode]            │
│  Reward: task_success * (1/time)     │
└──────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│    Experience Replay Buffer          │
│  (store successful/failed attempts)  │
└──────────────────────────────────────┘
```

### Реализация (simplified)

```typescript
// packages/core/src/consciousness/rl-strategy-selector.ts

import * as tf from '@tensorflow/tfjs-node';

interface Experience {
  state: number[];
  action: number;
  reward: number;
  nextState: number[];
  done: boolean;
}

export class RLStrategySelector {
  private model: tf.LayersModel;
  private replayBuffer: Experience[] = [];
  private epsilon: number = 1.0; // exploration rate
  private epsilonDecay: number = 0.995;
  private epsilonMin: number = 0.01;

  constructor() {
    // Create Q-network
    this.model = this.buildModel();
  }

  private buildModel(): tf.LayersModel {
    const model = tf.sequential();

    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [10] // 10 features describing task
    }));

    model.add(tf.layers.dropout({ rate: 0.2 }));

    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));

    model.add(tf.layers.dropout({ rate: 0.2 }));

    model.add(tf.layers.dense({
      units: 3, // 3 strategies
      activation: 'linear' // Q-values
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    return model;
  }

  /**
   * Select strategy using ε-greedy policy
   */
  async selectStrategy(taskFeatures: number[]): Promise<number> {
    // Exploration
    if (Math.random() < this.epsilon) {
      return Math.floor(Math.random() * 3);
    }

    // Exploitation (use Q-network)
    const stateTensor = tf.tensor2d([taskFeatures]);
    const qValues = this.model.predict(stateTensor) as tf.Tensor;
    const qArray = await qValues.array() as number[][];

    return qArray[0].indexOf(Math.max(...qArray[0]));
  }

  /**
   * Store experience in replay buffer
   */
  storeExperience(experience: Experience): void {
    this.replayBuffer.push(experience);

    // Limit buffer size
    if (this.replayBuffer.length > 10000) {
      this.replayBuffer.shift();
    }
  }

  /**
   * Train the model using experience replay
   */
  async train(batchSize: number = 32): Promise<void> {
    if (this.replayBuffer.length < batchSize) {
      return;
    }

    // Sample random batch
    const batch = this.sampleBatch(batchSize);

    // Prepare training data
    const states: number[][] = [];
    const targets: number[][] = [];

    for (const exp of batch) {
      const stateTensor = tf.tensor2d([exp.state]);
      const nextStateTensor = tf.tensor2d([exp.nextState]);

      const currentQ = await (this.model.predict(stateTensor) as tf.Tensor).array() as number[][];
      const nextQ = await (this.model.predict(nextStateTensor) as tf.Tensor).array() as number[][];

      const target = currentQ[0].slice();
      
      if (exp.done) {
        target[exp.action] = exp.reward;
      } else {
        target[exp.action] = exp.reward + 0.99 * Math.max(...nextQ[0]);
      }

      states.push(exp.state);
      targets.push(target);
    }

    // Train
    await this.model.fit(
      tf.tensor2d(states),
      tf.tensor2d(targets),
      {
        epochs: 1,
        verbose: 0
      }
    );

    // Decay epsilon
    this.epsilon = Math.max(this.epsilonMin, this.epsilon * this.epsilonDecay);
  }

  private sampleBatch(batchSize: number): Experience[] {
    const shuffled = [...this.replayBuffer].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, batchSize);
  }
}
```

### Reward Function

```typescript
function calculateReward(taskResult: AgentResult, task: Task): number {
  let reward = 0;

  // Success/Failure
  if (taskResult.status === 'completed') {
    reward += 10;
  } else if (taskResult.status === 'failed') {
    reward -= 5;
  }

  // Time efficiency
  const expectedTime = estimateExpectedTime(task);
  const actualTime = taskResult.metrics.executionTime;
  
  if (actualTime < expectedTime) {
    reward += 5 * (expectedTime - actualTime) / expectedTime;
  } else {
    reward -= 3 * (actualTime - expectedTime) / expectedTime;
  }

  // Quality (if measurable)
  if (taskResult.metadata?.quality) {
    reward += taskResult.metadata.quality * 5;
  }

  return reward;
}
```

### Преимущества
- 🎯 Самообучающаяся система
- 📊 Оптимизирует выбор стратегии для конкретного контекста
- 🔄 Адаптируется к изменениям в задачах

### Недостатки
- ⚠️ Требует много времени для обучения (1000+ задач)
- ⚠️ Нестабильность на начальных этапах (high exploration)
- ⚠️ Сложность настройки hyperparameters

---

## 💡 Инновация 3: Multi-Agent Collaboration

### Концепция
Вместо одного Leonardo AI координатора, создать систему из нескольких специализированных Leonardo агентов, которые сотрудничают.

### Архитектура

```
┌─────────────────────────────────────────────┐
│     Meta-Leonardo (Orchestrator)             │
│  • Распределяет задачи между агентами       │
│  • Координирует коллаборацию                │
│  • Разрешает конфликты                      │
└─────────────────────────────────────────────┘
          │
          ├────────────┬────────────┬────────────┐
          ▼            ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Leonardo-Dev │ │Leonardo-Legal│ │ Leonardo-Ops │ │Leonardo-Data │
│              │ │              │ │              │ │              │
│ Разработка   │ │Юриспруденция│ │ DevOps       │ │ Data Science │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### Протокол коллаборации

```typescript
// packages/core/src/collaboration/multi-agent-protocol.ts

interface Message {
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification';
  payload: any;
  timestamp: Date;
}

export class MultiAgentCoordinator {
  private agents: Map<string, LeonardoAgent> = new Map();
  private messageQueue: Message[] = [];

  /**
   * Agent requests help from another agent
   */
  async requestHelp(
    fromAgent: string,
    toAgent: string,
    task: Task
  ): Promise<AgentResult> {
    const message: Message = {
      from: fromAgent,
      to: toAgent,
      type: 'request',
      payload: { task },
      timestamp: new Date()
    };

    this.messageQueue.push(message);

    // Route message to target agent
    const targetAgent = this.agents.get(toAgent);
    if (!targetAgent) {
      throw new Error(`Agent ${toAgent} not found`);
    }

    const result = await targetAgent.process(task);

    // Send response
    const response: Message = {
      from: toAgent,
      to: fromAgent,
      type: 'response',
      payload: { result },
      timestamp: new Date()
    };

    this.messageQueue.push(response);

    return result;
  }

  /**
   * Broadcast to all agents
   */
  broadcast(message: Message): void {
    this.agents.forEach((agent, id) => {
      if (id !== message.from) {
        agent.onMessage?.(message);
      }
    });
  }

  /**
   * Voting: agents vote on best strategy
   */
  async voteOnStrategy(task: Task): Promise<ExecutionStrategy> {
    const votes: ExecutionStrategy[] = [];

    for (const [id, agent] of this.agents) {
      const analysis = await agent.analyzeTask(task);
      votes.push(analysis.recommendedStrategy);
    }

    // Count votes
    const voteCounts = votes.reduce((acc, vote) => {
      acc[vote] = (acc[vote] || 0) + 1;
      return acc;
    }, {} as Record<ExecutionStrategy, number>);

    // Return strategy with most votes
    return Object.keys(voteCounts).reduce((a, b) =>
      voteCounts[a as ExecutionStrategy] > voteCounts[b as ExecutionStrategy] ? a : b
    ) as ExecutionStrategy;
  }
}
```

### Преимущества
- 🎯 Специализация: каждый агент эксперт в своей области
- 🤝 Коллаборация: агенты помогают друг другу
- 🧠 Collective intelligence: мудрость толпы

### Недостатки
- ⚠️ Высокая сложность координации
- ⚠️ Overhead от коммуникации между агентами
- ⚠️ Конфликты и disagreements

---

## 💡 Инновация 4: Blockchain для Transparency & Trust

### Концепция
Использовать blockchain для записи всех решений Leonardo AI, обеспечивая transparency и auditability.

### Архитектура

```typescript
// packages/core/src/blockchain/decision-ledger.ts

import { createHash } from 'crypto';

interface DecisionRecord {
  id: string;
  timestamp: Date;
  taskId: string;
  decision: {
    strategy: ExecutionStrategy;
    mode: OperationalMode;
    reasoning: string;
  };
  outcome: {
    status: TaskStatus;
    executionTime: number;
    quality?: number;
  };
  previousHash: string;
  hash: string;
}

export class DecisionLedger {
  private chain: DecisionRecord[] = [];

  /**
   * Add decision to ledger
   */
  addDecision(
    taskId: string,
    decision: any,
    outcome: any
  ): DecisionRecord {
    const previousHash = this.chain.length > 0
      ? this.chain[this.chain.length - 1].hash
      : '0';

    const record: Omit<DecisionRecord, 'hash'> = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      taskId,
      decision,
      outcome,
      previousHash
    };

    const hash = this.calculateHash(record);

    const fullRecord: DecisionRecord = {
      ...record,
      hash
    };

    this.chain.push(fullRecord);

    return fullRecord;
  }

  /**
   * Verify integrity of ledger
   */
  verify(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Check hash
      const recalculatedHash = this.calculateHash(current);
      if (current.hash !== recalculatedHash) {
        console.error(`Invalid hash at index ${i}`);
        return false;
      }

      // Check link to previous
      if (current.previousHash !== previous.hash) {
        console.error(`Broken chain at index ${i}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Get audit trail for task
   */
  getAuditTrail(taskId: string): DecisionRecord[] {
    return this.chain.filter(r => r.taskId === taskId);
  }

  private calculateHash(record: Omit<DecisionRecord, 'hash'>): string {
    const data = JSON.stringify(record);
    return createHash('sha256').update(data).digest('hex');
  }
}
```

### Преимущества
- 🔒 Immutable audit trail
- 🔍 Full transparency of decisions
- ✅ Trust & accountability

### Недостатки
- ⚠️ Storage overhead
- ⚠️ Performance impact
- ⚠️ Overkill для многих use cases

---

## 💡 Инновация 5: Adaptive Context Window

### Концепция
Динамически управлять context window для оптимизации token usage и качества ответов.

```typescript
// packages/core/src/context/adaptive-context-manager.ts

export class AdaptiveContextManager {
  private maxTokens: number = 200_000;
  private targetUtilization: number = 0.7; // 70% of max

  /**
   * Prioritize context based on relevance
   */
  async selectContext(
    task: Task,
    availableContext: {
      history: Message[];
      knowledgeBase: KnowledgeDocument[];
      codeContext: string[];
    }
  ): Promise<{
    selectedHistory: Message[];
    selectedKnowledge: KnowledgeDocument[];
    selectedCode: string[];
    estimatedTokens: number;
  }> {
    // 1. Calculate relevance scores
    const historyScores = this.scoreHistory(task, availableContext.history);
    const knowledgeScores = this.scoreKnowledge(task, availableContext.knowledgeBase);
    const codeScores = this.scoreCode(task, availableContext.codeContext);

    // 2. Sort by relevance
    const sortedHistory = this.sortByScore(availableContext.history, historyScores);
    const sortedKnowledge = this.sortByScore(availableContext.knowledgeBase, knowledgeScores);
    const sortedCode = this.sortByScore(availableContext.codeContext, codeScores);

    // 3. Select top items within token budget
    const targetTokens = this.maxTokens * this.targetUtilization;
    let usedTokens = 0;

    const selectedHistory: Message[] = [];
    const selectedKnowledge: KnowledgeDocument[] = [];
    const selectedCode: string[] = [];

    // Add history (highest priority)
    for (const msg of sortedHistory) {
      const tokens = this.estimateTokens(msg.content);
      if (usedTokens + tokens <= targetTokens * 0.3) { // 30% for history
        selectedHistory.push(msg);
        usedTokens += tokens;
      }
    }

    // Add knowledge
    for (const doc of sortedKnowledge) {
      const tokens = this.estimateTokens(doc.content);
      if (usedTokens + tokens <= targetTokens * 0.7) { // 70% budget so far
        selectedKnowledge.push(doc);
        usedTokens += tokens;
      }
    }

    // Add code
    for (const code of sortedCode) {
      const tokens = this.estimateTokens(code);
      if (usedTokens + tokens <= targetTokens) {
        selectedCode.push(code);
        usedTokens += tokens;
      }
    }

    return {
      selectedHistory,
      selectedKnowledge,
      selectedCode,
      estimatedTokens: usedTokens
    };
  }

  private scoreHistory(task: Task, history: Message[]): Map<Message, number> {
    // Score based on recency and relevance
    const scores = new Map<Message, number>();

    history.forEach((msg, index) => {
      let score = 0;

      // Recency: more recent = higher score
      score += (index / history.length) * 0.5;

      // Relevance: keyword overlap with task
      const taskWords = new Set(task.description.toLowerCase().split(' '));
      const msgWords = new Set(msg.content.toString().toLowerCase().split(' '));
      const overlap = new Set([...taskWords].filter(w => msgWords.has(w)));
      score += (overlap.size / taskWords.size) * 0.5;

      scores.set(msg, score);
    });

    return scores;
  }

  private scoreKnowledge(task: Task, knowledge: KnowledgeDocument[]): Map<KnowledgeDocument, number> {
    // TODO: Use semantic similarity (embeddings)
    return new Map();
  }

  private scoreCode(task: Task, code: string[]): Map<string, number> {
    // TODO: Use code analysis
    return new Map();
  }

  private sortByScore<T>(items: T[], scores: Map<T, number>): T[] {
    return items.sort((a, b) => {
      const scoreA = scores.get(a) || 0;
      const scoreB = scores.get(b) || 0;
      return scoreB - scoreA;
    });
  }

  private estimateTokens(content: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(content.length / 4);
  }
}
```

---

# Все варианты реализации

## Вариант 1: Минимальный (MVP)

**Сроки:** 2-3 недели
**Сложность:** ⭐ Низкая
**Рекомендуется для:** Быстрый прототип

### Состав:
- ✅ 1 агент (social-law-specialist)
- ✅ 1 навык (benefits-calculator)
- ✅ Базовая Consciousness Layer (rule-based)
- ✅ Simple Coordinator (без OpenClaw интеграции)

### Преимущества:
- 🚀 Быстрая реализация
- 💰 Низкие затраты
- ✅ Работающий прототип

### Недостатки:
- ⚠️ Ограниченная функциональность
- ⚠️ Нет ML компонентов
- ⚠️ Нет реальной коллаборации Cognitive+Action

---

## Вариант 2: Стандартный (Recommended)

**Сроки:** 6-8 недель
**Сложность:** ⭐⭐ Средняя
**Рекомендуется для:** Production-ready система

### Состав:
- ✅ 4 агента (social-law, labor-law, case-manager, household-manager)
- ✅ 5+ навыков
- ✅ Advanced Consciousness Layer (rule-based + heuristics)
- ✅ Full Coordinator с интеграцией Orchestrator Kit
- ✅ Basic OpenClaw integration (mock)
- ✅ Comprehensive tests (80%+ coverage)
- ✅ CI/CD pipeline

### Преимущества:
- ✅ Production-ready
- ✅ Достаточная функциональность
- ✅ Scalable architecture

### Недостатки:
- ⚠️ Нет ML компонентов
- ⚠️ Требует больше времени

---

## Вариант 3: Максимальный (Full Vision)

**Сроки:** 12-16 недель
**Сложность:** ⭐⭐⭐ Высокая
**Рекомендуется для:** R&D проект

### Состав:
- ✅ 10+ агентов (все категории)
- ✅ 20+ навыков
- ✅ ML-Enhanced Consciousness Layer
- ✅ RL-based Strategy Selection
- ✅ Multi-Agent Collaboration
- ✅ Full OpenClaw integration
- ✅ Blockchain Decision Ledger
- ✅ Adaptive Context Manager
- ✅ Real-time monitoring dashboard
- ✅ Extensive tests (95%+ coverage)

### Преимущества:
- 🚀 Cutting-edge AI system
- 🧠 Self-improving
- 📊 Full observability

### Недостатки:
- ⚠️ Высокая сложность
- ⚠️ Большие сроки
- ⚠️ Требует команду 3-5 человек

---

# Рекомендации по выбору варианта

## Если цель: Быстрая валидация концепции
→ **Вариант 1 (MVP)**

## Если цель: Production система для реальных пользователей
→ **Вариант 2 (Standard)**

## Если цель: Исследовательский проект / Стартап
→ **Вариант 3 (Full Vision)**

---

# Roadmap (с учетом всех вариантов)

## Q1 2026 (Февраль-Март) - Foundation ✅

**Статус:** В процессе

- [x] info7 v1.3.0 documentation complete
- [ ] Инфраструктура проекта (monorepo, CI/CD)
- [ ] Базовые типы и интерфейсы
- [ ] Первый агент (social-law-specialist)
- [ ] Первый навык (benefits-calculator)

**Deliverable:** MVP с 1 агентом

---

## Q2 2026 (Апрель-Июнь) - Expansion 🚀

**Цель:** Расширение функциональности

- [ ] 3 дополнительных агента
- [ ] 5+ навыков
- [ ] Leonardo AI Simple Coordinator
- [ ] Basic Consciousness Layer
- [ ] Integration tests

**Deliverable:** Leonardo AI v1.0 (Simple Coordinator)

---

## Q3 2026 (Июль-Сентябрь) - Intelligence 🧠

**Цель:** Добавление ML компонентов

- [ ] ML-based Task Analyzer
- [ ] Training dataset creation (1000+ tasks)
- [ ] Model training & evaluation
- [ ] A/B testing (rule-based vs ML)
- [ ] Performance optimization

**Deliverable:** Leonardo AI v1.5 (ML-Enhanced)

---

## Q4 2026 (Октябрь-Декабрь) - Collaboration 🤝

**Цель:** Multi-agent система

- [ ] Multi-Agent Protocol
- [ ] 10+ специализированных агентов
- [ ] Real OpenClaw integration
- [ ] RL-based Strategy Selection
- [ ] Decision Ledger (blockchain)

**Deliverable:** Leonardo AI v2.0 (Multi-Agent)

---

## 2027 - Maturity & Scale 📈

- [ ] 50+ агентов
- [ ] Advanced ML models (transformers, RL)
- [ ] Production deployment
- [ ] 100-200 early adopters
- [ ] Revenue: $100k-500k ARR

**Deliverable:** Leonardo AI Alpha

---

## 2028-2030 - Evolution 🌟

- [ ] AGI research integration
- [ ] 1000+ users
- [ ] Revenue: $5M-15M ARR
- [ ] Possible exit or Series A

**Deliverable:** Leonardo AI Beta → 1.0

---

# Метрики успеха

## Технические метрики

### Accuracy (Точность выбора стратегии)
- **Baseline (rule-based):** 70%
- **Target v1.5 (ML):** 85%
- **Target v2.0 (RL):** 90%+

### Execution Time
- **Thinking-First:** < 10s planning + execution
- **Action-First:** < 3s execution
- **Iterative:** < 5 iterations to convergence

### Token Efficiency
- **Context Management:** < 70% of max tokens used
- **API Calls:** Minimize redundant calls

## Бизнес-метрики

### User Adoption
- **Q2 2026:** 10 early testers
- **Q4 2026:** 50 users
- **2027:** 200 users
- **2030:** 5,000+ users

### Revenue (если коммерциализация)
- **2027:** $100k-500k ARR
- **2028:** $1M-3M ARR
- **2030:** $5M-15M ARR

### Customer Satisfaction
- **NPS:** > 50
- **Task Success Rate:** > 90%
- **User Retention:** > 80%

---

# Заключение

Этот детальный план покрывает:

✅ **Фаза 1 (Простое):** Инфраструктура проекта
✅ **Фаза 2 (Среднее):** Первые агенты с полным кодом
✅ **Фаза 3 (Сложное):** Leonardo AI прототип
✅ **Инновации:** 5 новых идей (ML, RL, Multi-Agent, Blockchain, Adaptive Context)
✅ **Варианты:** 3 варианта реализации (MVP, Standard, Full Vision)
✅ **Roadmap:** План на 2026-2030
✅ **Метрики:** Технические и бизнес-показатели

**Рекомендация:** Начать с **Варианта 1 (MVP)**, затем перейти к **Варианту 2 (Standard)**, и при успехе эволюционировать к **Варианту 3 (Full Vision)**.

**Следующий шаг:** Создать репозиторий `leonardo-ai` и начать с Фазы 1, Задача 1.1 (Настройка проектной структуры).

---

**Last Updated:** 2026-02-06
**Version:** 2.0.0-alpha
**Status:** Ready for implementation 🚀

https://claude.ai/code/session_01WnQdgU1MrECnhh3xfVNRAg

