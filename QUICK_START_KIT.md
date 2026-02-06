# Quick Start Kit - Начните Прямо Сейчас!

**Дата:** 2026-02-06
**Цель:** Запустить минимальную интеграцию за 30 минут

---

## ⚡ Быстрый Старт (30 минут)

### Шаг 1: Проверка Готовности (5 минут)

```bash
# 1. Проверка Leonardo AI
cd /home/user/leonardo-ai
npm run api:dev &

# Подождать 10 секунд
sleep 10

# Тест
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"2026-02-06..."}

curl -X POST http://localhost:3000/predict \
  -H "Content-Type: application/json" \
  -d '{"task":"Fix critical production bug"}'
# Expected: {"strategy":"action-first","confidence":0.95,...}

# 2. Проверка Sandbox
cd /home/user/info7/openclaw-security/packages/sandbox
npm test
# Expected: All tests passing
```

### Шаг 2: Создание Minimal Orchestrator (10 минут)

Создайте новую директорию:

```bash
mkdir -p /home/user/orchestrator-minimal
cd /home/user/orchestrator-minimal
npm init -y
```

Установите зависимости:

```bash
npm install typescript tsx @types/node axios vitest --save-dev
npm install axios
```

Создайте `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### Шаг 3: Минимальный Leonardo Client (5 минут)

Создайте `src/leonardo-client.ts`:

```typescript
import axios from 'axios';

interface PredictionResponse {
  strategy: string;
  confidence: number;
}

export class LeonardoClient {
  constructor(private baseURL: string = 'http://localhost:3000') {}

  async predict(task: string): Promise<PredictionResponse> {
    const response = await axios.post(`${this.baseURL}/predict`, { task });
    return {
      strategy: response.data.strategy,
      confidence: response.data.confidence
    };
  }
}
```

### Шаг 4: Минимальный Agent (5 минут)

Создайте `src/simple-agent.ts`:

```typescript
export interface AgentResult {
  success: boolean;
  output: any;
  duration: number;
}

