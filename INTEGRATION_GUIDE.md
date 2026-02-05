# Руководство по интеграции новых профессиональных категорий

## Как добавить новые агенты в Claude Code Orchestrator Kit

Это пошаговое руководство покажет, как интегрировать 20 новых агентов из 4 профессиональных категорий в ваш проект.

---

## Обзор добавляемых категорий

| Категория | Агентов | Команд | Скиллов |
|-----------|---------|--------|---------|
| Legal (Юридическая) | 6 | 6 | 3 |
| Social Work (Социальная работа) | 4 | 4 | 3 |
| Household (Домашнее хозяйство) | 5 | 5 | 3 |
| Caregiving (Уход за больными) | 5 | 5 | 3 |
| **ИТОГО** | **20** | **20** | **12** |

**После интеграции:**
- Было: 39 агентов
- Станет: **59 агентов**

---

## Шаг 1: Создание структуры директорий

### 1.1 Создайте директории для агентов

```bash
cd your-project

# Legal (Юридическая сфера)
mkdir -p .claude/agents/legal/general-lawyer
mkdir -p .claude/agents/legal/social-law-specialist
mkdir -p .claude/agents/legal/labor-law-specialist
mkdir -p .claude/agents/legal/family-law-specialist
mkdir -p .claude/agents/legal/housing-law-specialist
mkdir -p .claude/agents/legal/legal-document-writer

# Social Work (Социальная работа)
mkdir -p .claude/agents/social-work/case-manager
mkdir -p .claude/agents/social-work/benefits-specialist
mkdir -p .claude/agents/social-work/rehabilitation-specialist
mkdir -p .claude/agents/social-work/crisis-intervention

# Household (Домашнее хозяйство)
mkdir -p .claude/agents/household/household-manager
mkdir -p .claude/agents/household/interior-maintenance
mkdir -p .claude/agents/household/exterior-maintenance
mkdir -p .claude/agents/household/estate-manager
mkdir -p .claude/agents/household/budget-planner

# Caregiving (Уход за больными)
mkdir -p .claude/agents/caregiving/personal-caregiver
mkdir -p .claude/agents/caregiving/elderly-care-specialist
mkdir -p .claude/agents/caregiving/disability-care
mkdir -p .claude/agents/caregiving/palliative-care
mkdir -p .claude/agents/caregiving/care-coordinator
```

### 1.2 Создайте директории для скиллов

```bash
# Legal skills
mkdir -p .claude/skills/benefits-calculator
mkdir -p .claude/skills/legal-document-validator
mkdir -p .claude/skills/law-search

# Social work skills
mkdir -p .claude/skills/needs-assessment
mkdir -p .claude/skills/service-plan-builder
mkdir -p .claude/skills/case-tracker

# Household skills
mkdir -p .claude/skills/cleaning-schedule
mkdir -p .claude/skills/maintenance-checklist
mkdir -p .claude/skills/budget-tracker

# Caregiving skills
mkdir -p .claude/skills/care-plan-builder
mkdir -p .claude/skills/medication-schedule
mkdir -p .claude/skills/safety-checklist
```

---

## Шаг 2: Добавление файлов агентов

### 2.1 Пример: Social Law Specialist

Создайте файл `.claude/agents/legal/social-law-specialist/AGENT.md`:

```bash
nano .claude/agents/legal/social-law-specialist/AGENT.md
```

Скопируйте содержимое из `example-social-law-agent.md`

### 2.2 Шаблон для других агентов

Для остальных агентов используйте этот шаблон:

**Файл:** `.claude/agents/{category}/{agent-name}/AGENT.md`

```markdown
# {Agent Name}

**Role:** [Описание роли на русском]

## Expertise

- [Область экспертизы 1]
- [Область экспертизы 2]
- [Область экспертизы 3]

## Responsibilities

1. [Ответственность 1]
2. [Ответственность 2]
3. [Ответственность 3]

## Output Format

[Как должен выглядеть ответ агента]

## Examples

[Примеры использования]

## Tools

[Какие инструменты использует]

## Delegation

[Когда делегировать другим агентам]
```

---

## Шаг 3: Создание команд

### 3.1 Создайте команды в .claude/commands/

