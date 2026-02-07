# Info7 - Структура проекта и навигационная карта

**Версия:** 1.3.0 | **Дата:** 2026-02-06 | **Файлов:** 33 | **Слов:** ~204,000

Полная визуальная карта и навигационное руководство по всем файлам проекта.

---

## 📂 Дерево проекта

```
info7/
│
├── 📄 Основная документация (2 файла)
│   ├── README.md (EN) ────────────────────── Международная главная страница
│   └── README.ru.md (RU) ─────────────────── Полная русская версия
│
├── 🎯 Руководства быстрого старта (3 файла)
│   ├── PROJECT_SUMMARY.md (~5k) ──────────── Полный обзор за 5 минут ⭐ НАЧНИТЕ ЗДЕСЬ
│   ├── QUICK_REFERENCE.md (~7k) ──────────── Выбор системы за 30 секунд
│   └── EXECUTIVE_SUMMARY.md (~5k) ────────── Для руководителей и инвесторов
│
├── 🔬 Исследования и анализ (6 файлов, ~95k слов)
│   ├── LEONARDO_AI_DETAILED.md (~25k) ────── Часть 1: Архитектура и возможности
│   ├── LEONARDO_AI_PART2.md (~25k) ───────── Часть 2: Реализация и будущее
│   ├── PHILOSOPHICAL_ANALYSIS.md (~40k) ──── Глубокий анализ "Физики и лирики"
│   ├── OPENCLAW_VS_ORCHESTRATOR_DETAILED.md (~15k) ─ Техническое сравнение
│   ├── PRACTICAL_COMPARISON_EXAMPLES.md ──── Сценарии реального использования
│   └── PRACTITIONER_VS_THEORIST_ANALYSIS.md ─ Классификационный фреймворк
│
├── 🏗️ Архитектура и визуализация (2 файла, ~13k слов)
│   ├── ARCHITECTURE.md (~7k) ─────────────── ASCII-диаграммы для всех систем
│   └── ARCHITECTURE_DIAGRAMS.md (~6k) ────── Интерактивные Mermaid диаграммы 🎨
│
├── 📊 Планирование и дорожная карта (3 файла, ~23k слов)
│   ├── IMPLEMENTATION_ROADMAP.md (~10k) ──── Практический план реализации
│   ├── CURRENT_DEVELOPMENT_STAGE.md (~8k) ── Текущее состояние всех проектов
│   └── ROADMAP_VISUAL.md (~5k) ───────────── Визуальная временная шкала 2022-2035
│
├── 👨‍⚖️ Профессиональные категории (5 файлов, ~20k слов)
│   ├── NEW_AGENTS_STRUCTURE.md ───────────── 20 новых агентов (юридические, социальные и др.)
│   ├── example-social-law-agent.md ───────── Полный пример агента
│   ├── example-social-law-command.md ─────── Пример slash-команды
│   ├── example-benefits-calculator-skill.md ─ Реализация навыка
│   └── INTEGRATION_GUIDE.md ──────────────── Пошаговая интеграция
│
├── 🤝 Сообщество и участие (3 файла, ~18k слов)
│   ├── FAQ.md (~8k) ──────────────────────── 50+ часто задаваемых вопросов
│   ├── CONTRIBUTING.md (~6k) ─────────────── Руководство для контрибьюторов с примерами
│   └── CODE_OF_CONDUCT.md (~4k) ──────────── Кодекс поведения сообщества
│
├── 🔒 Безопасность и управление (2 файла, ~4k слов)
│   ├── SECURITY.md (~4k) ─────────────────── Политика безопасности и раскрытие уязвимостей
│   └── LICENSE ───────────────────────────── Лицензия MIT
│
├── 📝 Управление проектом (3 файла)
│   ├── CHANGELOG.md ──────────────────────── История версий (v0.1 → v1.3.0)
│   ├── PULL_REQUEST.md ───────────────────── Описание PR и чек-лист
│   └── PROJECT_STRUCTURE.md ──────────────── Английская версия этого файла
│   └── PROJECT_STRUCTURE.ru.md ────────────── Этот файл 📍 ВЫ ЗДЕСЬ
│
├── .gitignore ────────────────────────────── Профессиональный Node.js/TypeScript
│
└── .github/ (4 файла)
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md ─────────────────── Шаблон отчета об ошибке
    │   ├── feature_request.md ────────────── Шаблон предложения функции
    │   └── question.md ───────────────────── Шаблон вопроса
    └── pull_request_template.md ──────────── Шаблон PR с чек-листом
```

