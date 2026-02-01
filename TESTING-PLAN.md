# 🧪 Orchestrator Kit Testing Plan

## 📁 Test Projects Created

### 1️⃣ Simple Project: Todo API
**Location:** `/home/user/info7/test-projects/simple-todo-api`

**Tech Stack:**
- Node.js + Express
- TypeScript
- In-memory storage

**Intentional Issues:**
- ❌ Missing input validation
- ❌ Array access bugs
- ❌ No error handling
- ❌ Missing TypeScript types
- ❌ No tests
- ❌ No documentation for functions

---

## 🧪 Testing Scenarios

### Phase 1: Bug Detection & Fixing

#### Test 1: bug-hunter agent
```bash
cd test-projects/simple-todo-api
```
**Ask Claude:**
```
"Используй агента bug-hunter для сканирования проекта simple-todo-api"
```

**Expected Results:**
- Should find ~5-7 bugs
- Generate bug-hunting-report.md
- Categorize by priority (critical, high, medium, low)

---

#### Test 2: bug-fixer agent
**Ask Claude:**
```
"Используй агента bug-fixer для исправления критических и высоких багов"
```

**Expected Results:**
- Fix array access bug
- Add error handling
- Add input validation
- Run type-check ✅
- Create git commit

---

### Phase 2: TypeScript Types

#### Test 3: typescript-types-specialist
**Ask Claude:**
```
"Используй агента typescript-types-specialist для добавления типов в проект"
```

**Expected Results:**
- Create proper Todo interface
- Add Request/Response types
- Add type exports
- Update code to use types

---

### Phase 3: Testing

#### Test 4: test-writer agent
**Ask Claude:**
```
"Используй агента test-writer для создания тестов"
```

**Expected Results:**
- Create tests/index.test.ts
- Test all API endpoints
- Mock express requests
- 80%+ coverage

---

### Phase 4: Code Review

#### Test 5: code-reviewer agent
**Ask Claude:**
```
"Используй агента code-reviewer для полного code review"
```

**Expected Results:**
- Security check ✅
- Best practices check ✅
- Performance suggestions
- Documentation suggestions
- Generate review report

---

### Phase 5: Health Commands

#### Test 6: /health-bugs command
**Ask Claude:**
```
/health-bugs
```

**Expected Results:**
- Automatically run bug-hunter
- Automatically fix bugs by priority
- Run quality gates (type-check, build)
- Generate comprehensive report
- Create commits

---

#### Test 7: /health-security command
**Ask Claude:**
```
/health-security
```

**Expected Results:**
- Scan for SQL injection vectors
- Check XSS vulnerabilities
- Validate input sanitization
- Check dependency vulnerabilities
- Generate security report

---

## 2️⃣ Complex Project: Full-stack Task Manager

**Will be created after simple project testing**

**Tech Stack:**
- Next.js 15 (App Router)
- tRPC for API
- Supabase (PostgreSQL + Auth + Realtime)
- Tailwind CSS
- shadcn/ui components

**Features to Test:**
- Database design (database-architect)
- Full-stack development (fullstack-nextjs-specialist)
- UI design (nextjs-ui-designer)
- Supabase integration (supabase-auditor)
- Performance optimization (performance-optimizer)
- Accessibility (accessibility-tester)

---

## 📊 Agent Coverage Matrix

| Agent | Simple Project | Complex Project |
|-------|---------------|-----------------|
| **bug-hunter** | ✅ Test 1 | ✅ |
| **bug-fixer** | ✅ Test 2 | ✅ |
| **typescript-types-specialist** | ✅ Test 3 | ✅ |
| **test-writer** | ✅ Test 4 | ✅ |
| **code-reviewer** | ✅ Test 5 | ✅ |
| **utility-builder** | ⏸️ Future | ✅ |
| **database-architect** | ❌ N/A | ✅ |
| **fullstack-nextjs-specialist** | ❌ N/A | ✅ |
| **nextjs-ui-designer** | ❌ N/A | ✅ |
| **supabase-auditor** | ❌ N/A | ✅ |
| **performance-optimizer** | ⏸️ Future | ✅ |
| **accessibility-tester** | ❌ N/A | ✅ |

---

## 🚀 Quick Start

### Start with Simple Project:

```bash
# Go to simple project
cd test-projects/simple-todo-api

# Run first test
# Ask Claude: "Используй агента bug-hunter для сканирования проекта"
```

### Expected Timeline:
- Phase 1 (Bug Detection): 5-10 min
- Phase 2 (Types): 3-5 min
- Phase 3 (Tests): 5-10 min
- Phase 4 (Review): 3-5 min
- Phase 5 (Health): 15-20 min

**Total for Simple Project:** ~40-60 minutes

---

## 📈 Success Criteria

### Simple Project:
- ✅ All bugs found and fixed
- ✅ TypeScript strict mode passes
- ✅ 80%+ test coverage
- ✅ Code review passes
- ✅ No security vulnerabilities

### Complex Project:
- ✅ Database schema properly designed
- ✅ Full CRUD operations work
- ✅ Authentication implemented
- ✅ UI/UX passes accessibility
- ✅ Performance scores >90
- ✅ Real-time features work

---

## 🎯 Next Steps

1. **Now:** Test bug-hunter on simple project
2. **Next:** Test other agents on simple project
3. **Then:** Create complex project
4. **Finally:** Test advanced agents on complex project

---

**Ready to start?**
Just ask: `"Используй агента bug-hunter для сканирования test-projects/simple-todo-api"`