```bash
# Legal commands
touch .claude/commands/legal-consult.md
touch .claude/commands/social-law.md
touch .claude/commands/labor-law.md
touch .claude/commands/family-law.md
touch .claude/commands/housing-law.md
touch .claude/commands/legal-docs.md

# Social work commands
touch .claude/commands/case-manage.md
touch .claude/commands/benefits-help.md
touch .claude/commands/rehab-plan.md
touch .claude/commands/crisis-help.md

# Household commands
touch .claude/commands/household-manage.md
touch .claude/commands/interior-care.md
touch .claude/commands/exterior-care.md
touch .claude/commands/estate-manage.md
touch .claude/commands/budget-plan.md

# Caregiving commands
touch .claude/commands/caregiver.md
touch .claude/commands/elderly-care.md
touch .claude/commands/disability-care.md
touch .claude/commands/palliative-care.md
touch .claude/commands/care-coordinate.md
```

### 3.2 Пример команды: /social-law

Скопируйте содержимое из `example-social-law-command.md` в `.claude/commands/social-law.md`

---

## Шаг 4: Создание скиллов

### 4.1 Benefits Calculator (основной скилл)

Создайте файл `.claude/skills/benefits-calculator/SKILL.md`:

```bash
nano .claude/skills/benefits-calculator/SKILL.md
```

Скопируйте содержимое из `example-benefits-calculator-skill.md`

### 4.2 Другие скиллы

Создайте остальные скиллы по аналогии:

- `legal-document-validator` - валидация юридических документов
- `needs-assessment` - оценка потребностей клиента
- `care-plan-builder` - план ухода за больным
- и т.д.

---

## Шаг 5: Обновление CLAUDE.md

### 5.1 Добавьте новые категории в CLAUDE.md

Откройте `CLAUDE.md` и добавьте в раздел "Agent Ecosystem":

```markdown
## Agent Ecosystem

### Legal (6 агентов)
Юридическая помощь и консультации:
- `general-lawyer` - общая правовая консультация
- `social-law-specialist` - социальное право, пособия, льготы
- `labor-law-specialist` - трудовое право
- `family-law-specialist` - семейное право
- `housing-law-specialist` - жилищное право
- `legal-document-writer` - составление юридических документов

**Когда использовать:**
- Вопросы о правах и законах
- Оформление пособий и выплат
- Составление исков, жалоб, заявлений

### Social Work (4 агента)
Социальная работа и поддержка:
- `case-manager` - ведение случая, координация помощи
- `benefits-specialist` - помощь в оформлении пособий
- `rehabilitation-specialist` - программы реабилитации
- `crisis-intervention` - кризисная помощь

**Когда использовать:**
- Комплексные социальные проблемы
- Помощь уязвимым группам
- Координация услуг

### Household (5 агентов)
Управление домашним хозяйством:
- `household-manager` - общее управление домом
- `interior-maintenance` - уборка и уход внутри
- `exterior-maintenance` - уход за придомовой территорией
- `estate-manager` - управление загородным хозяйством
- `budget-planner` - планирование домашнего бюджета

**Когда использовать:**
- Организация быта
- Планирование уборки и ухода
- Управление бюджетом

### Caregiving (5 агентов)
Уход за больными и инвалидами:
- `personal-caregiver` - персональный уход
- `elderly-care-specialist` - уход за пожилыми
- `disability-care` - уход за инвалидами
- `palliative-care` - паллиативный уход
- `care-coordinator` - координация ухода

**Когда использовать:**
- Планирование ухода за больными
- Помощь пожилым и инвалидам
- Организация медицинского обслуживания на дому
```

---

## Шаг 6: Обновление README

### 6.1 Добавьте в README.md статистику

```markdown
## Статистика

- **59** ИИ-агентов (было 39)
- **51** Переиспользуемых скиллов (было 39)
- **41** Слэш-команда (было 21)
- **6** MCP-серверов
- **v2.0.0** Версия с профессиональными категориями

## Новые категории агентов

### Legal (Юридическая сфера)
[Описание и список агентов]

### Social Work (Социальная работа)
[Описание и список агентов]

### Household (Домашнее хозяйство)
[Описание и список агентов]

### Caregiving (Уход)
[Описание и список агентов]
```

---

## Шаг 7: Тестирование

### 7.1 Проверьте установку

```bash
# Запустите Claude Code
claude

# Проверьте доступность команд
/help

# Должны появиться новые команды:
# /social-law
# /case-manage
# /household-manage
# /caregiver
# и т.д.
```

### 7.2 Тестовые запросы

```bash
# Тест 1: Юридическая консультация
/social-law "какие пособия положены пенсионеру?"

# Тест 2: Социальная работа
/case-manage "пожилой человек, живёт один, нужна помощь"

# Тест 3: Домашнее хозяйство
/household-manage "составь план уборки квартиры"

# Тест 4: Уход
/caregiver "план ухода за лежачим больным"
```

---

## Шаг 8: Оптимизация

### 8.1 Настройка приоритетов агентов

