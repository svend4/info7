# Security Policy

## 🔒 Reporting Security Issues

Безопасность проекта info7 и его пользователей - наш приоритет.

### Как сообщить о проблеме безопасности

**⚠️ НЕ создавайте публичный Issue для проблем безопасности!**

Вместо этого:

1. **Email:** Отправьте детали на [TBD: security@info7.org]
2. **Subject:** `[SECURITY] Brief description`
3. **Включите:**
   - Описание уязвимости
   - Шаги для воспроизведения
   - Потенциальное влияние
   - Предлагаемое решение (если есть)

### Что ожидать

- **Подтверждение:** В течение 48 часов
- **Первый ответ:** В течение 7 дней
- **Регулярные обновления:** Каждые 7 дней до решения
- **Публикация:** После исправления (координируется с вами)

---

## 🛡️ Security Best Practices

### Для пользователей документации

**info7 - это документационный проект.** Основные риски связаны с:

1. **Использование примеров кода:**
   - ✅ Всегда проверяйте код перед использованием в production
   - ✅ Валидируйте пользовательский ввод
   - ✅ Не храните секреты в коде
   - ⚠️ Примеры предназначены для демонстрации концепций

2. **Ссылки на внешние ресурсы:**
   - ✅ Проверяйте актуальность ссылок
   - ✅ Следуйте официальной документации проектов
   - ⚠️ OpenClaw имеет известные проблемы безопасности (см. FAQ)

### Для контрибьюторов

При добавлении примеров кода:

