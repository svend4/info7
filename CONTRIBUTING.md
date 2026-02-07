# Contributing to info7

**Спасибо за интерес к проекту info7!**

Этот документ описывает, как вы можете внести свой вклад в проект.

---

## 📚 Содержание

1. [Кодекс поведения](#кодекс-поведения)
2. [Как помочь проекту](#как-помочь-проекту)
3. [Процесс контрибьюции](#процесс-контрибьюции)
4. [Стандарты кода](#стандарты-кода)
5. [Стиль документации](#стиль-документации)
6. [Тестирование](#тестирование)
7. [Коммуникация](#коммуникация)

---

## Кодекс поведения

### Наши принципы

**info7** стремится создать дружелюбное и инклюзивное сообщество. Мы ожидаем, что все участники будут:

✅ **Уважительны** к различным точкам зрения и опыту
✅ **Конструктивны** в критике и фидбеке
✅ **Помогают** новичкам и отвечают на вопросы
✅ **Фокусируются** на том, что лучше для проекта и сообщества

❌ **Не допускается:**
- Оскорбления, троллинг, личные нападки
- Дискриминация по любым признакам
- Харассмент в любой форме
- Публикация чужой приватной информации

### Enforcement

Нарушения кодекса поведения можно сообщить по адресу: [TBD: moderator email]

Все жалобы будут рассмотрены конфиденциально.

---

## Как помочь проекту

Есть много способов внести вклад, не обязательно писать код!

### 🐛 Нашли баг?

1. Проверьте, не был ли баг уже сообщен в [Issues](../../issues)
2. Если нет, создайте новый Issue с меткой `bug`
3. Опишите:
   - Что случилось (actual behavior)
   - Что ожидалось (expected behavior)
   - Шаги для воспроизведения
   - Ваше окружение (OS, версии, etc.)

**Пример:**
```markdown
**Описание бага:**
Ссылка на PHILOSOPHICAL_ANALYSIS.md в README.ru.md ведет на 404

**Ожидалось:**
Ссылка открывает файл PHILOSOPHICAL_ANALYSIS.md

**Шаги:**
1. Открыть README.ru.md
2. Кликнуть на ссылку "PHILOSOPHICAL_ANALYSIS.md"
3. Получить 404

**Окружение:**
- Browser: Chrome 120
- OS: macOS 14.2
```

### 💡 Есть идея?

1. Проверьте [Issues](../../issues) и [Discussions](../../discussions)
2. Создайте новый Issue с меткой `enhancement`
3. Опишите:
   - Проблему, которую решает ваша идея
   - Предлагаемое решение
   - Альтернативы
   - Дополнительный контекст

**Пример:**
```markdown
**Проблема:**
Нет диаграмм архитектуры Leonardo AI, только текстовое описание

**Решение:**
Добавить Mermaid диаграммы для визуализации архитектуры

**Альтернативы:**
- Использовать draw.io
- Создать PNG изображения

**Контекст:**
Диаграммы помогут лучше понять архитектуру, особенно новичкам
```

### 📝 Улучшение документации

Документация - критически важная часть проекта!

**Что можно улучшить:**
- Исправление опечаток и грамматических ошибок
- Добавление примеров
- Улучшение ясности объяснений
- Добавление диаграмм и визуализаций
- Переводы на другие языки
- Создание туториалов

**Процесс:**
1. Fork репозиторий
2. Внесите изменения
3. Создайте Pull Request

### 💻 Код

**Типы контрибьюций:**
- Имплементация новых агентов
- Улучшение существующих агентов
- Багфиксы
- Оптимизация производительности
- Тесты
- Инструменты и скрипты

**Требования:**
- TypeScript/JavaScript знание
- Следование стандартам кода (см. ниже)
- Тесты для нового функционала
- Документация для новых фич

### 🧪 Тестирование

**Как помочь с тестированием:**
- Установите OpenClaw и Orchestrator Kit
- Попробуйте различные сценарии
- Сообщайте о багах и неожиданном поведении
- Тестируйте на разных платформах (OS, browsers)
- Beta-тестирование новых фич

### 🌍 Переводы

Мы приветствуем переводы документации на другие языки!

**Приоритетные языки:**
1. Английский (English)
2. Китайский (中文)
3. Испанский (Español)
4. Немецкий (Deutsch)
5. Французский (Français)

**Процесс:**
1. Создайте Issue: "Translation to [язык]"
2. Начните с README.md и FAQ.md
3. Следуйте структуре оригинала
4. Создайте Pull Request

**Naming convention:**
```
README.ru.md      - Русский (существующий)
README.en.md      - Английский
README.zh.md      - Китайский
README.es.md      - Испанский
FAQ.en.md         - English FAQ
```

---

## Процесс контрибьюции

### Workflow для небольших изменений (документация, опечатки)

```bash
# 1. Fork репозиторий на GitHub

# 2. Clone ваш fork
git clone https://github.com/YOUR_USERNAME/info7.git
cd info7

# 3. Создайте новую ветку
git checkout -b fix/typo-in-readme

# 4. Внесите изменения
# Отредактируйте файлы

# 5. Commit
git add README.ru.md
git commit -m "Fix typo in README.ru.md: 'sytems' → 'systems'"

# 6. Push в ваш fork
git push origin fix/typo-in-readme

# 7. Создайте Pull Request на GitHub
# Опишите ваши изменения
```

### Workflow для больших изменений (новые фичи, агенты)

```bash
# 1-2. Fork и clone (как выше)

# 3. Создайте feature ветку
git checkout -b feature/add-financial-advisor-agent

# 4. Установите зависимости (если нужно)
npm install

# 5. Создайте новый агент
# Следуйте структуре из INTEGRATION_GUIDE.md

# agents/financial/financial-advisor-agent.ts
# skills/financial/portfolio-optimizer.ts
# commands/financial/analyze-portfolio.ts

# 6. Добавьте тесты
# tests/agents/financial-advisor-agent.test.ts

# 7. Запустите тесты
npm test

# 8. Запустите линтеры
npm run lint
npm run format

# 9. Commit с детальным описанием
git add .
git commit -m "Add financial advisor agent

- Implements portfolio analysis
- Adds risk assessment capability
- Includes investment recommendations
- Tests coverage: 85%

Related to #123"

# 10. Push и создайте Pull Request
git push origin feature/add-financial-advisor-agent
```

### Pull Request Guidelines

**Хороший PR:**

✅ **Заголовок:**
- Ясный и описательный
- Начинается с глагола (Add, Fix, Update, Improve)
- Примеры:
  - "Add financial advisor agent"
  - "Fix broken link in PHILOSOPHICAL_ANALYSIS.md"
  - "Update QUICK_REFERENCE.md with new comparisons"

✅ **Описание:**
```markdown
## Что изменено
Добавлен новый агент "financial-advisor" для анализа инвестиционного портфеля

## Почему
Расширение профессиональных категорий агентов (запрос #123)

## Как протестировано
- Unit tests (coverage 85%)
- Manual testing с 5 тестовыми портфелями
- Integration тесты с Orchestrator Kit

## Связанные Issues
Closes #123

## Чек-лист
- [x] Код следует стандартам проекта
- [x] Добавлены тесты
- [x] Все тесты проходят
- [x] Документация обновлена
- [x] Нет breaking changes
```

✅ **Размер:**
- Предпочтительно: <500 строк
- Максимум: <1000 строк
- Если больше - разбейте на несколько PR

✅ **Commits:**
- Атомарные (один commit = одно логическое изменение)
- Хорошие commit messages
- Не включают merge commits (используйте rebase)

❌ **Плохой PR:**
- Заголовок: "Updates"
- Нет описания
- 5000 строк изменений
- Нет тестов
- Ломает существующий функционал

### Code Review Process

**Что происходит после PR:**

1. **Automatic checks:**
   - CI/CD pipeline запускается
   - Линтеры
   - Тесты
   - Build проверка

2. **Human review:**
   - Минимум 1 approver (для small changes)
   - Минимум 2 approvers (для больших changes)
   - Maintainers проверяют:
     - Код качество
     - Тесты
     - Документацию
     - Стиль

3. **Feedback:**
   - Отвечайте на комментарии
   - Вносите исправления
   - Push новые commits

4. **Merge:**
   - После approval
   - Используется Squash and Merge (обычно)
   - Ваша ветка будет удалена

**Типичное время review:** 2-5 дней

---

## Стандарты кода

### TypeScript/JavaScript

**Стиль кода:**

```typescript
// ✅ Хорошо
export class SocialLawSpecialist extends Agent {
  private readonly knowledgeBase: KnowledgeBase;

  constructor(config: AgentConfig) {
    super(config);
    this.knowledgeBase = new KnowledgeBase(config.laws);
  }

  async consultOnBenefits(query: string): Promise<ConsultationResult> {
    const intent = await this.analyzeIntent(query);
    const laws = await this.searchKnowledgeBase(intent);

    return this.generateResponse({
      query,
      intent,
      laws,
      context: this.getContext()
    });
  }

  private async analyzeIntent(query: string): Promise<Intent> {
    // Implementation
  }
}

// ❌ Плохо
export class SocialLawSpecialist extends Agent {
  public kb;

  constructor(c) {
    super(c);
    this.kb = new KnowledgeBase(c.laws);
  }

  async consult(q) {
    let i = await this.analyzeIntent(q);
    let l = await this.searchKnowledgeBase(i);

    return this.generateResponse({query: q, intent: i, laws: l});
  }
}
```

**Правила:**
- ✅ Используйте TypeScript, не JavaScript
- ✅ Строгая типизация (no `any`)
- ✅ Используйте `const` и `let`, не `var`
- ✅ Async/await вместо callbacks
- ✅ Деструктуризация когда уместно
- ✅ Осмысленные имена переменных
- ✅ JSDoc комментарии для публичных методов

**Форматирование:**
- Indentation: 2 spaces
- Line length: 80-100 символов
- Quotes: Single quotes `'` для строк
- Semicolons: Да
- Trailing commas: Да

**Используйте автоматическое форматирование:**
```bash
npm run format  # Prettier
npm run lint    # ESLint
```

### Naming Conventions

**Files:**
```
agents/legal/social-law-specialist.ts        ✅ kebab-case
agents/legal/SocialLawSpecialist.ts          ❌ PascalCase
```

**Classes:**
```typescript
class SocialLawSpecialist                    ✅ PascalCase
class socialLawSpecialist                    ❌ camelCase
```

**Functions/Methods:**
```typescript
async consultOnBenefits()                    ✅ camelCase
async ConsultOnBenefits()                    ❌ PascalCase
```

**Variables:**
```typescript
const knowledgeBase                          ✅ camelCase
const KNOWLEDGE_BASE                         ❌ SCREAMING_SNAKE_CASE (только для констант)
```

**Constants:**
```typescript
const MAX_RETRIES = 3                        ✅ SCREAMING_SNAKE_CASE
const API_ENDPOINT = 'https://...'          ✅
```

**Types/Interfaces:**
```typescript
interface AgentConfig                        ✅ PascalCase
type ConsultationResult                      ✅ PascalCase
```

### Error Handling

**Всегда обрабатывайте ошибки:**

```typescript
// ✅ Хорошо
async function consultOnBenefits(query: string): Promise<Result> {
  try {
    const result = await this.api.query(query);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error('API error:', error);
      return { success: false, error: 'API temporarily unavailable' };
    }

    if (error instanceof ValidationError) {
      return { success: false, error: error.message };
    }

    // Unknown error
    logger.error('Unexpected error:', error);
    throw error; // Re-throw if can't handle
  }
}

// ❌ Плохо
async function consultOnBenefits(query: string) {
  const result = await this.api.query(query); // No error handling
  return result;
}
```

### Testing

**Требования:**
- ✅ Unit tests для всей бизнес-логики
- ✅ Integration tests для агентов
- ✅ Coverage минимум 80%
- ✅ Тесты должны быть быстрыми (<1 секунда каждый)

**Пример теста:**

```typescript
// tests/agents/social-law-specialist.test.ts

import { SocialLawSpecialist } from '@/agents/legal/social-law-specialist';

describe('SocialLawSpecialist', () => {
  let agent: SocialLawSpecialist;

  beforeEach(() => {
    agent = new SocialLawSpecialist({
      apiKey: 'test-key',
      laws: mockLaws
    });
  });

  describe('consultOnBenefits', () => {
    it('should return benefits for single mother', async () => {
      const query = 'Какие льготы для матери-одиночки?';

      const result = await agent.consultOnBenefits(query);

      expect(result.success).toBe(true);
      expect(result.data.benefits).toContain('материнский капитал');
      expect(result.data.laws).toContain('ФЗ-178');
    });

    it('should handle invalid query', async () => {
      const query = '';

      const result = await agent.consultOnBenefits(query);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query cannot be empty');
    });

    it('should retry on API failure', async () => {
      jest.spyOn(agent.api, 'query')
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({ benefits: [] });

      const result = await agent.consultOnBenefits('test');

      expect(result.success).toBe(true);
      expect(agent.api.query).toHaveBeenCalledTimes(2);
    });
  });
});
```

**Запуск тестов:**
```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage report
npm test -- social-law      # Run specific tests
```

---

## Стиль документации

### Markdown

**Заголовки:**
```markdown
# H1 - только один на документ (название)
## H2 - основные секции
### H3 - подсекции
#### H4 - детали
```

**Списки:**
```markdown
✅ Хорошо:
- Item 1
- Item 2
  - Nested item
- Item 3

❌ Плохо:
* Item 1
* Item 2
    * Nested item (4 spaces)
* Item 3
```

**Код блоки:**
````markdown
```typescript
// Всегда указывайте язык
const example = 'code';
```
````

**Ссылки:**
```markdown
✅ Относительные ссылки внутри проекта:
[QUICK_REFERENCE.md](QUICK_REFERENCE.md)

✅ Абсолютные ссылки на внешние ресурсы:
[OpenClaw](https://github.com/openclaw/openclaw)

❌ Не используйте HTML:
<a href="...">link</a>
```

**Таблицы:**
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
| Value 4  | Value 5  | Value 6  |
```

**Эмодзи:**
```markdown
✅ Используйте для визуального выделения:
- 🎯 Цели
- ✅ Плюсы
- ❌ Минусы
- ⚠️ Предупреждения

❌ Не злоупотребляйте:
🎉🔥💯 Это 🚀 слишком 🌟 много! ✨
```

### Стиль письма

**Tone:**
- Профессиональный, но дружелюбный
- Ясный и лаконичный
- Избегайте жаргона (или объясняйте)
- Примеры там, где возможно

**Структура:**
1. Начните с краткого резюме
2. Детали дальше
3. Примеры в конце
4. Ссылки на дополнительные материалы

**Пример хорошей структуры:**
```markdown
## Feature Name

Brief one-line description of the feature.

### Overview

2-3 sentences explaining what it does and why it's useful.

### Usage

Step-by-step guide or code examples.

### Advanced

Optional advanced topics.

### See Also

Links to related documentation.
```

### Документация кода

**JSDoc для TypeScript:**

```typescript
/**
 * Consults on social benefits based on user query.
 *
 * @param query - User's question about social benefits
 * @returns Consultation result with relevant laws and benefits
 * @throws {ValidationError} If query is empty or invalid
 * @throws {ApiError} If API is unavailable
 *
 * @example
 * ```typescript
 * const result = await agent.consultOnBenefits(
 *   'Какие льготы для матери-одиночки?'
 * );
 * console.log(result.benefits); // ['материнский капитал', ...]
 * ```
 */
async consultOnBenefits(query: string): Promise<ConsultationResult> {
  // Implementation
}
```

---

## Тестирование

### Локальное тестирование

**Перед созданием PR:**

```bash
# 1. Установите зависимости
npm install

# 2. Запустите линтеры
npm run lint

# 3. Исправьте форматирование
npm run format

# 4. Запустите тесты
npm test

# 5. Проверьте coverage
npm test -- --coverage
# Минимум 80% для новых файлов

# 6. Попробуйте билд
npm run build

# 7. Проверьте документацию
# Откройте README.md и убедитесь, что ссылки работают
```

### Что тестировать

**Обязательно:**
- ✅ Основной функционал (happy path)
- ✅ Edge cases (пустые значения, null, undefined)
- ✅ Error handling
- ✅ Валидация входных данных

**Опционально:**
- Performance tests (если актуально)
- Load tests (для API endpoints)
- E2E tests (для больших фич)

---

## Коммуникация

### GitHub Issues

**Используйте Issues для:**
- 🐛 Bug reports
- 💡 Feature requests
- ❓ Вопросы
- 📝 Документация improvements

**Используйте метки:**
- `bug` - Баг
- `enhancement` - Новая фича
- `documentation` - Документация
- `good first issue` - Для новичков
- `help wanted` - Нужна помощь
- `question` - Вопрос

### GitHub Discussions

**Используйте Discussions для:**
- 💬 Общие обсуждения
- 🎓 Q&A
- 💡 Идеи (не готовые к implementation)
- 📢 Анонсы

### Commit Messages

**Хорошие commit messages:**

```bash
# ✅ Хорошо
git commit -m "Add financial advisor agent

Implements portfolio analysis with risk assessment.
Includes tests with 85% coverage.

Closes #123"

# ✅ Тоже хорошо (для мелких изменений)
git commit -m "Fix typo in QUICK_REFERENCE.md"

# ❌ Плохо
git commit -m "update"
git commit -m "fix stuff"
git commit -m "wip"
```

**Формат:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: Новая фича
- `fix`: Багфикс
- `docs`: Документация
- `style`: Форматирование
- `refactor`: Рефакторинг
- `test`: Тесты
- `chore`: Maintenance

---

## Вопросы?

**Не нашли ответ?**
- Проверьте [FAQ.md](FAQ.md)
- Создайте Issue с меткой `question`
- Спросите в [Discussions](../../discussions)

**Спасибо за вклад в info7! 🎉**

---

**Версия:** 1.0
**Последнее обновление:** 2026-02-06

https://claude.ai/code/session_01WnQdgU1MrECnhh3xfVNRAg
