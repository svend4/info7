# Benefits Calculator Skill

> **Путь:** `.claude/skills/benefits-calculator/SKILL.md`

---

## Скилл: Benefits Calculator (Калькулятор пособий)

Автоматический расчёт всех положенных социальных выплат, пособий и льгот на основе данных о семье.

---

## Назначение

Этот скилл принимает на вход данные о семье и автоматически рассчитывает:
- Федеральные выплаты
- Региональные пособия
- Налоговые вычеты
- Льготы и компенсации
- Итоговую сумму поддержки

---

## Вход (Input)

### Обязательные параметры:
```json
{
  "region": "Московская область",
  "familyComposition": {
    "adults": 2,
    "children": [
      {
        "age": 8,
        "disability": true,
        "disabilityGroup": "ребёнок-инвалид"
      },
      {
        "age": 3,
        "disability": false
      }
    ]
  },
  "status": ["многодетная семья"],
  "income": {
    "monthly": 45000,
    "perPerson": 11250
  },
  "employment": {
    "parent1": "работает",
    "parent2": "не работает (уход за ребёнком-инвалидом)"
  }
}
```

### Опциональные параметры:
```json
{
  "housingCosts": {
    "rent": 25000,
    "utilities": 6000
  },
  "existingBenefits": [
    "пенсия по инвалидности ребёнку"
  ]
}
```

---

## Выход (Output)

```json
{
  "summary": {
    "monthlyTotal": 34114.80,
    "yearlyTotal": 412677.60,
    "taxSavings": 18720,
    "benefits": [
      {
        "category": "federal",
        "name": "Социальная пенсия ребёнку-инвалиду",
        "amount": 16213.80,
        "frequency": "monthly",
        "legalBasis": "ФЗ-166, ст. 18"
      },
      {
        "category": "federal",
        "name": "Выплата по уходу за ребёнком-инвалидом",
        "amount": 10000,
        "frequency": "monthly",
        "legalBasis": "Указ Президента №175"
      },
      {
        "category": "regional",
        "name": "Пособие на ребёнка-инвалида (МО)",
        "amount": 7901,
        "frequency": "monthly",
        "legalBasis": "Закон МО №1/2006-ОЗ"
      },
      {
        "category": "regional",
        "name": "Компенсация на школьную форму",
        "amount": 3000,
        "frequency": "yearly",
        "legalBasis": "Закон МО №1/2006-ОЗ"
      }
    ],
    "nonMonetaryBenefits": [
      "Бесплатные лекарства",
      "Бесплатный проезд (ребёнок + сопровождающий)",
      "Путёвки в санатории",
      "Скидка 50% на ЖКХ"
    ]
  }
}
```

---

## Алгоритм расчёта

### Шаг 1: Определение категорий
```python
def determine_categories(family_data):
    categories = []

    # Проверка на многодетность
    if len(family_data["children"]) >= 3:
        categories.append("многодетная семья")

    # Проверка на инвалидность детей
    for child in family_data["children"]:
        if child.get("disability"):
            categories.append("семья с ребёнком-инвалидом")

    # Проверка на малоимущность
    regional_subsistence = get_regional_subsistence(family_data["region"])
    if family_data["income"]["perPerson"] < regional_subsistence:
        categories.append("малоимущая семья")

    return categories
```

### Шаг 2: Федеральные выплаты
```python
def calculate_federal_benefits(family_data, categories):
    benefits = []

    # Пособия на детей
    for child in family_data["children"]:
        if child["age"] < 1.5:
            benefits.append({
                "name": "Пособие до 1.5 лет",
                "amount": calculate_child_care_benefit(family_data["income"]),
                "legalBasis": "ФЗ-81"
            })

        if child.get("disability"):
            benefits.append({
                "name": "Социальная пенсия ребёнку-инвалиду",
                "amount": 16213.80,  # 2026
                "legalBasis": "ФЗ-166, ст. 18"
            })

            # Проверка на неработающего родителя
            if not is_both_parents_working(family_data):
                benefits.append({
                    "name": "Выплата по уходу за ребёнком-инвалидом",
                    "amount": 10000,
                    "legalBasis": "Указ Президента №175"
                })

    # Путинские выплаты (от 0 до 3 лет)
    for child in family_data["children"]:
        if child["age"] < 3:
            if is_eligible_for_putin_payments(family_data):
                benefits.append({
                    "name": "Ежемесячная выплата на ребёнка до 3 лет",
                    "amount": get_regional_child_subsistence(family_data["region"]),
                    "legalBasis": "ФЗ-418"
                })

    # Материнский капитал (единовременно)
    if is_eligible_for_maternity_capital(family_data):
        benefits.append({
            "name": "Материнский капитал",
            "amount": calculate_maternity_capital(family_data),
            "frequency": "one-time",
            "legalBasis": "ФЗ-256"
        })

    return benefits
```