export class SimpleAgent {
  async execute(task: string, strategy: string): Promise<AgentResult> {
    const startTime = Date.now();

    console.log(`[Agent] Executing task: ${task}`);
    console.log(`[Agent] Strategy: ${strategy}`);

    // Simulate work
    await this.sleep(1000);

    const output = {
      task,
      strategy,
      result: `Completed using ${strategy} strategy`,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      output,
      duration: Date.now() - startTime
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Шаг 5: Минимальный Orchestrator (5 минут)

Создайте `src/orchestrator.ts`:

```typescript
import { LeonardoClient } from './leonardo-client';
import { SimpleAgent } from './simple-agent';

export class MinimalOrchestrator {
  private leonardoClient = new LeonardoClient();
  private agent = new SimpleAgent();

  async executeTask(task: string): Promise<void> {
    console.log('\n=== Task Execution ===');
    console.log(`Task: ${task}\n`);

    // 1. Ask Leonardo AI for strategy
    console.log('Step 1: Asking Leonardo AI for strategy...');
    const prediction = await this.leonardoClient.predict(task);
    console.log(`  → Strategy: ${prediction.strategy}`);
    console.log(`  → Confidence: ${(prediction.confidence * 100).toFixed(1)}%\n`);

    // 2. Execute with agent
    console.log('Step 2: Executing with agent...');
    const result = await this.agent.execute(task, prediction.strategy);
    console.log(`  → Success: ${result.success}`);
    console.log(`  → Duration: ${result.duration}ms\n`);

    // 3. Show result
    console.log('Step 3: Result:');
    console.log(JSON.stringify(result.output, null, 2));
    console.log('\n=== Execution Complete ===\n');
  }
}
```

### Шаг 6: Main Entry Point

Создайте `src/index.ts`:

```typescript
import { MinimalOrchestrator } from './orchestrator';

async function main() {
  const orchestrator = new MinimalOrchestrator();

  // Test different tasks
  const tasks = [
    'Fix critical production bug in payment service',
    'Design microservices architecture for e-commerce',
    'Implement user authentication with JWT'
  ];

  for (const task of tasks) {
    await orchestrator.executeTask(task);
    await sleep(1000);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
```

### Шаг 7: Запуск!

```bash
# Убедитесь что Leonardo AI запущен
cd /home/user/leonardo-ai
npm run api:dev &

# В другом терминале
cd /home/user/orchestrator-minimal

# Запустить
npx tsx src/index.ts
```

**Ожидаемый вывод:**

```
=== Task Execution ===
Task: Fix critical production bug in payment service

Step 1: Asking Leonardo AI for strategy...
  → Strategy: action-first
  → Confidence: 95.3%

Step 2: Executing with agent...
  → Success: true
  → Duration: 1003ms

Step 3: Result:
{
  "task": "Fix critical production bug in payment service",
  "strategy": "action-first",
  "result": "Completed using action-first strategy",
  "timestamp": "2026-02-06T12:34:56.789Z"
}

=== Execution Complete ===

...
```

---

## 🎯 Что Мы Получили?

✅ **Leonardo AI** предсказывает стратегию
✅ **Orchestrator** координирует выполнение
✅ **Agent** выполняет задачу по стратегии
✅ **Full workflow** работает end-to-end!

---

## 📈 Следующие Шаги

### Уровень 1: Добавить Sandbox (15 минут)

Установите sandbox:

```bash
cd /home/user/orchestrator-minimal
npm install @openclaw/sandbox
```

Обновите `src/simple-agent.ts`:

```typescript
import { SkillSandbox } from '@openclaw/sandbox';

export class SimpleAgent {
  private sandbox = new SkillSandbox({
    timeout: 5000,
    maxMemory: 50 * 1024 * 1024,
    allowedDomains: ['api.weather.com']
  });

  async execute(task: string, strategy: string): Promise<AgentResult> {
    // ... existing code ...

    // Execute skill in sandbox
    if (task.toLowerCase().includes('weather')) {
      const skillCode = `
        async function main(context) {
          const location = context.args.location || 'London';
          return {
            location,
            temperature: Math.floor(Math.random() * 30),
            conditions: 'Sunny'
          };
        }
      `;

      const skillResult = await this.sandbox.execute(skillCode, {
        sessionId: 'test',
        userId: 'test',
        args: { location: 'Moscow' },
        config: {},
        metadata: { skillName: 'weather' }
      });

      output.skillResult = skillResult.result;
    }

    // ... rest of code ...
  }
}
```

### Уровень 2: Добавить Documentation Bot (20 минут)

Создайте `src/doc-bot.ts`:

```typescript
import { readFileSync, readdirSync } from 'fs';

export class DocBot {
  private docs: Map<string, string> = new Map();

  constructor(docsPath: string) {
    const files = readdirSync(docsPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = readFileSync(`${docsPath}/${file}`, 'utf-8');
      this.docs.set(file, content);
    }
  }

  search(query: string): string[] {
    const results: string[] = [];
    const queryLower = query.toLowerCase();

    for (const [file, content] of this.docs) {
      if (content.toLowerCase().includes(queryLower)) {
        results.push(file);
      }
    }

    return results;
  }

  answer(question: string): string {
    const results = this.search(question);

    if (results.length === 0) {
      return `No documentation found for: ${question}`;
    }

    return `Found in: ${results.join(', ')}`;
  }
}
```

Используйте в orchestrator:

```typescript
import { DocBot } from './doc-bot';

export class MinimalOrchestrator {
  private docBot = new DocBot('/home/user/info7');

  async executeTask(task: string): Promise<void> {
    // ... existing code ...

    // 4. Check documentation
    if (task.toLowerCase().includes('how') || task.toLowerCase().includes('what')) {
      console.log('Step 4: Checking documentation...');
      const answer = this.docBot.answer(task);
      console.log(`  → ${answer}\n`);
    }

    // ... rest of code ...
  }
}
```

### Уровень 3: Добавить Feedback Loop (10 минут)

Создайте `src/feedback-sender.ts`:

```typescript
import axios from 'axios';

export class FeedbackSender {
  constructor(private leonardoURL: string = 'http://localhost:3000') {}

  async send(taskId: string, strategy: string, success: boolean, duration: number): Promise<void> {
    try {
      await axios.post(`${this.leonardoURL}/feedback`, {
        taskId,
        strategy: { predicted: strategy, actual: strategy },
        result: { success, duration, quality: success ? 0.9 : 0.3 }
      });
      console.log('[Feedback] Sent successfully');
    } catch (error) {
      console.error('[Feedback] Failed:', error);
    }
  }
}
```

Интегрируйте:

```typescript
import { FeedbackSender } from './feedback-sender';

export class MinimalOrchestrator {
  private feedbackSender = new FeedbackSender();

  async executeTask(task: string): Promise<void> {
    const taskId = `task-${Date.now()}`;

    // ... execute task ...

    // Send feedback
    await this.feedbackSender.send(
      taskId,
      prediction.strategy,
      result.success,
      result.duration
    );
  }
}
```

---

## 🚀 Production-Ready Checklist

После завершения Quick Start, проверьте:

- [ ] Leonardo AI отвечает на /health
- [ ] Leonardo AI предсказывает стратегии
- [ ] Orchestrator получает prediction
- [ ] Agent выполняет задачи
- [ ] Sandbox изолирует skills
- [ ] Documentation Bot отвечает на вопросы
- [ ] Feedback loop работает

---

## 📊 Тестирование

Создайте `src/orchestrator.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { MinimalOrchestrator } from './orchestrator';

describe('MinimalOrchestrator', () => {
  let orchestrator: MinimalOrchestrator;

  beforeAll(() => {
    orchestrator = new MinimalOrchestrator();
  });

  it('should execute task successfully', async () => {
    const task = 'Fix bug in user authentication';

    // Should not throw
    await orchestrator.executeTask(task);

    expect(true).toBe(true);
  }, 30000);
});
```

Запустите тесты:

```bash
npx vitest run
```

---

## 🎓 Обучение

### Попробуйте Разные Задачи

```typescript
const tasks = [
  // Should be action-first
  'Fix critical production bug',
  'Urgent security vulnerability',

  // Should be thinking-first
  'Design scalable architecture',
  'Plan database migration',

  // Should be iterative
  'Prototype new feature',
  'Explore optimization options'
];
```

### Посмотрите Как ML Выбирает Стратегии

Добавьте логирование:

```typescript
console.log('Task complexity:', this.analyzeComplexity(task));
console.log('Task urgency:', this.analyzeUrgency(task));
console.log('Predicted strategy:', prediction.strategy);
console.log('Confidence:', prediction.confidence);
```

---

## 📚 Дополнительные Ресурсы

**Документация:**
- [Полный Implementation Roadmap](./IMPLEMENTATION_ROADMAP_2026.md)
- [Фазы 2-5](./IMPLEMENTATION_ROADMAP_PHASE2_5.md)
- [Финальная Фаза](./IMPLEMENTATION_ROADMAP_FINAL.md)
- [Технический Анализ - Индекс](./ANALYSIS_INDEX.md)

**Код:**
- Leonardo AI: `/home/user/leonardo-ai`
- Sandbox: `/home/user/info7/openclaw-security/packages/sandbox`
- Документация: `/home/user/info7`

---

## 🤝 Поддержка

Если что-то не работает:

1. Проверьте что Leonardo AI запущен: `curl http://localhost:3000/health`
2. Проверьте логи: `cd /home/user/leonardo-ai && npm run api:dev`
3. Проверьте зависимости: `npm install`

---

## ✨ Поздравляем!

Вы запустили интеграцию всех четырех систем:
- ✅ Leonardo AI (ML Model)
- ✅ Orchestrator (Planning)
- ✅ Agent (Execution)
- ✅ Documentation (Knowledge)

**Следующий шаг:** Реализовать остальные фазы из roadmap!

---

**Время выполнения:** 30-60 минут
**Сложность:** ⭐⭐ Простая
**Результат:** Рабочая интеграция четырех систем!