---

## 🎯 Навигация по назначению

### 🚀 "Я хочу быстро начать"

**Начните здесь:** [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- Чтение за 5 минут, полный обзор
- Объяснены все три системы
- Лучшая отправная точка для новичков

**Затем:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Выбор системы за 30 секунд
- Дерево решений и сравнительная таблица

### 💼 "Я представитель бизнеса или инвестор"

1. [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) - Бизнес-кейс (60 секунд)
2. [ROADMAP_VISUAL.md](ROADMAP_VISUAL.md) - Временная шкала и вехи
3. [CURRENT_DEVELOPMENT_STAGE.md](CURRENT_DEVELOPMENT_STAGE.md) - Текущее состояние
4. [FAQ.md](FAQ.md) - Бизнес-вопросы и инвестиции

### 🔧 "Я разработчик, желающий внедрить"

1. [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) - Практический план
2. [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) - Интерактивные диаграммы
3. [NEW_AGENTS_STRUCTURE.md](NEW_AGENTS_STRUCTURE.md) - Структура 20 агентов
4. [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Пошаговое руководство
5. [CONTRIBUTING.md](CONTRIBUTING.md) - Как помочь

### 🎓 "Я исследователь, изучающий AI-оркестрацию"

1. [PHILOSOPHICAL_ANALYSIS.md](PHILOSOPHICAL_ANALYSIS.md) - Глубокий культурный анализ
2. [LEONARDO_AI_DETAILED.md](LEONARDO_AI_DETAILED.md) - Теория архитектуры
3. [LEONARDO_AI_PART2.md](LEONARDO_AI_PART2.md) - Видение будущего
4. [OPENCLAW_VS_ORCHESTRATOR_DETAILED.md](OPENCLAW_VS_ORCHESTRATOR_DETAILED.md) - Сравнение

### 🏗️ "Я хочу понять архитектуру"

1. [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) - Mermaid диаграммы (рендерятся на GitHub)
2. [ARCHITECTURE.md](ARCHITECTURE.md) - ASCII диаграммы (для терминала)
3. [PRACTICAL_COMPARISON_EXAMPLES.md](PRACTICAL_COMPARISON_EXAMPLES.md) - Реальные примеры

### 🤝 "Я хочу внести вклад или присоединиться к сообществу"

1. [CONTRIBUTING.md](CONTRIBUTING.md) - Руководство для контрибьюторов
2. [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Стандарты сообщества
3. [FAQ.md](FAQ.md) - Общие вопросы
4. [SECURITY.md](SECURITY.md) - Политика безопасности

---

## 📊 Файлы по размеру

### Большие документы (10k+ слов)
| Файл | Слов | Назначение |
|------|-------|------------|
| PHILOSOPHICAL_ANALYSIS.md | ~40,000 | Культурный и философский глубокий анализ |
| LEONARDO_AI_DETAILED.md | ~25,000 | Архитектура Часть 1 |
| LEONARDO_AI_PART2.md | ~25,000 | Реализация Часть 2 |
| OPENCLAW_VS_ORCHESTRATOR_DETAILED.md | ~15,000 | Техническое сравнение |
| IMPLEMENTATION_ROADMAP.md | ~10,000 | Практический план |

### Средние документы (5k-10k слов)
| Файл | Слов | Назначение |
|------|-------|------------|
| FAQ.md | ~8,000 | 50+ вопросов и ответов |
| CURRENT_DEVELOPMENT_STAGE.md | ~8,000 | Текущее состояние |
| ARCHITECTURE.md | ~7,000 | ASCII диаграммы |
| QUICK_REFERENCE.md | ~7,000 | Быстрое руководство по выбору |
| ARCHITECTURE_DIAGRAMS.md | ~6,000 | Mermaid диаграммы |
| CONTRIBUTING.md | ~6,000 | Руководство для контрибьюторов |
| EXECUTIVE_SUMMARY.md | ~5,000 | Бизнес-резюме |
| PROJECT_SUMMARY.md | ~5,000 | Полный обзор |
| ROADMAP_VISUAL.md | ~5,000 | Визуальная временная шкала |

### Малые документы (<5k слов)
| Файл | Слов | Назначение |
|------|-------|------------|
| CODE_OF_CONDUCT.md | ~4,000 | Стандарты сообщества |
| SECURITY.md | ~4,000 | Политика безопасности |
| README.ru.md | ~4,000 | Русская главная страница |
| README.md | ~2,000 | Английская главная страница |
| NEW_AGENTS_STRUCTURE.md | ~3,000 | Структура агентов |
| Другие файлы | Разное | Примеры, шаблоны, конфигурации |

---

## 🎨 Файлы по типу

### 📖 Документация
```
Основные (2):        README.md, README.ru.md
Руководства (3):     PROJECT_SUMMARY.md, QUICK_REFERENCE.md, EXECUTIVE_SUMMARY.md
Исследования (6):    LEONARDO_AI_*.md, PHILOSOPHICAL_ANALYSIS.md и др.
Архитектура (2):     ARCHITECTURE.md, ARCHITECTURE_DIAGRAMS.md
Планирование (3):    IMPLEMENTATION_ROADMAP.md, CURRENT_DEVELOPMENT_STAGE.md и др.
Профессиональные (5): NEW_AGENTS_STRUCTURE.md, примеры, INTEGRATION_GUIDE.md
Сообщество (3):      FAQ.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md
Управление (3):      CHANGELOG.md, PULL_REQUEST.md, PROJECT_STRUCTURE.md

Всего: 27 markdown файлов
```

### 🏗️ Инфраструктура
```
Безопасность (2):    SECURITY.md, LICENSE
Конфигурация (1):    .gitignore
Шаблоны (4):         .github/ISSUE_TEMPLATE/*, pull_request_template.md

Всего: 6 файлов инфраструктуры
```

---

## 🔑 Ключевые особенности по файлам

### 🌟 Обязательные к прочтению файлы

#### PROJECT_SUMMARY.md ⭐
**Почему:** Полный 5-минутный обзор всего
**Содержит:**
- Объяснены все три системы
- Философский фундамент
- Дорожная карта и бизнес-потенциал
- Технологический стек
- Как использовать документацию

#### LEONARDO_AI_DETAILED.md + PART2.md 🧠
**Почему:** Основная инновация проекта
**Содержит:**
- Архитектура Corpus Callosum
- 5 операционных режимов
- 3 стратегии (Thinking/Action/Iterative)
- Дорожная карта реализации 2026-2030
- Видение будущего до 2100+

#### PHILOSOPHICAL_ANALYSIS.md 🎭
**Почему:** Уникальная культурная перспектива
**Содержит:**
- "Физики и лирики" (советский спор 1960-х)
- Дон Кихот против Санчо Пансы
- Синтез Леонардо да Винчи
- Историческая эволюция
- Параллели с научной фантастикой (Азимов, Гибсон и др.)

### 🛠️ Наиболее практичные файлы

#### QUICK_REFERENCE.md ⚡
**Используйте когда:** Нужно выбрать систему СЕЙЧАС
**Особенности:**
- Дерево решений за 30 секунд
- Сравнительная таблица по 25+ критериям
- Фреймворк светофора (🟢🟡🔴)
- 5 практических сценариев

#### IMPLEMENTATION_ROADMAP.md 🚀
**Используйте когда:** Готовы к реализации
**Особенности:**
- Детальный план Q1-Q4 2026
- Примеры кода на TypeScript
- Метрики успеха
- Оценки бюджета (~$1000-2000/месяц)

#### INTEGRATION_GUIDE.md 🔗
**Используйте когда:** Интегрируетесь с Orchestrator Kit
**Особенности:**
- Пошаговые инструкции
- Файловая структура
- Руководство по тестированию
- Устранение неполадок

### 📊 Наиболее визуальные файлы

#### ARCHITECTURE_DIAGRAMS.md 🎨
**Лучше для:** Понимания архитектуры
**Особенности:**
- 15+ Mermaid диаграмм
- Автоматический рендеринг на GitHub
- Интерактивные и масштабируемые
- Блок-схемы, последовательности, таймлайны, Gantt

#### ROADMAP_VISUAL.md 📈
**Лучше для:** Понимания временной шкалы
**Особенности:**
- ASCII временная шкала 2022-2035
- Разбивка по годам
- 7 вех с прогресс-барами
- Матрица рисков

---

## 📚 Пути чтения

### Путь 1: Быстрый старт (30 минут)
```
1. PROJECT_SUMMARY.md (5 мин) ──────────── Обзор
2. QUICK_REFERENCE.md (10 мин) ─────────── Выбор системы
3. ARCHITECTURE_DIAGRAMS.md (15 мин) ───── Визуализация
```

### Путь 2: Бизнес-трек (1 час)
```
1. EXECUTIVE_SUMMARY.md (5 мин) ────────── Бизнес-кейс
2. PROJECT_SUMMARY.md (10 мин) ─────────── Полный обзор
3. ROADMAP_VISUAL.md (15 мин) ──────────── Временная шкала
4. CURRENT_DEVELOPMENT_STAGE.md (15 мин) ─ Текущее состояние
5. FAQ.md - Раздел бизнеса (15 мин) ────── Вопросы и ответы
```

### Путь 3: Трек разработчика (2-3 часа)
```
1. PROJECT_SUMMARY.md (10 мин) ─────────── Обзор
2. ARCHITECTURE_DIAGRAMS.md (30 мин) ───── Архитектура
3. IMPLEMENTATION_ROADMAP.md (45 мин) ──── План
4. NEW_AGENTS_STRUCTURE.md (30 мин) ────── Структура
5. INTEGRATION_GUIDE.md (30 мин) ───────── Интеграция
6. CONTRIBUTING.md (15 мин) ────────────── Как помочь
```

### Путь 4: Трек исследователя (8-10 часов)
```
1. PROJECT_SUMMARY.md (15 мин) ─────────────────── Обзор
2. PHILOSOPHICAL_ANALYSIS.md (3 часа) ─────────── Философия
3. LEONARDO_AI_DETAILED.md (2 часа) ───────────── Архитектура
4. LEONARDO_AI_PART2.md (2 часа) ──────────────── Будущее
5. OPENCLAW_VS_ORCHESTRATOR_DETAILED.md (1 час) ─ Сравнение
6. Все остальные технические файлы (2 часа) ───── Глубокое погружение
```

### Путь 5: Полное чтение (20+ часов)
```
Прочитайте все 33 файла по порядку:
1. Основные → 2. Быстрый старт → 3. Исследования → 4. Архитектура →
5. Планирование → 6. Профессиональные → 7. Сообщество → 8. Инфраструктура
```

---

## 🎯 Файлы по целям

### Цель: Понять видение проекта
- PROJECT_SUMMARY.md
- EXECUTIVE_SUMMARY.md
- PHILOSOPHICAL_ANALYSIS.md
- LEONARDO_AI_DETAILED.md

### Цель: Принять технические решения
- QUICK_REFERENCE.md
- OPENCLAW_VS_ORCHESTRATOR_DETAILED.md
- PRACTICAL_COMPARISON_EXAMPLES.md
- CURRENT_DEVELOPMENT_STAGE.md

### Цель: Реализовать что-то
- IMPLEMENTATION_ROADMAP.md
- NEW_AGENTS_STRUCTURE.md
- example-social-law-agent.md
- INTEGRATION_GUIDE.md

### Цель: Внести вклад в проект
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- FAQ.md
- Шаблоны GitHub

### Цель: Понять архитектуру
- ARCHITECTURE_DIAGRAMS.md
- ARCHITECTURE.md
- LEONARDO_AI_DETAILED.md
- PRACTITIONER_VS_THEORIST_ANALYSIS.md

---

## 🔗 Зависимости файлов

### Основные файлы (без зависимостей)
```
README.md ─────────────────────────────► (точка входа)
README.ru.md ──────────────────────────► (точка входа RU)
PROJECT_SUMMARY.md ────────────────────► (автономный обзор)
```

### Взаимосвязанные файлы
```
LEONARDO_AI_DETAILED.md ──────► Требует понимания:
│                                 - PHILOSOPHICAL_ANALYSIS.md
│                                 - OPENCLAW_VS_ORCHESTRATOR_DETAILED.md
│
IMPLEMENTATION_ROADMAP.md ────► Основан на:
│                                 - LEONARDO_AI_DETAILED.md
│                                 - CURRENT_DEVELOPMENT_STAGE.md
│
NEW_AGENTS_STRUCTURE.md ──────► Примеры в:
│                                 - example-social-law-agent.md
│                                 - example-social-law-command.md
│                                 - example-benefits-calculator-skill.md
│
ARCHITECTURE_DIAGRAMS.md ─────► ASCII версия:
                                 - ARCHITECTURE.md
```

---

## 📈 Эволюция файлов

### v0.1.0 (1 файл)
```
README.md (минимальный)
```

### v1.0.0 (13 файлов, +12)
```
+ README.ru.md
+ NEW_AGENTS_STRUCTURE.md
+ example-*.md (3 файла)
+ INTEGRATION_GUIDE.md
+ OPENCLAW_VS_ORCHESTRATOR_DETAILED.md
+ PRACTICAL_COMPARISON_EXAMPLES.md
+ PRACTITIONER_VS_THEORIST_ANALYSIS.md
+ PHILOSOPHICAL_ANALYSIS.md
+ LEONARDO_AI_DETAILED.md
+ LEONARDO_AI_PART2.md
+ PULL_REQUEST.md
```

### v1.1.0 (17 файлов, +4)
```
+ QUICK_REFERENCE.md
+ EXECUTIVE_SUMMARY.md
+ IMPLEMENTATION_ROADMAP.md
+ CURRENT_DEVELOPMENT_STAGE.md
```

### v1.2.0 (19 файлов, +2)
```
+ FAQ.md
+ CONTRIBUTING.md
```

### v1.3.0 (33 файла, +14)
```
+ LICENSE
+ SECURITY.md
+ CODE_OF_CONDUCT.md
+ .gitignore
+ CHANGELOG.md
+ ARCHITECTURE.md
+ ROADMAP_VISUAL.md
+ README.md (English)
+ ARCHITECTURE_DIAGRAMS.md
+ PROJECT_SUMMARY.md
+ PROJECT_STRUCTURE.md
+ PROJECT_STRUCTURE.ru.md (этот файл)
+ .github/ISSUE_TEMPLATE/* (3 файла)
+ .github/pull_request_template.md
```

---

## 🌟 Топ-10 самых важных файлов

| Ранг | Файл | Почему |
|------|------|--------|
| 1 | PROJECT_SUMMARY.md | Полный обзор за 5 минут |
| 2 | LEONARDO_AI_DETAILED.md | Основная инновация |
| 3 | QUICK_REFERENCE.md | Быстрое принятие решений |
| 4 | PHILOSOPHICAL_ANALYSIS.md | Уникальная перспектива |
| 5 | ARCHITECTURE_DIAGRAMS.md | Визуальное понимание |
| 6 | IMPLEMENTATION_ROADMAP.md | Практическое выполнение |
| 7 | FAQ.md | Отвечает на все вопросы |
| 8 | EXECUTIVE_SUMMARY.md | Бизнес-кейс |
| 9 | CONTRIBUTING.md | Построение сообщества |
| 10 | README.md | Международный вход |

---

## 📊 Статистика

### По категориям
```
Документация:    27 файлов (~200k слов)
Инфраструктура:   6 файлов
Всего:           33 файла (~204k слов)
```

### По языкам
```
Английский:  README.md, PROJECT_STRUCTURE.md (частичное покрытие)
Русский:     Все остальные markdown файлы (полное)
Двуязычный:  Примеры кода (TypeScript, Python)
```

### По обслуживанию
```
Стабильные:       LICENSE, CODE_OF_CONDUCT.md, SECURITY.md
Регулярные обновления: CHANGELOG.md, CURRENT_DEVELOPMENT_STAGE.md
Живые документы:  FAQ.md, CONTRIBUTING.md, IMPLEMENTATION_ROADMAP.md
```

---

## 🎯 Дерево выбора файла

```
                    НАЧНИТЕ ЗДЕСЬ
                        │
                        ▼
              ┌─────────────────┐
              │ Сколько времени? │
              └─────────────────┘
                 │           │
        5 мин ◄─┘           └─► 30+ мин
            │                       │
            ▼                       ▼
    PROJECT_SUMMARY.md       Какая у вас роль?
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
          Бизнес              Разработчик          Исследователь
              │                     │                     │
              ▼                     ▼                     ▼
    EXECUTIVE_SUMMARY.md   IMPLEMENTATION_     PHILOSOPHICAL_
                           ROADMAP.md          ANALYSIS.md
```

---

## 💡 Советы по навигации

### 🚀 Здесь впервые?
Начните с [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - он разработан как идеальная отправная точка.

### 🔍 Ищете что-то конкретное?
Используйте поиск по этому файлу (Ctrl+F / Cmd+F) для поиска по ключевым словам, названиям файлов или темам.

### 📱 Читаете на мобильном?
Лучше всего подходят короткие файлы: PROJECT_SUMMARY.md, QUICK_REFERENCE.md, EXECUTIVE_SUMMARY.md

### 💻 Читаете в терминале?
ASCII диаграммы в ARCHITECTURE.md подходят для терминала.

### 🌐 Читаете на GitHub?
Mermaid диаграммы в ARCHITECTURE_DIAGRAMS.md красиво рендерятся.

### 📖 Хотите прочитать всё?
Следуйте пути "Полное чтение" (20+ часов) или используйте этот порядок:
1. Основные документы → 2. Руководства → 3. Исследования → 4. Архитектура →
5. Планирование → 6. Примеры → 7. Сообщество → 8. Инфраструктура

---

## 🔗 Внешние ресурсы

### Связанные проекты
- [OpenClaw (Moltbot)](https://github.com/openclaw)
- [Claude Code Orchestrator Kit](https://github.com/maslennikov-ig/claude-code-orchestrator-kit)
- [Claude Code CLI](https://docs.anthropic.com/claude/docs/claude-code)

### Сообщество
- GitHub Issues: Сообщайте об ошибках, запрашивайте функции
- GitHub Discussions: Задавайте вопросы, делитесь идеями
- GitHub Pull Requests: Вносите вклад в код, документацию

---

## 📞 Нужна помощь?

### Не можете найти то, что ищете?
1. Проверьте [FAQ.md](FAQ.md) - ответы на 50+ вопросов
2. Поиск по этому файлу (Ctrl+F / Cmd+F)
3. Проверьте [README.md](README.md) или [README.ru.md](README.ru.md)
4. Откройте [GitHub Issue](https://github.com/[USERNAME]/info7/issues)

### Хотите внести вклад?
1. Прочитайте [CONTRIBUTING.md](CONTRIBUTING.md)
2. Ознакомьтесь с [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
3. Проверьте [SECURITY.md](SECURITY.md) для руководств по безопасности

---

**Последнее обновление:** 2026-02-06
**Версия:** 1.3.0
**Поддерживается:** Контрибьюторами info7

**Быстрые ссылки:**
- 🏠 [Главная](README.ru.md)
- 🚀 [Быстрый старт](PROJECT_SUMMARY.md)
- 🤝 [Внести вклад](CONTRIBUTING.md)
- ❓ [FAQ](FAQ.md)

https://claude.ai/code/session_01WnQdgU1MrECnhh3xfVNRAg