### Шаг 3: Региональные выплаты
```python
def calculate_regional_benefits(family_data, region):
    benefits = []

    if region == "Московская область":
        # Пособия МО
        for child in family_data["children"]:
            if child.get("disability"):
                benefits.append({
                    "name": "Пособие на ребёнка-инвалида (МО)",
                    "amount": 7901,
                    "legalBasis": "Закон МО №1/2006-ОЗ"
                })

            # Школьная форма
            if 6 <= child["age"] <= 17:
                benefits.append({
                    "name": "Компенсация на школьную форму",
                    "amount": 3000,
                    "frequency": "yearly",
                    "legalBasis": "Закон МО №1/2006-ОЗ"
                })

    elif region == "Москва":
        # Пособия г. Москвы (обычно выше)
        # ...

    elif region == "Санкт-Петербург":
        # Пособия СПб
        # ...

    # И так далее для других регионов

    return benefits
```

### Шаг 4: Налоговые вычеты
```python
def calculate_tax_deductions(family_data):
    deductions = []

    for i, child in enumerate(family_data["children"], start=1):
        if child.get("disability"):
            deduction_amount = 12000  # руб/мес на ребёнка-инвалида
        elif i == 1 or i == 2:
            deduction_amount = 1400   # на первого и второго ребёнка
        else:
            deduction_amount = 3000   # на третьего и последующих

        # Налоговая экономия = вычет × 13%
        monthly_savings = deduction_amount * 0.13
        yearly_savings = monthly_savings * 12

        deductions.append({
            "name": f"Налоговый вычет на ребёнка {i}",
            "deduction": deduction_amount,
            "monthlySavings": monthly_savings,
            "yearlySavings": yearly_savings,
            "legalBasis": "НК РФ, ст. 218"
        })

    return deductions
```

### Шаг 5: Льготы на ЖКХ
```python
def calculate_housing_subsidies(family_data, housing_costs):
    subsidies = []

    # Льгота для семей с детьми-инвалидами
    for child in family_data["children"]:
        if child.get("disability"):
            subsidy_amount = housing_costs["utilities"] * 0.5
            subsidies.append({
                "name": "Скидка 50% на ЖКХ",
                "amount": subsidy_amount,
                "legalBasis": "ФЗ-181, ст. 17"
            })
            break  # Только одна льгота на семью

    # Субсидия малоимущим
    if is_eligible_for_housing_subsidy(family_data, housing_costs):
        subsidy = calculate_housing_subsidy_amount(family_data, housing_costs)
        subsidies.append({
            "name": "Жилищная субсидия",
            "amount": subsidy,
            "legalBasis": "Жилищный кодекс РФ, ст. 159"
        })

    return subsidies
```

---

## Вспомогательные функции

### Прожиточный минимум по регионам (2026)
```python
REGIONAL_SUBSISTENCE = {
    "Москва": {
        "child": 18770,
        "adult": 24801,
        "pensioner": 18227
    },
    "Московская область": {
        "child": 16844,
        "adult": 21371,
        "pensioner": 15521
    },
    "Санкт-Петербург": {
        "child": 15181,
        "adult": 19181,
        "pensioner": 14918
    },
    # ... другие регионы
}
```

### Материнский капитал (2026)
```python
def calculate_maternity_capital(family_data):
    children_count = len(family_data["children"])

    if children_count == 1:
        return 631000  # на первого ребёнка
    elif children_count >= 2:
        # Если не получали на первого - полная сумма
        # Если получали - доплата
        return 834000  # на второго (или разница)
```

### Путинские выплаты (от 0 до 3 лет)
```python
def is_eligible_for_putin_payments(family_data):
    """
    Условия:
    - Ребёнок до 3 лет
    - Среднедушевой доход < 2 прожиточных минимума
    """
    region = family_data["region"]
    subsistence = REGIONAL_SUBSISTENCE[region]["adult"]
    threshold = subsistence * 2

    return family_data["income"]["perPerson"] < threshold
```

---

## Использование скилла

### Из агента Social Law Specialist

