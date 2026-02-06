# FAQ - Часто задаваемые вопросы

**Версия:** 1.0
**Дата:** 2026-02-06
**Язык:** Русский + English

---

## 📚 Содержание

1. [Общие вопросы](#общие-вопросы)
2. [Технические вопросы](#технические-вопросы)
3. [OpenClaw](#вопросы-про-openclaw)
4. [Orchestrator Kit](#вопросы-про-orchestrator-kit)
5. [Leonardo AI](#вопросы-про-leonardo-ai)
6. [Бизнес и инвестиции](#бизнес-и-инвестиции)
7. [Участие в проекте](#участие-в-проекте)

---

## Общие вопросы

### Q: Что такое info7?

**A:** info7 - это комплексное исследование систем оркестрации AI-агентов, которое:
- Анализирует две существующие системы (OpenClaw и Orchestrator Kit)
- Сравнивает их через призму философии "физика и лирика"
- Предлагает концепцию идеальной системы (Leonardo AI)
- Предоставляет практическую дорожную карту реализации

**Объем:** 17 документов, ~155,000 слов
**Статус:** Исследование завершено, переход к практике

---

### Q: Для кого этот проект?

**A:** Проект полезен для:

**Разработчиков:**
- Выбор подходящей AI-системы для проекта
- Понимание архитектурных паттернов
- Практические примеры имплементации

**Архитекторов:**
- Проектирование AI-систем
- Понимание trade-offs разных подходов
- Reference architecture (Leonardo AI)

**Исследователей:**
- Философский анализ AI-систем
- Футурологические сценарии
- Академические публикации

**Бизнеса:**
- Оценка рынка AI-оркестрации
- Выбор решения для автоматизации
- Инвестиционные возможности

---

### Q: Это open source проект?

**A:** Да! Документация info7 - полностью open source.

**Компоненты:**
- ✅ Документация (info7) - Open Source
- ✅ OpenClaw - Open Source (MIT)
- ✅ Orchestrator Kit - Open Source
- 📋 Leonardo AI - планируется Open Source (когда будет реализован)

**Контрибьюции приветствуются!** См. [CONTRIBUTING.md](CONTRIBUTING.md)

---

### Q: Какую систему выбрать: OpenClaw или Orchestrator Kit?

**A:** Быстрое правило:

**Выбирайте OpenClaw если:**
- ✅ Нужна автоматизация (email, календарь, напоминания)
- ✅ Нужна интеграция с мессенджерами
- ✅ Нужен умный дом / IoT
- ✅ Работаете с публичными данными
- ⚠️ НО следите за безопасностью!

**Выбирайте Orchestrator Kit если:**
- ✅ Разрабатываете софтвер
- ✅ Нужна архитектура и дизайн
- ✅ Есть техническая команда
- ✅ Работаете с чувствительными данными

**Подробнее:** См. [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

### Q: Leonardo AI - это реальный продукт?

**A:** Пока нет. Leonardo AI - это:

**Сейчас (2026):**
- 📚 Концепция и детальная спецификация
- 📚 Философское обоснование
- 📚 Дорожная карта реализации

**Будущее:**
- 📋 Q2-Q4 2026: Прототип
- 📋 2027: Альфа-версия
- 📋 2028: Бета-версия
- 📋 2029-2030: Релиз 1.0

**Можно уже сейчас:**
- Изучать концепцию
- Планировать интеграцию
- Участвовать в разработке

---

### Q: Почему "Физика и Лирика"?

**A:** Это метафора из советского спора 1960-х годов между "физиками" (технари) и "лириками" (гуманитарии).

**В контексте AI:**
- **Физики (OpenClaw)** - практичность, действие, реальный мир
- **Лирики (Orchestrator Kit)** - идеализм, планирование, архитектура
- **Синтез (Leonardo AI)** - объединение обоих подходов

**Философия:**
Спор не имеет победителя. Нужны оба подхода. Leonardo AI - это "Леонардо да Винчи", который был и физиком, и лириком одновременно.

**Подробнее:** См. [PHILOSOPHICAL_ANALYSIS.md](PHILOSOPHICAL_ANALYSIS.md)

---

## Технические вопросы

### Q: Какие технологии используются?

**A:** Технологический стек:

**OpenClaw:**
- Node.js
- Messenger APIs (Telegram, WhatsApp, Discord, Slack)
- IoT protocols (MQTT, Zigbee)
- Voice recognition

**Orchestrator Kit:**
- TypeScript 5.3+
- Claude Code SDK
- MCP (Model Context Protocol)
- Zod для валидации

**Leonardo AI (планируется):**
- TypeScript + Python
- ML frameworks (TensorFlow, PyTorch)
- Claude API + OpenAI API
- Docker + Kubernetes

---

### Q: Можно ли использовать обе системы одновременно?

**A:** Да! И это именно то, что делает Leonardo AI.

**Текущий подход (manual):**
1. Используйте Orchestrator Kit для планирования и архитектуры
2. Экспортируйте план
3. Используйте OpenClaw для выполнения автоматизации

**Будущий подход (Leonardo AI):**
- Автоматическая координация обеих систем
- Consciousness Layer выбирает оптимальную стратегию
- Seamless интеграция

**Пример:**
```typescript
// Сейчас (manual)
const plan = await orchestratorKit.createPlan(task);
// Manually transfer plan
const result = await openClaw.execute(manuallyConvertedPlan);

// С Leonardo AI (future)
const result = await leonardoAI.solve(task);
// Автоматически выбирает thinking vs action
```

---

### Q: Какие требования к железу?

**A:** Минимальные требования:

**Для использования OpenClaw:**
- CPU: 2+ cores
- RAM: 4GB+
- Storage: 50GB+
- OS: Linux/macOS/Windows

**Для использования Orchestrator Kit:**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 100GB+
- OS: Linux/macOS

**Для разработки Leonardo AI:**
- CPU: 8+ cores
- RAM: 32GB+
- GPU: NVIDIA 16GB+ VRAM (для ML)
- Storage: 500GB+ SSD
- OS: Linux (Ubuntu 22.04+)

**Подробнее:** См. [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md#технические-требования)

---

### Q: Сколько это стоит?

**A:** Зависит от использования:

**OpenClaw:**
- Self-hosting: Бесплатно (+ API costs ~$10-50/мес)
- Cloud providers: ~$50-200/мес

**Orchestrator Kit:**
- Claude API: ~$50-500/мес (зависит от объема)
- Infrastructure: ~$50-200/мес

**Leonardo AI (планируемая цена):**
- Free tier: Базовые функции
- Pro: $49-99/мес
- Enterprise: $500-5000/мес

**Для разработки:**
- Бюджет: ~$1000-2000/мес (API + infrastructure)

---

### Q: Безопасно ли использовать OpenClaw?

**A:** ⚠️ С оговорками.

**Известные проблемы:**
- 230+ вредоносных навыков обнаружено
- Слабая песочница
- Минимальная валидация ввода

**Рекомендации:**
- ✅ Используйте только проверенные навыки
- ✅ Не используйте с чувствительными данными
- ✅ Регулярно обновляйте
- ✅ Следите за security advisories
- ❌ Не используйте в production для критичных систем

**Альтернатива:** Orchestrator Kit (более безопасен)

---

### Q: Как мигрировать с OpenClaw на Leonardo AI?

**A:** Поэтапная миграция:

**Фаза 1 (2026):**
- Продолжайте использовать OpenClaw
- Тестируйте прототип Leonardo AI параллельно
- Не переносите production workload

**Фаза 2 (2027):**
- Начните переносить некритичные задачи на Leonardo AI Alpha
- 20-30% workload на Leonardo AI
- Мониторинг производительности и стабильности

**Фаза 3 (2028):**
- Увеличьте до 50-70% workload
- Leonardo AI Beta
- Подготовка к полной миграции

**Фаза 4 (2029-2030):**
- Полная миграция на Leonardo AI 1.0
- OpenClaw только для legacy задач
- Eventual complete migration

**Риск:** Средний
**Время:** 3-4 года

---

## Вопросы про OpenClaw

### Q: Что такое OpenClaw (Moltbot)?

**A:** OpenClaw (ранее Moltbot, Clawdbot) - это open source платформа для AI-автоматизации.

**Ключевые features:**
- 🤖 Messenger-интеграция (Telegram, WhatsApp, Discord, Slack)
- 📧 Email automation
- 🏠 Smart home / IoT
- 🗣️ Voice commands
- 🔌 500+ community навыков

**GitHub:** 147,000+ ⭐
**Статус:** Production (с проблемами безопасности)
**Лицензия:** MIT

---

### Q: Как установить OpenClaw?

**A:** Быстрая установка:

```bash
# 1. Клонировать репозиторий
git clone https://github.com/openclaw/openclaw
cd openclaw

# 2. Установить зависимости
npm install

# 3. Настроить конфигурацию
cp .env.example .env
# Отредактируйте .env - добавьте API keys

# 4. Запустить
npm start
```

**Требуемые API keys:**
- Telegram Bot Token (для Telegram интеграции)
- OpenAI/Claude API key (для AI модели)
- Email credentials (для email автоматизации)

**Подробная документация:** https://github.com/openclaw/openclaw/wiki

---

### Q: Почему 230+ вредоносных навыков в OpenClaw?

**A:** Проблема community-driven навыков:

**Причины:**
- ❌ Отсутствие строгой модерации
- ❌ Любой может публиковать навыки
- ❌ Слабая валидация кода
- ❌ Отсутствие песочницы

**Типы вредоносных навыков:**
- Сбор приватных данных
- Выполнение произвольного кода
- Backdoors
- Криптомайнеры

**Митигация:**
- ✅ Используйте только официальные навыки
- ✅ Проверяйте код навыков перед установкой
- ✅ Используйте firewall и мониторинг
- ✅ Регулярные security audits

**Статус:** Команда OpenClaw работает над решением

---

## Вопросы про Orchestrator Kit

### Q: Что такое Orchestrator Kit?

**A:** Orchestrator Kit - это система оркестрации AI-агентов для разработки софтвера.

**Ключевые features:**
- 👥 59 специализированных агентов
- 🛠️ 51 навык (skills)
- 💻 41 slash-команда
- 🔧 Интеграция с Claude Code CLI
- 📋 SpecKit (спецификация-ориентированная разработка)
- ✅ Quality Gates (автоматическая валидация)

**Статус:** Beta (активная разработка)
**Лицензия:** Open Source

---

### Q: Как установить Orchestrator Kit?

**A:** Установка через Claude Code CLI:

```bash
# 1. Установить Claude Code CLI
# macOS/Linux:
curl -fsSL https://claude.ai/install.sh | sh

# Windows:
# Скачайте с https://claude.ai/code

# 2. Настроить API key
claude config set api-key YOUR_ANTHROPIC_API_KEY

# 3. Клонировать Orchestrator Kit
git clone https://github.com/maslennikov-ig/claude-code-orchestrator-kit
cd claude-code-orchestrator-kit

# 4. Установить зависимости
npm install

# 5. Инициализировать
npm run init

# 6. Использовать
claude /architect "Design REST API for e-commerce"
```

**Требования:**
- Claude Code CLI
- Anthropic API key
- Node.js 18+
- TypeScript 5.3+

---

### Q: Чем Orchestrator Kit отличается от обычного Claude?

**A:** Orchestrator Kit расширяет Claude специализированными агентами:

**Обычный Claude:**
- Универсальный AI-ассистент
- Один контекст
- Общие знания

**Orchestrator Kit:**
- 59 специализированных агентов (architect, developer, tester, DBA, DevOps, etc.)
- Каждый агент с глубокой экспертизой
- Workflow orchestration (цепочки агентов)
- Quality Gates (автоматическая валидация)
- SpecKit (спецификации)
- Beads (Git-based issue tracking)

**Пример:**
```typescript
// Обычный Claude
"Создай REST API для e-commerce"
// → Один большой ответ

// Orchestrator Kit
/architect "Design REST API for e-commerce"
// → Architect создает детальную архитектуру
/developer "Implement user service"
// → Developer пишет код
/tester "Test user service"
// → Tester создает тесты
/devops "Deploy to staging"
// → DevOps разворачивает
```

---

### Q: Можно ли добавить свои агенты в Orchestrator Kit?

**A:** Да! Это одна из целей проекта info7.

**Примеры новых агентов (из info7):**
- 👨‍⚖️ social-law-specialist (юрист по социальному праву)
- 👥 case-manager (социальный работник)
- 🏠 household-manager (домоправитель)
- 👵 personal-caregiver (сиделка)

**Как добавить свой агент:**
1. См. [example-social-law-agent.md](example-social-law-agent.md)
2. Следуйте структуре из [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
3. Реализуйте на TypeScript
4. Добавьте тесты
5. Создайте Pull Request

---

## Вопросы про Leonardo AI

### Q: Когда будет доступен Leonardo AI?

**A:** Прогнозируемый timeline:

**Q2-Q4 2026:** Прототип
- Базовая интеграция OpenClaw + Orchestrator Kit
- Simple Coordinator (rule-based)
- Закрытое тестирование

**2027:** Альфа-версия
- ML-based Consciousness Layer
- Все 5 режимов работы
- Партнерские внедрения

**2028:** Бета-версия
- Промышленное тестирование
- Enterprise features
- Публичная бета

**2029-2030:** Релиз 1.0
- Production-ready
- Полная документация
- Enterprise support

**Можно уже сейчас:**
- Изучать документацию
- Планировать интеграцию
- Участвовать в разработке

---

### Q: Почему Leonardo AI, а не другое название?

**A:** Леонардо да Винчи - символ универсального гения:

**Исторический Leonardo da Vinci:**
- 🎨 Художник (Мона Лиза, Тайная вечеря)
- 🔬 Ученый (анатомия, физика)
- 🏗️ Инженер (летательные аппараты, мосты)
- 📐 Архитектор (городское планирование)
- 💡 Изобретатель (танки, подводные лодки)

**Leonardo AI:**
- 🧠 Thinking (Cognitive Core - от Orchestrator Kit)
- 💪 Action (Action Core - от OpenClaw)
- 🎨 Creativity (Creative mode)
- 🤝 Collaboration (Collaborative mode)
- 📚 Learning (Learning mode)

**Философия:** Объединение "физики и лирики", мысли и действия, теории и практики.

---

### Q: В чем уникальность Leonardo AI?

**A:** Несколько ключевых отличий:

**1. Consciousness Layer (слой самосознания):**
- Система осознает свои действия
- Выбирает оптимальную стратегию
- Учится на опыте

**2. Dual-Core Architecture (двухъядерная архитектура):**
- Cognitive Core (мышление)
- Action Core (действие)
- Seamless интеграция

**3. Adaptive Strategy (адаптивная стратегия):**
- Thinking-first (сначала думать)
- Action-first (сначала действовать)
- Iterative (чередовать)

**4. True Synthesis (настоящий синтез):**
- Не просто комбинация двух систем
- Новое качество через интеграцию
- Больше, чем сумма частей

**Аналогия:**
```
OpenClaw + Orchestrator Kit = 1 + 1 = 2
Leonardo AI = 1 + 1 = 3 (синергия)
```

---

### Q: Можно ли уже сейчас протестировать Leonardo AI?

**A:** Частично, через manual integration:

**Что можно сделать сейчас:**
1. Установить обе системы (OpenClaw + Orchestrator Kit)
2. Вручную координировать между ними
3. Использовать Orchestrator для планирования
4. Использовать OpenClaw для выполнения

**Что будет в прототипе (Q2-Q4 2026):**
- Simple Coordinator (автоматическая координация)
- Базовая интеграция
- Rule-based логика

**Что будет в Alpha (2027):**
- ML-based Consciousness Layer
- Автоматический выбор стратегии
- Self-learning

**Хотите участвовать в разработке?**
См. [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Бизнес и инвестиции

### Q: Какой размер рынка AI-оркестрации?

**A:** Значительный и растущий:

**Оценка рынка:**
- TAM (Total Addressable Market): $50B+ (2026)
- SAM (Serviceable Available Market): $15B+ (2026)
- SOM (Serviceable Obtainable Market): $500M+ (2026)

**CAGR (Compound Annual Growth Rate):** 25-30% (2026-2030)

**Драйверы роста:**
- Автоматизация становится критичной
- AI-агенты everywhere
- Enterprise adoption растет
- Developer productivity tools

**Конкуренты:**
- OpenAI (GPTs, Assistants API)
- Anthropic (Claude, MCP)
- LangChain / LlamaIndex
- Специализированные решения

**Возможность:** Leonardo AI может занять нишу "синтез thinking + action"

---

### Q: Какая бизнес-модель у Leonardo AI?

**A:** Планируемая модель: Freemium + Enterprise

**Free Tier:**
- Базовые функции
- 100 запросов/день
- Community support
- Public documentation

**Pro Tier ($49-99/месяц):**
- Расширенные функции
- 10,000 запросов/день
- Priority support
- Advanced analytics

**Enterprise Tier ($500-5000/месяц):**
- Все функции
- Unlimited запросы
- Dedicated support
- Custom integrations
- SLA гарантии
- On-premise deployment

**Дополнительные revenue streams:**
- Consulting services
- Training programs
- Custom agent development

---

### Q: Сколько нужно инвестиций?

**A:** Phased approach:

**Seed Round (2026): $500k-1M**
- Команда: 3-5 человек на год
- Infrastructure: API costs, серверы
- Marketing: Community building

**Use of funds:**
- 50% Personnel (engineers, ML specialists)
- 30% Infrastructure (API, cloud, tools)
- 15% Marketing (community, content)
- 5% Legal/Admin

**Series A (2027-2028): $3M-5M**
- Масштабирование: 10-15 человек
- Enterprise features
- Sales & Marketing

**Expected milestones:**
- Seed → Prototype + Alpha (100+ users)
- Series A → Beta + 1.0 (1000+ users)

---

### Q: Каков прогноз revenue?

**A:** Зависит от сценария:

**Conservative (50% probability):**
- 2027: $100k-200k ARR (100-200 Pro users)
- 2028: $500k-1M ARR (500-1000 Pro users)
- 2029: $2M-3M ARR (2k-3k Pro users)
- 2030: $5M ARR

**Realistic (30% probability):**
- 2027: $300k-500k ARR
- 2028: $1M-2M ARR
- 2029: $5M-8M ARR
- 2030: $10M-15M ARR

**Optimistic (20% probability):**
- 2027: $500k-1M ARR
- 2028: $3M-5M ARR
- 2029: $10M-15M ARR
- 2030: $20M+ ARR

**Assumptions:**
- Average price: $70/month (Pro) + $2000/month (Enterprise)
- Conversion rate: 5% free → Pro
- Enterprise: 1% of Pro users
- Churn: 5% monthly

**Подробнее:** См. [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)

---

### Q: Какие риски для инвесторов?

**A:** Основные риски:

**1. Технические риски (Medium-High):**
- Интеграция сложнее, чем ожидается
- Производительность недостаточна
- ML-модели не работают как задумано

**Митигация:** Итеративный подход, early prototyping

**2. Рыночные риски (Medium):**
- OpenAI/Anthropic выпускают похожее решение
- Рынок не готов к сложности
- Конкуренция от стартапов

**Митигация:** Быстрая итерация, уникальная архитектура (синтез)

**3. Execution риски (High):**
- Недостаток ресурсов
- Трудности с наймом
- Технический долг

**Митигация:** Опытная команда, четкая roadmap

**4. Regulatory риски (Low-Medium):**
- AI регулирование
- Privacy требования
- Сертификация

**Митигация:** Compliance с самого начала

**Overall risk:** Medium
**Expected return:** 5-30x за 4-5 лет

---

## Участие в проекте

### Q: Как я могу помочь проекту?

**A:** Много способов участвовать:

**Для разработчиков:**
1. 🔨 Имплементация агентов (см. [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md))
2. 🐛 Bug reports и fixes
3. 📝 Code review
4. 🧪 Тестирование
5. 📚 Улучшение документации

**Для исследователей:**
1. 📖 Расширение философского анализа
2. 🔬 Академические публикации
3. 🎓 Обучающие материалы
4. 🗣️ Презентации на конференциях

**Для бизнеса:**
1. 💼 Early adoption и feedback
2. 🤝 Партнерства
3. 💰 Инвестиции
4. 🎯 Use case development

**Для всех:**
1. ⭐ GitHub star
2. 🐦 Sharing в соцсетях
3. 💬 Обсуждения в Issues
4. 📢 Рекомендации коллегам

**Начните с:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

### Q: Нужны ли мне специальные навыки?

**A:** Зависит от типа контрибьюции:

**Не требуют технических навыков:**
- ✅ Улучшение документации
- ✅ Переводы
- ✅ Создание туториалов
- ✅ Тестирование как пользователь
- ✅ Фидбек и предложения

**Требуют базовых технических навыков:**
- TypeScript/JavaScript
- Git/GitHub
- Markdown
- Базовое понимание AI

**Требуют продвинутых навыков:**
- Machine Learning
- Distributed systems
- Cloud infrastructure
- System architecture

**Важно:** Любой вклад ценен! Даже исправление опечатки помогает проекту.

---

### Q: Как стать early adopter Leonardo AI?

**A:** Процесс:

**Шаг 1: Регистрация интереса**
- [TBD: Форма регистрации]
- Укажите ваш use case
- Техническая экспертиза

**Шаг 2: Закрытая альфа (Q2-Q4 2026)**
- 10-20 участников
- NDA required
- Еженедельный feedback
- Прямое общение с командой

**Шаг 3: Закрытая бета (2027)**
- 100-200 участников
- Early access к новым функциям
- Влияние на roadmap
- Special pricing

**Шаг 4: Публичная бета (2028)**
- 1000+ участников
- Открытая регистрация
- Beta pricing

**Benefits early adopters:**
- 🎁 Lifetime discount (50%)
- 🎯 Влияние на product direction
- 🤝 Прямой доступ к команде
- 📚 Exclusive content
- 🏆 Recognition в community

---

### Q: Где обсудить проект?

**A:** Несколько каналов:

**GitHub:**
- Issues: Баги, feature requests
- Discussions: Общие вопросы
- Pull Requests: Контрибьюции

**Социальные сети:**
- [TBD: Discord сервер]
- [TBD: Telegram группа]
- [TBD: Twitter/X аккаунт]

**Email:**
- Technical: [TBD]
- Business: [TBD]
- Press: [TBD]

**Конференции и встречи:**
- [TBD: Meetups]
- [TBD: Hackathons]

---

### Q: Можно ли использовать материалы info7 в своих проектах?

**A:** Да! С указанием источника.

**Лицензия:** [TBD - вероятно MIT или CC BY]

**Можно:**
- ✅ Использовать в коммерческих проектах
- ✅ Модифицировать
- ✅ Распространять
- ✅ Создавать производные работы

**Требования:**
- ✅ Указать источник (info7)
- ✅ Сохранить лицензию
- ✅ Указать изменения (если есть)

**Примеры использования:**
- Статьи и блог-посты
- Презентации
- Обучающие материалы
- Академические публикации
- Коммерческие продукты

---

## Дополнительные вопросы

### Q: Где найти больше информации?

**A:** Полная документация в проекте info7:

**Быстрый старт:**
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Выбор за 30 секунд
- [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) - Резюме для руководителей

**Технические детали:**
- [OPENCLAW_VS_ORCHESTRATOR_DETAILED.md](OPENCLAW_VS_ORCHESTRATOR_DETAILED.md) - Сравнение
- [LEONARDO_AI_DETAILED.md](LEONARDO_AI_DETAILED.md) - Архитектура Leonardo AI
- [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) - Дорожная карта

**Философия:**
- [PHILOSOPHICAL_ANALYSIS.md](PHILOSOPHICAL_ANALYSIS.md) - 40,000 слов анализа

**Практика:**
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Как добавить агентов
- [example-social-law-agent.md](example-social-law-agent.md) - Примеры кода

---

### Q: Как следить за обновлениями?

**A:** Несколько способов:

**GitHub:**
- ⭐ Star репозиторий
- 👀 Watch → All Activity
- 🔔 Notifications включены

**Документация:**
- Проверяйте "Последнее обновление" в README.ru.md
- Changelog (TBD)

**Социальные сети:**
- [TBD: Newsletter]
- [TBD: Twitter/X]
- [TBD: LinkedIn]

**Обновления планируются:** Каждые 3 месяца или при важных изменениях

---

### Q: Не нашли ответ на свой вопрос?

**A:** Несколько вариантов:

1. **Проверьте документацию:**
   - README.ru.md - главное оглавление
   - 17 детальных документов

2. **GitHub Issues:**
   - Поищите существующие issues
   - Создайте новый issue с вопросом

3. **Community:**
   - [TBD: Discord/Telegram]
   - Спросите в GitHub Discussions

4. **Email:**
   - [TBD: Support email]

**Мы постоянно улучшаем FAQ!** Ваш вопрос может помочь другим.

---

## 🌟 Заключение

info7 - это больше, чем просто документация. Это:

- 📚 Исследование (~155,000 слов)
- 🏗️ Архитектура (Leonardo AI)
- 🚀 Roadmap (2026-2030)
- 🤝 Community (формируется)
- 💡 Философия ("Физика и Лирика")

**Присоединяйтесь к нам в создании будущего AI-оркестрации!**

---

**Версия FAQ:** 1.0
**Последнее обновление:** 2026-02-06
**Следующее обновление:** Каждые 3 месяца

**Предложения по FAQ?** Создайте Issue на GitHub или Pull Request.

https://claude.ai/code/session_01WnQdgU1MrECnhh3xfVNRAg
