# Getting Started for Developers

**Дата:** 2026-02-06
**Версия:** 1.0
**Для кого:** Разработчики, готовые начать реализацию Leonardo AI

---

## 🎯 Цель этого документа

Этот документ - **пошаговая инструкция** для разработчиков, которые хотят начать практическую реализацию Leonardo AI на основе документации info7.

**Время чтения:** 15 минут
**Время выполнения:** 1-2 недели (для MVP)

---

## 📚 Что нужно прочитать ПЕРЕД началом

### Обязательно (30 минут):

1. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - 5 минут
   - Понимание концепции Leonardo AI
   - Три системы: OpenClaw, Orchestrator Kit, Leonardo AI

2. **[IMPLEMENTATION_PLAN_DETAILED.md](IMPLEMENTATION_PLAN_DETAILED.md)** - 20 минут
   - Детальный технический план
   - Примеры кода (~2000 строк)
   - Архитектура всех компонентов

3. **[ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)** - 5 минут
   - Визуальные диаграммы системы
   - Понимание data flow

### Опционально (1-2 часа):

- **[LEONARDO_AI_DETAILED.md](LEONARDO_AI_DETAILED.md)** - Полное описание архитектуры
- **[IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)** - Roadmap на 2026-2030
- **[CURRENT_DEVELOPMENT_STAGE.md](CURRENT_DEVELOPMENT_STAGE.md)** - Текущее состояние

---

## 🛠️ Необходимые инструменты

### 1. Runtime & Package Manager

```bash
# Node.js 20+ (обязательно)
node --version  # должно быть v20.0.0 или выше

# pnpm (рекомендуется для monorepo)
npm install -g pnpm
pnpm --version  # должно быть v8.0.0 или выше

# Альтернатива: npm или yarn (но pnpm предпочтительнее)
```

### 2. TypeScript & Build Tools

```bash
# TypeScript (установится автоматически)
# Turbo (для быстрой сборки monorepo)
npm install -g turbo
```

### 3. IDE / Editor

**Рекомендуется:**
- VS Code с расширениями:
  - TypeScript
  - ESLint
  - Prettier
  - GitLens

**Альтернативы:**
- WebStorm
- Cursor
- Claude Code CLI (для AI-assisted coding)

### 4. Git

```bash
git --version  # v2.30.0 или выше
```

---

## 🚀 Быстрый старт (MVP за 2-3 недели)

### Неделя 1: Инфраструктура (Фаза 1)

#### День 1-2: Создание проекта

```bash
# 1. Создаем директорию проекта
mkdir leonardo-ai
cd leonardo-ai

# 2. Инициализируем pnpm workspace
pnpm init

# 3. Создаем структуру
mkdir -p packages/core/src
mkdir -p packages/shared/types/src
mkdir -p packages/agents/legal/social-law-specialist/src
mkdir -p packages/skills/legal/benefits-calculator/src
mkdir -p apps/cli/src
mkdir -p .github/workflows

# 4. Создаем pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
  - 'packages/agents/**'
  - 'packages/skills/**'
  - 'apps/*'
EOF

# 5. Копируем конфигурационные файлы из IMPLEMENTATION_PLAN_DETAILED.md
# (package.json, tsconfig.json, turbo.json)
```

#### День 3: TypeScript настройка

**Скопируйте из IMPLEMENTATION_PLAN_DETAILED.md:**
- Корневой `package.json` (секция: Шаг 1.2.2)
- `tsconfig.json` (секция: Шаг 1.2.5)
- `turbo.json` (секция: Шаг 1.2.4)

```bash
# Установка зависимостей
pnpm install

# Проверка работы
pnpm run type-check
```

#### День 4-5: Базовые типы

**Создайте файл `packages/shared/types/src/index.ts`**

Скопируйте код из IMPLEMENTATION_PLAN_DETAILED.md (секция: Задача 1.3).

Это ~500 строк TypeScript интерфейсов для:
- `Task`, `Agent`, `Skill`, `Message`
- `OperationalMode`, `ExecutionStrategy`
- `AgentConfig`, `AgentContext`, `AgentResult`
- И многое другое

```bash
# Проверка компиляции типов
cd packages/shared/types
pnpm run build
```

#### День 6-7: CI/CD

**Создайте `.github/workflows/ci.yml`**

Скопируйте из IMPLEMENTATION_PLAN_DETAILED.md (секция: Задача 1.4).

```bash
# Проверка локально
pnpm run lint
pnpm run type-check
pnpm run build
```

**✅ Чеклист Недели 1:**
- [ ] Создана структура monorepo
- [ ] Установлен pnpm и все зависимости
- [ ] TypeScript конфигурация работает
- [ ] Базовые типы скомпилированы
- [ ] CI/CD настроен
- [ ] `pnpm run build` выполняется успешно

---