```markdown
Для точного расчёта всех выплат используйте скилл benefits-calculator:

**Вход:**
- Регион: Московская область
- Дети: 2 (8 лет - инвалид, 3 года)
- Доход: 45000 руб/мес (11250 руб на человека)
- Работа: 1 родитель работает, 1 не работает (уход)

**Результат:**
[JSON с полным расчётом]
```

### Из команды /social-law

```bash
/social-law "многодетная семья, 3 детей, один инвалид, Москва"

# Внутри агент вызовет:
benefits = calculate_benefits({
  "region": "Москва",
  "children": [8, 5, 2],
  "disability": [True, False, False]
})
```

---

## Output в readable формате

После расчёта скилл форматирует вывод для пользователя:

```markdown
### 💰 РАСЧЁТ ВЫПЛАТ

**Ваша ситуация:**
- Регион: Московская область
- Семья: 2 взрослых, 2 детей (8 лет - инвалид, 3 года)
- Доход: 45 000 руб/мес (11 250 руб на человека)

---

**ФЕДЕРАЛЬНЫЕ ВЫПЛАТЫ:**

1. Социальная пенсия ребёнку-инвалиду
   - 16 213,80 руб/мес
   - Основание: ФЗ-166, ст. 18

2. Выплата по уходу за ребёнком-инвалидом
   - 10 000 руб/мес
   - Основание: Указ Президента №175
   - Условие: неработающий родитель

---

**РЕГИОНАЛЬНЫЕ ВЫПЛАТЫ (Московская область):**

3. Пособие на ребёнка-инвалида
   - 7 901 руб/мес
   - Основание: Закон МО №1/2006-ОЗ

4. Компенсация на школьную форму
   - 3 000 руб/год
   - Основание: Закон МО №1/2006-ОЗ

---

**НАЛОГОВЫЕ ВЫЧЕТЫ:**

5. Вычет на ребёнка-инвалида
   - Вычет: 12 000 руб/мес
   - Экономия: 1 560 руб/мес (18 720 руб/год)
   - Основание: НК РФ, ст. 218

6. Вычет на второго ребёнка
   - Вычет: 1 400 руб/мес
   - Экономия: 182 руб/мес (2 184 руб/год)

---

**ЛЬГОТЫ НА ЖКХ:**

7. Скидка 50% на коммунальные услуги
   - Экономия: 3 000 руб/мес (при ЖКХ 6000 руб)
   - Основание: ФЗ-181, ст. 17

---

**НАТУРАЛЬНЫЕ ЛЬГОТЫ:**
- Бесплатные лекарства по рецепту
- Бесплатный проезд (ребёнок + 1 сопровождающий)
- Путёвки в санатории (через СФР)

---

### 📊 ИТОГО

| Категория | Ежемесячно | В год |
|-----------|-----------|--------|
| Денежные выплаты | 34 114,80 руб | 409 377,60 руб |
| Налоговая экономия | 1 742 руб | 20 904 руб |
| Льготы ЖКХ | 3 000 руб | 36 000 руб |
| Школьная форма | - | 3 000 руб |
| **ВСЕГО** | **38 856,80 руб** | **469 281,60 руб** |

+ Натуральные льготы (лекарства, проезд, санатории)
```

---

## Обновление данных

Скилл должен регулярно обновляться при:
- Индексации пособий (обычно февраль)
- Изменении прожиточного минимума (ежеквартально)
- Новых законах о социальной поддержке
- Изменении региональных программ

**Версия данных:** 2026-Q1

---

## Интеграция с Beads

После расчёта создавайте задачи в Beads:

```markdown
Создать задачу:

**Title:** Оформление социальных выплат (38 856 руб/мес)

**Подзадачи:**
1. [ ] Пенсия ребёнку-инвалиду (16 213 руб) - СФР
2. [ ] Выплата по уходу (10 000 руб) - СФР
3. [ ] Региональное пособие (7 901 руб) - Соцзащита МО
4. [ ] Школьная форма (3 000 руб/год) - Через школу
5. [ ] Налоговый вычет (1 742 руб экономии) - Работодатель
6. [ ] Льгота ЖКХ (3 000 руб экономии) - МФЦ

**Приоритет:** high
**Срок:** 30 дней
```

---

## Версия

- **Версия скилла:** 2.0.0
- **Данные актуальны на:** 2026-Q1
- **Совместимость:** Claude Code Orchestrator Kit 1.4.19+