- ✅ Не включайте реальные API keys, токены, пароли
- ✅ Используйте `YOUR_API_KEY`, `YOUR_TOKEN` как плейсхолдеры
- ✅ Добавляйте комментарии о security considerations
- ✅ Следуйте [OWASP Top 10](https://owasp.org/www-project-top-ten/)

**Примеры:**

```typescript
// ❌ ПЛОХО - реальный API key
const apiKey = "sk-1234567890abcdef";

// ✅ ХОРОШО - плейсхолдер
const apiKey = process.env.ANTHROPIC_API_KEY || "YOUR_API_KEY";

// ✅ ЕЩЕ ЛУЧШЕ - с проверкой
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable is required");
}
const apiKey = process.env.ANTHROPIC_API_KEY;
```

```typescript
// ❌ ПЛОХО - SQL injection риск
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ ХОРОШО - параметризованный запрос
const query = "SELECT * FROM users WHERE id = ?";
const result = await db.query(query, [userId]);
```

---

## 🔍 Known Security Issues

### OpenClaw (Moltbot)

**Status:** ⚠️ 230+ вредоносных навыков обнаружено

**Детали:**
- Отсутствие строгой песочницы
- Слабая валидация community навыков
- Возможность выполнения произвольного кода

**Митигация:**
1. Используйте только проверенные официальные навыки
2. Аудит кода навыков перед установкой
3. Не используйте с чувствительными данными
4. Регулярно обновляйте систему

**Подробнее:** См. [FAQ.md](FAQ.md#q-безопасно-ли-использовать-openclaw)

### Orchestrator Kit

**Status:** ✅ Нет известных критичных уязвимостей

**Best practices:**
- Используйте последнюю версию Claude Code CLI
- Следуйте официальной документации Anthropic
- Валидируйте пользовательский ввод

### Leonardo AI

**Status:** 📋 Концепция (еще не реализовано)

**Planned security features:**
- Multi-layer validation
- Sandboxed execution
- Audit logging
- Role-based access control
- Security-first design

---

## 🔐 Dependency Security

### Мониторинг зависимостей

Для будущих имплементаций проекта:

```bash
# Проверка уязвимостей (npm)
npm audit

# Автоматическое исправление
npm audit fix

# Проверка уязвимостей (yarn)
yarn audit

# С Snyk
snyk test
```

### Рекомендуемые инструменты

- **[Dependabot](https://github.com/dependabot)** - Автоматические обновления зависимостей
- **[Snyk](https://snyk.io/)** - Мониторинг уязвимостей
- **[npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)** - Встроенный аудит npm
- **[OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)** - Проверка известных уязвимостей

---

## 🚨 Security Checklist

### Для разработчиков

При добавлении кода в проект:

- [ ] Нет hardcoded секретов (API keys, passwords, tokens)
- [ ] Валидация всех входных данных
- [ ] Параметризованные SQL запросы (если применимо)
- [ ] Escape HTML/JavaScript (если применимо)
- [ ] HTTPS для всех внешних соединений
- [ ] Обработка ошибок не раскрывает sensitive information
- [ ] Логирование не содержит sensitive data
- [ ] Зависимости обновлены (`npm audit`)
- [ ] Code review пройден
- [ ] Тесты безопасности написаны

### Для документации

При добавлении документации:

- [ ] Примеры кода не содержат реальных секретов
- [ ] Предупреждения о security рисках добавлены
- [ ] Best practices описаны
- [ ] Ссылки на официальные security guidelines
- [ ] Обновления security considerations в CHANGELOG

---

## 📚 Security Resources

### General

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/archive/2023/2023_top25_list.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### TypeScript/Node.js Specific

- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security](https://docs.npmjs.com/about-security-audits)
- [TypeScript Security](https://www.typescriptlang.org/docs/handbook/security.html)

### AI/ML Security

- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [Microsoft AI Security](https://www.microsoft.com/en-us/security/business/ai-machine-learning)

---

## 🏆 Security Hall of Fame

Мы благодарим следующих людей за ответственное раскрытие проблем безопасности:

*Список будет обновляться по мере получения отчетов*

---

## 📜 Disclosure Policy

### Coordinated Disclosure

Мы следуем принципам coordinated disclosure:

1. **Репортер сообщает** о проблеме приватно
2. **Мы подтверждаем** и начинаем работу над исправлением
3. **Мы информируем** репортера о прогрессе
4. **После исправления** публикуем детали
5. **Репортер получает** признание (если желает)

### Timeline

- **T+0:** Получение отчета
- **T+48h:** Подтверждение получения
- **T+7d:** Первая оценка и ответ
- **T+30d:** Целевое время для исправления (критические)
- **T+90d:** Целевое время для исправления (средние/низкие)

### Public Disclosure

После исправления:

1. Обновляем CHANGELOG.md
2. Публикуем Security Advisory на GitHub
3. Обновляем затронутую документацию
4. Добавляем репортера в Hall of Fame

---

## 🔄 Security Updates

### Как мы уведомляем

- **GitHub Security Advisories** - Для критических проблем
- **CHANGELOG.md** - Для всех security-related изменений
- **Release notes** - Highlights security fixes
- **Mailing list** (TBD) - Для подписчиков

### Versioning

Security fixes могут быть released как:

- **Patch version** (1.2.X) - Для minor security fixes
- **Minor version** (1.X.0) - Для moderate security updates
- **Major version** (X.0.0) - Для critical security overhauls

---

## ⚖️ Legal

### Safe Harbor

info7 поддерживает safe harbor для security исследователей, которые:

- ✅ Действуют добросовестно
- ✅ Сообщают приватно и ответственно
- ✅ Не используют уязвимости для вреда
- ✅ Дают нам время исправить проблему

### Scope

**В scope:**
- Документация info7
- Примеры кода в репозитории
- GitHub Actions/workflows (если есть)
- Сайт проекта (если будет)

**Вне scope:**
- Сторонние проекты (OpenClaw, Orchestrator Kit)
- Инфраструктура GitHub
- Сторонние зависимости (сообщайте их maintainers)

---

## 📞 Contact

**Security Team:** [TBD: security@info7.org]

**PGP Key:** [TBD: публичный ключ для шифрования]

**Alternative:** GitHub Security Advisories (приватное)

---

## 📊 Security Metrics

Мы отслеживаем:

- **Mean Time to Acknowledge:** < 48 часов
- **Mean Time to Fix (Critical):** < 30 дней
- **Mean Time to Fix (High):** < 60 дней
- **Mean Time to Fix (Medium/Low):** < 90 дней

---

**Последнее обновление:** 2026-02-06
**Версия Policy:** 1.0
**Следующий пересмотр:** 2026-08-06

---

**Спасибо за помощь в поддержании безопасности info7!** 🔒

https://claude.ai/code/session_01WnQdgU1MrECnhh3xfVNRAg
