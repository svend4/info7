# Orchestrator Kit - Справочник агентов

**Всего агентов:** 49 специализированных AI агентов

---

## 🗂️ По категориям

### 💼 Business (Бизнес) - 1 агент

| Агент | Что делает |
|-------|-----------|
| **lead-research-assistant** | Поиск и квалификация потенциальных клиентов, анализ целевой аудитории, составление стратегий контакта с приоритезацией |

---

### 🗄️ Database (База данных) - 7 агентов

| Агент | Что делает |
|-------|-----------|
| **database-architect** | Проектирование PostgreSQL схем, создание миграций, RLS политики, индексы, документация базы данных |
| **supabase-auditor** | Аудит безопасности БД, проверка RLS политик, анализ индексов, поиск уязвимостей, валидация схемы |
| **supabase-fixer** | Исправление проблем Supabase: RLS политики, индексы, function security, обработка advisor warnings |
| **supabase-realtime-optimizer** | Оптимизация Realtime подписок, исправление publication tables, payload optimization, connection issues |
| **supabase-storage-optimizer** | Оптимизация Storage: анализ размеров, поиск orphaned files, архивация, compression, cleanup |
| **api-builder** | Создание tRPC роутеров, authentication middleware, authorization policies, type-safe API endpoints |
| **qdrant-specialist** | Работа с Qdrant vector DB: коллекции, Jina-v3 embeddings, hybrid search, payload structures, troubleshooting |

---

### 💻 Development (Разработка) - 10 агентов

| Агент | Что делает |
|-------|-----------|
| **typescript-types-specialist** | Создание TypeScript interfaces, Zod schemas, shared types, type exports, generics, utility types |
| **code-reviewer** | Комплексный code review: quality, security, maintainability, best practices, генерация отчетов с оценками |
| **code-structure-refactorer** | Рефакторинг структуры проекта: consolidation, перемещение файлов, обновление imports, валидация тестов |
| **utility-builder** | Создание утилит: JSON repair, transformations, validation, XSS protection (DOMPurify), regex patterns |
| **skill-builder-v2** | Создание Claude Code Skills по формату SKILL.md, utility функции, validation logic, reusable tools |
| **llm-service-specialist** | LLM сервисы: OpenRouter API, token estimation, summarization, chunking, language detection |
| **langgraph-specialist** | LangGraph StateGraph workflows, typed state с Annotation, nodes, conditional edges, state machines |
| **stage-pipeline-specialist** | Course generation stages: документ classification, budget allocation, RAG planning, semantic scaffolding |
| **judge-specialist** | LLM Judge системы: OSCQR evaluation, CLEV voting, hallucination detection (logprob entropy), self-refinement |
| **cost-calculator-specialist** | OpenRouter cost calculation, model pricing, token-based billing, tier-based analytics |

---

### 📚 Documentation (Документация) - 1 агент

| Агент | Что делает |
|-------|-----------|
| **technical-writer** | Создание technical docs: README, API docs, quickstart guides, troubleshooting, developer-friendly documentation |

---

### 🎨 Frontend (Фронтенд) - 3 агента

| Агент | Что делает |
|-------|-----------|
| **fullstack-nextjs-specialist** | Full-stack разработка: Next.js 15+, Supabase, real-time, database operations, server-side architecture |
| **nextjs-ui-designer** | UI/UX дизайн: modern interfaces, shadcn/ui, accessibility, responsive design, brand-appropriate aesthetics |
| **visual-effects-creator** | Анимации и эффекты: Paper Shaders, MeshGradient, DotOrbit, animations, performance optimization |

---

### 🛡️ Health (Здоровье кодовой базы) - 10 агентов

| Агент | Что делает |
|-------|-----------|
| **bug-hunter** | Поиск багов: code validation, dead code, debug artifacts, security issues, performance problems, генерация отчетов |
| **bug-fixer** | Исправление багов из bug-hunting-report.md по приоритету с валидацией и progress tracking |
| **dead-code-hunter** | Поиск мертвого кода: Knip анализ, unused exports, dependencies, files, commented code, unreachable code |
| **dead-code-remover** | Удаление dead code: Knip --fix, automated cleanup, безопасное удаление unused exports/dependencies |
| **reuse-hunter** | Поиск дублирования: duplicated types, Zod schemas, constants, utilities, генерация consolidation tasks |
| **reuse-fixer** | Консолидация дублированного кода из reuse-hunting-report.md по Single Source of Truth pattern |
| **security-scanner** | Сканирование уязвимостей: SQL injection, XSS, auth issues, RLS validation, hardcoded secrets |
| **vulnerability-fixer** | Исправление уязвимостей из security-scan-report.md по priority level с validation |
| **dependency-auditor** | Анализ зависимостей: Knip для unused packages, security vulnerabilities, outdated packages |
| **dependency-updater** | Безопасное обновление dependencies по одной с validation и rollback |