В `.claude/settings.json` добавьте:

```json
{
  "agents": {
    "priorities": {
      "social-law-specialist": "high",
      "case-manager": "high",
      "personal-caregiver": "medium",
      "household-manager": "medium"
    },
    "maxTokens": {
      "social-law-specialist": 4000,
      "legal-document-writer": 3000,
      "benefits-calculator": 2000
    }
  }
}
```

### 8.2 Настройка контекста

Для экономии токенов добавьте в `.claude/settings.json`:

```json
{
  "env": {
    "ENABLE_TOOL_SEARCH": "auto:5"
  }
}
```

---

## Шаг 9: Документация

### 9.1 Создайте документацию для пользователей

Создайте файл `docs/NEW_CATEGORIES.md`:

```markdown
# Новые профессиональные категории

## Legal (Юридические услуги)

### Команды
- `/legal-consult` - общая консультация
- `/social-law` - социальное право
- [и т.д.]

### Примеры использования
[Примеры]

## Social Work (Социальная работа)
[Аналогично]

## Household (Домашнее хозяйство)
[Аналогично]

## Caregiving (Уход)
[Аналогично]
```

---

## Шаг 10: Коммит изменений

### 10.1 Подготовьте git commit

```bash
git status

# Проверьте что добавлены:
# - .claude/agents/legal/*
# - .claude/agents/social-work/*
# - .claude/agents/household/*
# - .claude/agents/caregiving/*
# - .claude/skills/*
# - .claude/commands/*
# - CLAUDE.md (обновлён)
# - README.md (обновлён)
```

### 10.2 Создайте коммит

```bash
git add .claude/ CLAUDE.md README.md docs/

git commit -m "Add 20 new professional agents: Legal, Social Work, Household, Caregiving

- Legal: 6 agents (social-law, labor-law, etc.)
- Social Work: 4 agents (case-manager, benefits-specialist, etc.)
- Household: 5 agents (household-manager, estate-manager, etc.)
- Caregiving: 5 agents (personal-caregiver, elderly-care, etc.)
- 20 new commands
- 12 new skills (benefits-calculator, care-plan-builder, etc.)
- Updated documentation

Total: 59 agents (was 39), 51 skills (was 39)

https://claude.ai/code/session_01WnQdgU1MrECnhh3xfVNRAg"
```

### 10.3 Запушьте в репозиторий

```bash
git push origin claude/add-professional-categories
```

---

## Быстрый старт (краткая версия)

Если вы хотите быстро добавить только одну категорию:

```bash
# 1. Создайте директории
mkdir -p .claude/agents/legal/social-law-specialist
mkdir -p .claude/skills/benefits-calculator
mkdir -p .claude/commands

# 2. Скопируйте файлы примеров
cp example-social-law-agent.md .claude/agents/legal/social-law-specialist/AGENT.md
cp example-social-law-command.md .claude/commands/social-law.md
cp example-benefits-calculator-skill.md .claude/skills/benefits-calculator/SKILL.md

# 3. Перезапустите Claude Code
claude

# 4. Тестируйте
/social-law "тестовый вопрос"
```

---

## Troubleshooting

### Проблема: Команда не распознаётся

**Решение:**
```bash
# Проверьте наличие файла
ls .claude/commands/social-law.md

# Перезапустите Claude Code
exit
claude
```

### Проблема: Агент не находится

**Решение:**
```bash
# Проверьте структуру
tree .claude/agents/legal/

# Должно быть:
# .claude/agents/legal/social-law-specialist/AGENT.md
```

### Проблема: Скилл не работает

**Решение:**
```bash
# Проверьте путь
ls .claude/skills/benefits-calculator/SKILL.md

# Формат должен быть строго: SKILL.md (заглавными)
```

---

## Следующие шаги

После успешной интеграции:

1. **Обучите команду** - создайте внутреннюю документацию
2. **Настройте под свой проект** - адаптируйте агентов под специфику
3. **Добавьте региональные данные** - актуальные для вашего региона выплаты
4. **Интегрируйте с Beads** - для отслеживания задач
5. **Создайте workflows** - типовые сценарии использования

---

## Обратная связь

Если вы добавили новые агенты и хотите поделиться:

1. Создайте pull request в репозиторий Orchestrator Kit
2. Опубликуйте в сообществе Claude Code
3. Поделитесь опытом использования

---

## Версия руководства

- **Версия:** 1.0.0
- **Дата:** 2026-02-05
- **Совместимость:** Claude Code Orchestrator Kit 1.4.19+
- **Автор:** Claude Code Community

---

**Успехов в расширении вашей системы оркестрации! 🚀**
