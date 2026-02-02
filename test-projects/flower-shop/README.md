# 🌸 Flower Shop - Интернет-магазин цветов

**Технологии:** Next.js 15, Supabase, tRPC, TypeScript, Tailwind CSS

---

## 📋 Описание проекта

Полнофункциональный интернет-магазин цветов с каталогом, корзиной, оформлением заказов и админ-панелью.

---

## 🗄️ Требования к базе данных

### Таблицы

#### 1. **profiles** - Профили пользователей
- `id` (uuid, FK to auth.users)
- `email` (text, NOT NULL)
- `full_name` (text)
- `phone` (text)
- `role` (enum: 'customer', 'admin')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### 2. **categories** - Категории цветов
- `id` (uuid, primary key)
- `name` (text, NOT NULL) - Например: "Розы", "Тюльпаны", "Букеты"
- `slug` (text, UNIQUE) - URL-friendly название
- `description` (text)
- `image_url` (text)
- `created_at` (timestamptz)

#### 3. **products** - Товары (цветы)
- `id` (uuid, primary key)
- `category_id` (uuid, FK to categories)
- `name` (text, NOT NULL) - Например: "Красные розы"
- `slug` (text, UNIQUE)
- `description` (text)
- `price` (numeric, NOT NULL) - Цена за единицу
- `image_url` (text)
- `stock_quantity` (integer, default 0) - Количество на складе
- `is_available` (boolean, default true)
- `is_featured` (boolean, default false) - Для главной страницы
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### 4. **orders** - Заказы
- `id` (uuid, primary key)
- `user_id` (uuid, FK to profiles)
- `order_number` (text, UNIQUE) - Например: "ORD-20260202-001"
- `status` (enum: 'pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled')
- `total_amount` (numeric, NOT NULL)
- `delivery_address` (text, NOT NULL)
- `delivery_date` (date) - Желаемая дата доставки
- `delivery_time` (text) - Например: "10:00-12:00"
- `customer_name` (text, NOT NULL)
- `customer_phone` (text, NOT NULL)
- `customer_email` (text)
- `notes` (text) - Комментарий к заказу
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### 5. **order_items** - Позиции в заказе
- `id` (uuid, primary key)
- `order_id` (uuid, FK to orders ON DELETE CASCADE)
- `product_id` (uuid, FK to products)
- `quantity` (integer, NOT NULL)
- `price_at_purchase` (numeric, NOT NULL) - Цена на момент покупки
- `created_at` (timestamptz)

#### 6. **cart_items** - Корзина (временное хранение)
- `id` (uuid, primary key)
- `user_id` (uuid, FK to profiles)
- `product_id` (uuid, FK to products)
- `quantity` (integer, NOT NULL)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- UNIQUE(user_id, product_id) - Один товар один раз в корзине

### ENUMs

```sql
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled');
```

### RLS Политики

**profiles:**
- SELECT: Authenticated users (public read для имен в заказах)
- INSERT/UPDATE/DELETE: Owner only (id = auth.uid())

**categories:**
- SELECT: Public (все могут читать каталог)
- INSERT/UPDATE/DELETE: Admin only (role = 'admin')

**products:**
- SELECT: Public (все могут видеть товары)
- INSERT/UPDATE/DELETE: Admin only (role = 'admin')

**orders:**
- SELECT: Owner или Admin
- INSERT: Authenticated users
- UPDATE: Admin only (изменение статуса)
- DELETE: Admin only

**order_items:**
- SELECT: Owner (через order_id) или Admin
- INSERT: При создании заказа
- UPDATE/DELETE: Admin only

**cart_items:**
- SELECT/INSERT/UPDATE/DELETE: Owner only (user_id = auth.uid())

### Индексы

- `products(category_id)` - Фильтрация по категориям
- `products(is_featured)` - Главная страница
- `products(is_available)` - Доступные товары
- `orders(user_id)` - Заказы пользователя
- `orders(status)` - Фильтрация по статусу
- `orders(created_at DESC)` - Сортировка по дате
- `order_items(order_id)` - Позиции заказа
- `cart_items(user_id)` - Корзина пользователя

---

## 🎯 Функциональные требования

### Для покупателей:

1. **Каталог товаров**
   - Просмотр всех цветов
   - Фильтрация по категориям
   - Поиск по названию
   - Просмотр деталей товара

2. **Корзина**
   - Добавление/удаление товаров
   - Изменение количества
   - Просмотр общей суммы
   - Сохранение корзины в БД

3. **Оформление заказа**
   - Форма с контактными данными
   - Выбор адреса доставки
   - Выбор даты и времени доставки
   - Комментарий к заказу
   - Создание заказа

4. **Личный кабинет**
   - Просмотр истории заказов
   - Отслеживание статуса заказа
   - Редактирование профиля

### Для администраторов:

1. **Управление товарами**
   - Создание/редактирование/удаление товаров
   - Управление наличием и ценами
   - Загрузка изображений

2. **Управление категориями**
   - Создание/редактирование категорий

3. **Управление заказами**
   - Просмотр всех заказов
   - Изменение статуса заказа
   - Фильтрация по статусу и дате

---

## 🎨 UI/UX Требования

### Дизайн
- Светлая, воздушная цветовая схема (пастельные тона)
- Крупные изображения цветов
- Удобная навигация
- Адаптивный дизайн (mobile-first)

### Страницы

1. **Главная страница**
   - Hero секция с призывом к действию
   - Избранные товары (is_featured = true)
   - Категории с изображениями
   - О магазине

2. **Каталог** (`/catalog`)
   - Сетка товаров с карточками
   - Фильтры по категориям
   - Поиск
   - Сортировка (по цене, популярности)

3. **Страница товара** (`/products/[slug]`)
   - Крупное изображение
   - Описание
   - Цена
   - Кнопка "В корзину"
   - Похожие товары

4. **Корзина** (`/cart`)
   - Список товаров с количеством
   - Итоговая сумма
   - Кнопка "Оформить заказ"

5. **Оформление заказа** (`/checkout`)
   - Форма с данными доставки
   - Выбор даты и времени
   - Итоговая сумма
   - Подтверждение

6. **Личный кабинет** (`/profile`)
   - Информация о пользователе
   - История заказов

7. **Админ-панель** (`/admin`)
   - Dashboard со статистикой
   - Управление товарами
   - Управление заказами

---

## 🚀 Агенты для реализации

1. **database-architect** - Спроектировать PostgreSQL схему
2. **fullstack-nextjs-specialist** - Создать полное приложение (Next.js 15 + tRPC + Supabase)
3. **nextjs-ui-designer** - Создать красивый UI с shadcn/ui
4. **supabase-auditor** (опционально) - Проверить безопасность БД
5. **test-writer** (опционально) - Написать тесты

---

## 📦 Ожидаемый результат

Production-ready интернет-магазин цветов с:
- ✅ Полностью спроектированной БД с RLS политиками
- ✅ Type-safe API на tRPC
- ✅ Адаптивным UI с shadcn/ui
- ✅ Корзиной и оформлением заказов
- ✅ Админ-панелью для управления
- ✅ Аутентификацией через Supabase Auth

---

**Создано:** 2026-02-02
**Статус:** 🔄 В разработке