---

### 🏗️ Infrastructure (Инфраструктура) - 9 агентов

| Агент | Что делает |
|-------|-----------|
| **deployment-engineer** | CI/CD pipelines, Docker, DevSecOps gates, GitOps, GitHub Actions, multi-stage builds, zero-downtime deployments |
| **infrastructure-specialist** | Setup внешних сервисов: Supabase, Qdrant, Redis, BullMQ, queue/worker infrastructure, service orchestration |
| **server-hardening-specialist** | Linux security: SSH hardening, firewall (ufw/iptables), fail2ban, intrusion prevention, system monitoring |
| **bullmq-worker-specialist** | BullMQ jobs: 30 concurrent workers, retry strategies, streaming progress, partial success handling |
| **orchestration-logic-specialist** | Workflow orchestration: BullMQ state machines, stage transitions, barrier enforcement, progress validation |
| **qdrant-specialist** | Qdrant operations: collections, embeddings, hybrid search debugging, vector indexing troubleshooting |
| **rag-specialist** | RAG context retrieval: Qdrant integration, section/lesson chunks, context caching, MMR search |
| **quality-validator-specialist** | Semantic similarity validation: Jina-v3 embeddings, cosine similarity, quality gates, retry logic |
| **server-hardening-specialist** | System administration: disk cleanup, memory monitoring, user management, systemd services, security audits |

---

### 🔌 Integrations (Интеграции) - 1 агент

| Агент | Что делает |
|-------|-----------|
| **lms-integration-specialist** | LMS интеграция: Open edX OLX generation, OAuth2, course packaging, LMS adapter patterns, REST API |

---

### 🤖 Meta (Мета-агенты) - 1 агент

| Агент | Что делает |
|-------|-----------|
| **meta-agent-v3** | Создание новых Claude Code агентов (workers, orchestrators, simple agents) по project architecture |

---

### 🔬 Research (Исследования) - 2 агента

| Агент | Что делает |
|-------|-----------|
| **research-specialist** | Technical research: LLM strategies, orchestration architecture, token budget, Context7-powered research |
| **problem-investigator** | Глубокое исследование проблем: root cause analysis, execution flow tracing, diagnostic data collection |

---

### 🧪 Testing (Тестирование) - 6 агентов

| Агент | Что делает |
|-------|-----------|
| **test-writer** | Unit/contract тесты: Vitest, mocking (Pino, LLM, tRPC), Zod validation tests, security testing (XSS) |
| **integration-tester** | Integration тесты: database schemas, API endpoints, async jobs, vector search, fixtures, validation |
| **accessibility-tester** | WCAG 2.1 AA/AAA compliance: screen reader validation, keyboard navigation, ARIA labels, color contrast |
| **mobile-responsiveness-tester** | Mobile тестирование: multiple viewports, layout issues, touch targets, генерация fixes для mobile UX |
| **mobile-fixes-implementer** | Автоматическое применение mobile fixes из test reports: CSS, JavaScript, viewport optimizations |
| **performance-optimizer** | Performance тестирование: Core Web Vitals, PageSpeed, LCP/FID/CLS optimization, bundle analysis |

---

## 🎯 По функциям

### Создание/Разработка
- **database-architect** - БД схемы
- **api-builder** - API endpoints
- **fullstack-nextjs-specialist** - Full-stack приложения
- **nextjs-ui-designer** - UI/UX дизайн
- **typescript-types-specialist** - Type definitions
- **utility-builder** - Utility функции
- **skill-builder-v2** - Claude Code Skills
- **meta-agent-v3** - Новые агенты

### Анализ/Аудит
- **code-reviewer** - Code review
- **supabase-auditor** - БД security audit
- **bug-hunter** - Поиск багов
- **dead-code-hunter** - Мертвый код
- **reuse-hunter** - Дублирование кода
- **security-scanner** - Уязвимости
- **dependency-auditor** - Анализ зависимостей
- **problem-investigator** - Root cause analysis