### Неделя 2: Первый агент (Фаза 2, часть 1)

#### День 1-2: База знаний

**Создайте файлы:**

1. `packages/agents/legal/social-law-specialist/src/knowledge-base/laws/fz-178.ts`
2. `packages/agents/legal/social-law-specialist/src/knowledge-base/laws/fz-181.ts`
3. `packages/agents/legal/social-law-specialist/src/knowledge-base/laws/fz-400.ts`

Скопируйте код из IMPLEMENTATION_PLAN_DETAILED.md (секция: Шаг 2.1.1).

**Пример ФЗ-178:**

```typescript
import { KnowledgeDocument } from '@leonardo/shared/types';

export const FZ_178: KnowledgeDocument = {
  id: 'fz-178',
  type: 'law',
  title: 'ФЗ-178 "О государственной социальной помощи"',
  content: `...`,
  category: 'social-law',
  tags: ['социальная помощь', 'пособия'],
  // ... остальные поля
};
```

#### День 3-4: Калькулятор льгот

**Создайте файл:**
`packages/skills/legal/benefits-calculator/src/calculators/federal.ts`

Скопируйте полный код из IMPLEMENTATION_PLAN_DETAILED.md (секция: Шаг 2.1.2).

Это ~300 строк логики для расчета:
- Материнского капитала
- Пособий на детей
- Льгот многодетным семьям
- Жилищных субсидий

```typescript
import { calculateFederalBenefits, FamilyData } from './federal';

// Тестовый запуск
const familyData: FamilyData = {
  members: 4,
  children: 2,
  childrenAges: [3, 5],
  totalIncome: 40000,
  region: 'москва'
};

const result = await calculateFederalBenefits(familyData);
console.log(result);
// → { success: true, data: { eligible: true, totalAmount: XXX, benefits: [...] } }
```

#### День 5-7: Агент (основная логика)

**Создайте файл:**
`packages/agents/legal/social-law-specialist/src/agent.ts`

Скопируйте код из IMPLEMENTATION_PLAN_DETAILED.md (секция: Шаг 2.1.3).

Это ~450 строк класса `SocialLawSpecialist` с методами:
- `process()` - обработка запроса пользователя
- `analyzeIntent()` - анализ намерения
- `calculateBenefits()` - расчет льгот
- `explainLaw()` - разъяснение законодательства
- `checkEligibility()` - проверка права на помощь
- `helpWithDocuments()` - помощь с документами

```typescript
import { SocialLawSpecialist } from './agent';

const agent = new SocialLawSpecialist();

const result = await agent.process(
  'Семья из 4 человек, доход 40000, 2 детей (3 и 5 лет), Москва',
  context
);

console.log(result.result.message);
// → Детальный расчет всех положенных льгот
```

**✅ Чеклист Недели 2:**
- [ ] База знаний создана (3 закона)
- [ ] Калькулятор льгот работает
- [ ] Агент SocialLawSpecialist реализован
- [ ] Можно протестировать вручную
- [ ] Код компилируется без ошибок

---

### Неделя 3: Тесты + Leonardo Coordinator (MVP)

#### День 1-3: Тесты агента

**Создайте файл:**
`packages/agents/legal/social-law-specialist/tests/agent.test.ts`

Скопируйте из IMPLEMENTATION_PLAN_DETAILED.md (секция: Шаг 2.1.4).

```bash
# Установка Vitest
pnpm add -D vitest

# Запуск тестов
pnpm run test
```

**Цель:** Coverage >80%

#### День 4-5: Leonardo Coordinator (Simple)

**Создайте файл:**
`packages/core/src/coordinator/leonardo-coordinator.ts`

Скопируйте код из IMPLEMENTATION_PLAN_DETAILED.md (секция: Задача 3.2).

Это базовая версия координатора с:
- Регистрацией агентов
- Выполнением задач
- 3 стратегиями (Thinking-First, Action-First, Iterative)

```typescript
import { LeonardoCoordinator } from './leonardo-coordinator';
import { SocialLawSpecialist } from '@leonardo/agents/legal/social-law-specialist';

const coordinator = new LeonardoCoordinator(config);
coordinator.registerAgent('social-law', new SocialLawSpecialist());

const task = {
  id: 'task-1',
  title: 'Calculate benefits',
  description: 'Family of 4, income 40000, 2 kids, Moscow',
  status: 'pending',
  // ...
};

const result = await coordinator.executeTask(task);
```

#### День 6-7: CLI приложение

**Создайте файл:**
`apps/cli/src/index.ts`

```typescript
import { LeonardoCoordinator } from '@leonardo/core';
import { SocialLawSpecialist } from '@leonardo/agents/legal/social-law-specialist';

async function main() {
  const coordinator = new LeonardoCoordinator({
    defaultMode: 'assistant',
    defaultStrategy: 'thinking-first',
    consciousness: { enabled: false },
    // ... остальная конфигурация
  });

  coordinator.registerAgent('social-law', new SocialLawSpecialist());

  console.log('Leonardo AI v1.0 MVP');
  console.log('Type your question...');

  // TODO: REPL loop для интерактивного ввода
}

main();
```

