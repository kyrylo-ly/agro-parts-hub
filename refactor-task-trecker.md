# Refactoring Tasks (Agro Parts Hub)

## Фаза 1: Рефакторинг Бази Даних та Infrastructure Layer
- `[x]` Крок 1.1: Оновлення схеми `src/db/schema/store.ts`.
  - `[x]` Видалення `parentId` з `category`.
  - `[x]` Видалення `categoryId` з `product`.
  - `[x]` Створення `product_to_category` (Багато-до-багатьох).
  - `[x]` Створення таблиць для атрибутів: `attribute`, `category_attribute`, `product_attribute_value`.
  - `[x]` Оновлення зв'язків (relations).
- `[ ]` Крок 1.2: Створення структури `src/modules/catalog/infrastructure/`.
- `[x]` Крок 1.3: Оновлення тестів (`tests/setup/global-setup.ts`) для нової схеми БД.
- `[ ]` Крок 1.4: Перенесення `db.select()` запитів у DAL (Data Access Layer) з `'use cache'`.

## Фаза 2: Application Layer (Бізнес-логіка)
- `[ ]` Створення `src/modules/catalog/application/`.
- `[ ]` Перенесення та рефакторинг Server Actions для каталогу.
- `[ ]` Налаштування `revalidateTag` при мутаціях.

## Фаза 3: Presentation Layer та State
- `[ ]` Видалення Zustand для серверних станів.
- `[ ]` Переведення клієнтських станів (фільтри, пошук) на URL `searchParams`.
- `[ ]` Стандартизація UI компонентів (перевірка `render` замість `asChild`).