### Исправление/Оптимизация
- **bug-fixer** - Исправление багов
- **vulnerability-fixer** - Исправление уязвимостей
- **dead-code-remover** - Удаление dead code
- **reuse-fixer** - Консолидация кода
- **supabase-fixer** - Исправление Supabase issues
- **dependency-updater** - Обновление зависимостей
- **performance-optimizer** - Оптимизация производительности
- **mobile-fixes-implementer** - Mobile fixes

### Тестирование/Валидация
- **test-writer** - Unit тесты
- **integration-tester** - Integration тесты
- **accessibility-tester** - Accessibility
- **mobile-responsiveness-tester** - Mobile responsive
- **quality-validator-specialist** - Quality gates

### Инфраструктура/DevOps
- **deployment-engineer** - CI/CD, Docker
- **infrastructure-specialist** - Service setup
- **server-hardening-specialist** - Linux security
- **orchestration-logic-specialist** - Workflow orchestration

### Специализированные
- **llm-service-specialist** - LLM интеграция
- **langgraph-specialist** - LangGraph workflows
- **rag-specialist** - RAG context retrieval
- **qdrant-specialist** - Vector database
- **lms-integration-specialist** - LMS интеграция
- **visual-effects-creator** - Animations

---

## 📊 Статистика использования (по результатам тестов)

### ✅ Протестированные агенты (8)

| Агент | Проект | Результат | Оценка |
|-------|--------|-----------|--------|
| **bug-hunter** | Todo API | 18 багов найдено | Excellent |
| **bug-fixer** | Todo API | 7 critical/high исправлено | Excellent |
| **typescript-types-specialist** | Todo API | Type-safe архитектура | Excellent |
| **test-writer** | Todo API | 45 тестов, 92% coverage | Excellent |
| **code-reviewer** | Todo API | Score 8.2/10 | Good |
| **database-architect** | Task Manager Pro | 507 строк SQL, 19 RLS | Excellent |
| **fullstack-nextjs-specialist** | Task Manager Pro | 49 файлов, 5K LOC | Excellent |
| **supabase-auditor** | Task Manager Pro | Score 95/100 | Excellent |
| **nextjs-ui-designer** | Task Manager Pro | Modern UI, WCAG AA | Excellent |

### 📋 Рекомендуемые для тестирования

**Производительность:**
- performance-optimizer
- supabase-storage-optimizer
- supabase-realtime-optimizer

**Безопасность:**
- security-scanner + vulnerability-fixer
- server-hardening-specialist

**Качество кода:**
- dead-code-hunter + dead-code-remover
- reuse-hunter + reuse-fixer
- dependency-auditor + dependency-updater

**Тестирование:**
- integration-tester
- accessibility-tester
- mobile-responsiveness-tester

---

## 🚀 Как использовать

### Прямой вызов агента
```bash
# В Claude Code CLI
/task database-architect "Create PostgreSQL schema for blog app"
```

### Через Task tool (в коде)
```typescript
Task({
  subagent_type: "database-architect",
  description: "Design database schema",
  prompt: "Create schema for blog application..."
})
```

### Workflows (здоровье кодовой базы)
```bash
/health-bugs      # bug-hunter → bug-fixer
/health-security  # security-scanner → vulnerability-fixer
/health-cleanup   # dead-code-hunter → dead-code-remover
/health-deps      # dependency-auditor → dependency-updater
```

---

## 💡 Рекомендации по выбору агента

**Если нужно:**
- **Создать БД** → database-architect
- **Создать API** → api-builder
- **Создать Full-stack app** → fullstack-nextjs-specialist
- **Красивый UI** → nextjs-ui-designer
- **Найти баги** → bug-hunter
- **Исправить баги** → bug-fixer
- **Написать тесты** → test-writer
- **Code review** → code-reviewer
- **Проверить безопасность БД** → supabase-auditor
- **Найти уязвимости** → security-scanner
- **Оптимизировать производительность** → performance-optimizer
- **WCAG compliance** → accessibility-tester
- **Mobile responsive** → mobile-responsiveness-tester
- **CI/CD pipeline** → deployment-engineer
- **Создать нового агента** → meta-agent-v3
- **Research** → research-specialist или problem-investigator

---

**Последнее обновление:** 2026-02-02
**Версия Orchestrator Kit:** 1.0
**Всего агентов:** 49