**✅ Чеклист Недели 3:**
- [ ] Тесты написаны (coverage >80%)
- [ ] Leonardo Coordinator работает
- [ ] CLI приложение запускается
- [ ] Можно задать вопрос и получить ответ
- [ ] **MVP ГОТОВ! 🎉**

---

## 🎯 Что дальше после MVP?

### Вариант A: Standard (6-8 недель)

Продолжить по IMPLEMENTATION_PLAN_DETAILED.md:
- Добавить 3 дополнительных агента (labor-law, case-manager, household-manager)
- Реализовать Consciousness Layer (Task Analyzer)
- Добавить больше навыков (skills)
- Интеграция с Orchestrator Kit (Cognitive Core)
- Production deployment

### Вариант B: Full Vision (12-16 недель)

Все из Варианта A плюс:
- ML-Enhanced Task Analysis
- RL-based Strategy Selection
- Multi-Agent Collaboration
- Blockchain Decision Ledger
- Adaptive Context Window
- Full OpenClaw integration

---

## 📖 Полезные ресурсы

### Документация info7:

- **[IMPLEMENTATION_PLAN_DETAILED.md](IMPLEMENTATION_PLAN_DETAILED.md)** - Основной источник кода
- **[ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)** - Диаграммы
- **[FAQ.md](FAQ.md)** - Часто задаваемые вопросы

### Внешние ресурсы:

- **TypeScript:** https://www.typescriptlang.org/docs/
- **pnpm workspaces:** https://pnpm.io/workspaces
- **Turbo:** https://turbo.build/repo/docs
- **Vitest:** https://vitest.dev/
- **Claude API:** https://docs.anthropic.com/

---

## ⚠️ Частые проблемы и решения

### Проблема 1: "Cannot find module '@leonardo/...'"

**Причина:** TypeScript не видит пути в monorepo

**Решение:**
1. Проверьте `tsconfig.json` → `paths`
2. Проверьте `pnpm-workspace.yaml`
3. Перезапустите VS Code
4. Выполните `pnpm install` в корне

### Проблема 2: "pnpm run build" не работает

**Причина:** Неправильный порядок сборки пакетов

**Решение:**
1. Проверьте `turbo.json` → `dependsOn: ["^build"]`
2. Удалите `node_modules` и переустановите:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

### Проблема 3: Тесты падают

**Причина:** Vitest не настроен для TypeScript paths

**Решение:**
Добавьте в `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@leonardo/core': path.resolve(__dirname, 'packages/core/src'),
      '@leonardo/shared/types': path.resolve(__dirname, 'packages/shared/types/src'),
      // ... остальные aliases
    },
  },
});
```

---

## 💬 Поддержка

### Вопросы и обсуждения:

- **GitHub Discussions:** Задавайте вопросы
- **GitHub Issues:** Сообщайте о багах
- **Pull Requests:** Вносите улучшения

### Полезные команды:

```bash
# Проверка всего проекта
pnpm run lint        # Линтинг
pnpm run type-check  # Проверка типов
pnpm run test        # Запуск тестов
pnpm run build       # Сборка всех пакетов

# Очистка
pnpm run clean       # Удалить node_modules и dist
rm -rf node_modules  # Полная очистка

# Добавление зависимостей
pnpm add <package>                    # В корень
pnpm add <package> --filter @leonardo/core  # В конкретный пакет
```

---

## 🎯 Контрольные точки

### После Недели 1:
- [ ] `pnpm run build` успешно
- [ ] Типы компилируются
- [ ] CI/CD проходит

### После Недели 2:
- [ ] Агент SocialLawSpecialist отвечает на вопросы
- [ ] Калькулятор льгот работает корректно
- [ ] Можно протестировать вручную

### После Недели 3:
- [ ] Тесты проходят (coverage >80%)
- [ ] CLI приложение работает
- [ ] **MVP демонстрируется пользователям**

---

## 🚀 Готовы начать?

1. ✅ Прочитали [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
2. ✅ Прочитали [IMPLEMENTATION_PLAN_DETAILED.md](IMPLEMENTATION_PLAN_DETAILED.md)
3. ✅ Установили все необходимые инструменты
4. ✅ Готовы писать код

**Тогда вперёд! Создавайте директорию `leonardo-ai` и начинайте с Недели 1, День 1!** 🎉

---

**Версия:** 1.0
**Последнее обновление:** 2026-02-06
**Лицензия:** MIT

Удачи в разработке Leonardo AI! 🚀

https://claude.ai/code/session_01WnQdgU1MrECnhh3xfVNRAg
