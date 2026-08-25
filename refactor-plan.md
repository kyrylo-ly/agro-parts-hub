# Повний рефакторинг Agro Parts Hub

Оновлений план на основі [оригінального плану](file:///Users/kyrylo/dev/repos/agro-parts-hub/refactor-plan.md), [мого фідбеку](file:///Users/kyrylo/.gemini/antigravity-ide/brain/82c37912-c566-4e5d-9adb-8a228eb33426/refactor_feedback.md) та ваших уточнень.

---

## Відповіді на ваші питання

### 1. Кешувати назавжди та ревалідувати тільки при діях адміна?

**Так, це ідеальна стратегія для e-commerce!** Ваші дані змінюються тільки коли адмін щось робить, тому:

- `cacheLife('max')` — stale: 5m (клієнт), revalidate: 30 днів (сервер), expire: 1 рік
- `cacheTag(...)` — для таргетної інвалідації
- `updateTag(...)` — в Server Actions адміна, щоб він одразу бачив свої зміни

Додатково створимо кастомний профіль `'catalog'` в `next.config.ts` для тонкого контролю:

```ts
cacheLife: {
  catalog: {
    stale: 300,           // 5 хвилин на клієнті
    revalidate: Infinity, // НІКОЛИ не ревалідувати по таймеру
    expire: 31536000,     // 1 рік до повного expire
  },
},
```

> [!IMPORTANT]
> З `revalidate: Infinity` дані ніколи не оновлюються автоматично — тільки через `updateTag`/`revalidateTag`. Це саме те, що вам потрібно: адмін додав товар → `updateTag('products')` → юзер бачить оновлення.

### 2. Zustand vs React 19 / Next.js 16 для кошика

**Zustand persist залишається найкращим рішенням для кошика.** Ось чому:

| Інструмент | Для чого підходить | Кошик? |
|---|---|---|
| `useState` / `useReducer` | Локальний UI state | ❌ Не персиститься |
| `useSyncExternalStore` | Підписка на зовнішній store | ⚠️ Потрібно писати свій localStorage wrapper (~40 рядків коду, яких Zustand persist вже дає безкоштовно) |
| React Query / TanStack | Серверний стан (fetch → cache → refetch) | ❌ Кошик — це клієнтський стан, не серверний |
| `useOptimistic` / `useActionState` | Optimistic UI для Server Actions | ❌ Не для persistent state |
| **Zustand persist** | Клієнтський стан з localStorage | ✅ **Ідеально** — persist, hydration, devtools, SSR-safe |

**Рішення:**
- **Залишити** `zustand` в `package.json` для кошика та обраного
- **Не додавати** React Query (жодного use-case для нього в цьому проєкті)
- Фільтри/пошук/пагінація → URL `searchParams`
- Серверні дані → `"use cache"` + Server Components

### 3. Категорії — гнучкий UX + дерево для навігації

**Так, це можливо без втрати performance!** Стандартний e-commerce патерн:

```
Схема:
┌──────────┐     parentId      ┌──────────┐
│ category │◄───────(self)─────│ category │  ← Ієрархія для UI/навігації
└──────────┘                   └──────────┘
      ▲                              ▲
      │ M2M                          │ M2M
┌─────┴──────┐               ┌──────┴──────┐
│product_to_ │               │product_to_  │  ← Товар може бути в багатьох категоріях
│ category   │               │ category    │
└─────┬──────┘               └──────┬──────┘
      │                              │
      ▼                              ▼
┌──────────┐                 ┌──────────┐
│ product  │                 │ product  │    ← Один товар — багато категорій
└──────────┘                 └──────────┘
```

**Приклад:** Підшипник 6205 може бути одночасно в:
- "Ходова → Підшипники"
- "Двигун → Підшипники"
- "Підшипники" (як окрема категорія)

Тобто `parentId` залишається для дерева категорій в UI, а `product_to_category` M2M дозволяє товару бути в будь-якій кількості категорій. Performance не страждає, бо:
- PK на `product_to_category(product_id, category_id)` для "категорії товару"
- Додатковий індекс на `category_id` для "товари категорії"
- Запити залишаються простими JOIN'ами

---

## Архітектурні рішення

### Модульна структура (спрощена)

Замість 4 шарів DDD — прагматична 2-3 шарова модульна архітектура:

```text
src/
  modules/
    catalog/                  # Домен: Товари, Категорії, Бренди
      queries.ts              # DAL: "use cache" + cacheTag + cacheLife('catalog')
      actions.ts              # Server Actions: мутації + updateTag
      schemas.ts              # Zod 4 схеми + типи
      components/             # UI: ProductCard, CategoryList, etc.
    cart/                     # Домен: Кошик (Zustand persist)
      store.ts                # useCartStore (поточний use-cart.ts)
      components/             # CartSheet, CartButton
    orders/                   # Домен: Замовлення, Чекаут
      queries.ts
      actions.ts
      schemas.ts
      components/
    admin/                    # Домен: Адмін-панель
      queries.ts              # Адмін-специфічні запити
      actions.ts              # CRUD actions з updateTag
  app/                        # Next.js routing — тільки composition
  db/                         # Drizzle: schema, migrations, connection
    schema/
      store.ts                # Єдиний файл схеми (залишаємо)
  components/ui/              # Shared design-system (shadcn/base-ui)
  lib/                        # Утиліти, константи, auth
```

### Стратегія кешування

| Що | Профіль | Інвалідація |
|---|---|---|
| Товари, категорії, бренди, колекції | `cacheLife('catalog')` | `updateTag` в Server Actions адміна |
| Головна сторінка (aggregated) | `cacheLife('catalog')` | Автоматично через ті ж теги |
| Пошук (quick search) | Без кешу | Завжди свіжий |
| Сторінка каталогу з фільтрами | `cacheLife('catalog')` для даних, `<Suspense>` для `searchParams` |
| Адмін-лістинг | Без кешу (або `cacheLife('minutes')`) | Адмін має бачити актуальне |

### Інвалідація тегів

```
updateTag('products')      → списки товарів, головна, каталог
updateTag('product-{slug}') → конкретна сторінка товару
updateTag('categories')    → меню, навігація, списки
updateTag('brands')        → бренди
updateTag('collections')   → колекції
```

---

## Proposed Changes

### Фаза 0: Підготовка (не чіпаємо бізнес-логіку)

---

#### [MODIFY] [`next.config.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/next.config.ts)

- ✅ Додати `cacheComponents: true` (вже зроблено!)
- Додати кастомний `cacheLife` профіль `'catalog'`

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    catalog: {
      stale: 300,           // 5 хв клієнт
      revalidate: Infinity, // тільки on-demand
      expire: 31536000,     // 1 рік
    },
  },
  reactCompiler: true,
  // ...
};
```

#### Видалення `revalidate` route segment configs

Пройтися по всіх сторінках та видалити `export const revalidate = ...`:
- [`src/app/(layout)/product/[slug]/page.tsx`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/app/(layout)/product/[slug]/page.tsx#L16) — `revalidate = 7200`
- Будь-які інші сторінки з `revalidate`, `dynamic`, `fetchCache`

#### Додати `instant = false` на сторінки що поки не мігровані

```bash
npx @next/codemod@canary cache-components-instant-false ./src/app
```

Це дозволить мати **робочий build** поки ми мігруємо поетапно.

---

### Фаза 1: Схема БД + Міграції

---

#### [MODIFY] [`src/db/schema/store.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/db/schema/store.ts)

Зміни, частина яких вже в unstaged diff:

1. **Повернути `parentId`** в таблицю `category` (для дерева в UI)
2. **Залишити `productToCategory`** M2M (вже є)
3. **Залишити EAV** (`attribute`, `categoryAttribute`, `productAttributeValue`) — вже є
4. **Видалити `categoryId`** з `product` — вже зроблено
5. **Додати індекс** на `categoryId` в `product_to_category`:
   ```ts
   (t) => [
     primaryKey({ columns: [t.productId, t.categoryId] }),
     index("ptc_category_id_idx").on(t.categoryId),
   ]
   ```
6. **Видалити GIN-індекс** з `attributes` JSONB (пізніше, коли EAV повністю працює)

#### Drizzle міграція

```bash
pnpm db:gen    # згенерувати міграцію
pnpm db:migrate # застосувати до Neon
```

#### [MODIFY] [`tests/setup/global-setup.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/tests/setup/global-setup.ts)

Оновити seed для нової схеми (частково вже зроблено в unstaged diff).

---

### Фаза 2: Міграція сервісів → модулі з `"use cache"`

---

#### [NEW] `src/modules/catalog/queries.ts`

Об'єднати та замінити:
- [`src/services/product-service.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/services/product-service.ts) (read-функції)
- [`src/services/category-service.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/services/category-service.ts)
- [`src/services/brand-service.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/services/brand-service.ts)
- [`src/services/collection-service.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/services/collection-service.ts)
- [`src/services/homepage-service.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/services/homepage-service.ts)
- [`src/modules/catalog/infrastructure/product.repository.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/modules/catalog/infrastructure/product.repository.ts) (вже частково мігрований)

Кожна функція:
```ts
import { cacheLife, cacheTag } from "next/cache";

export async function getPublicProductBySlug(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.PRODUCTS, getProductTag(slug));
  // ... db query з новою M2M схемою
}
```

> [!IMPORTANT]
> Файл може бути великий. Якщо потрібно — розбити на `catalog/product-queries.ts`, `catalog/category-queries.ts`, `catalog/brand-queries.ts`. Головне — `"use cache"` + `cacheLife("catalog")` + `cacheTag(...)` в кожній функції.

#### [NEW] `src/modules/catalog/actions.ts`

Об'єднати та мігрувати:
- [`src/actions/products.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/actions/products.ts)
- [`src/actions/categories.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/actions/categories.ts)
- [`src/actions/brands.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/actions/brands.ts)
- [`src/actions/collections.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/actions/collections.ts)

Ключова зміна — `revalidateTag` → `updateTag`:
```ts
"use server";
import { updateTag } from "next/cache";

export async function createProduct(input: ProductInput) {
  await requireAdmin();
  // ... create product + insert product_to_category M2M
  updateTag(CACHE_TAGS.PRODUCTS);       // списки оновлюються
  updateTag(CACHE_TAGS.NEW_ARRIVALS);   // нові надходження
}

export async function updateProduct(id: string, input: ProductInput) {
  await requireAdmin();
  // ... update + sync product_to_category
  updateTag(CACHE_TAGS.PRODUCTS);
  updateTag(getProductTag(oldSlug));     // конкретна сторінка
}
```

> [!NOTE]
> `updateProduct` тепер має оновлювати `product_to_category` (видалити старі зв'язки, вставити нові). А `productSchema` має `categoryIds: z.array(...)` замість `categoryId`.

#### [NEW] `src/modules/catalog/schemas.ts`

Мігрувати та покращити з [`src/lib/validations.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/lib/validations.ts):
```ts
import { z } from "zod";

export const productSchema = z.object({
  categoryIds: z.array(z.number().int().positive()).min(1, "Виберіть хоча б одну категорію"),
  brandId: z.number().int().positive().optional().nullable(),
  sku: z.string().min(2).max(50),
  name: z.string().min(2).max(200),
  // ... решта без змін
});

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: slugValidation,
  parentId: z.number().int().positive().optional().nullable(), // ← ПОВЕРНУТИ
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
});
```

#### [DELETE] Старі файли (після повної міграції імпортів)

- `src/services/product-service.ts`
- `src/services/category-service.ts`
- `src/services/brand-service.ts`
- `src/services/collection-service.ts`
- `src/services/homepage-service.ts`
- `src/services/types.ts`
- `src/actions/products.ts`
- `src/actions/categories.ts`
- `src/actions/brands.ts`
- `src/actions/collections.ts`
- `src/modules/catalog/infrastructure/` (тимчасова директорія)

---

### Фаза 3: Оновлення сторінок (Presentation)

---

#### Оновити імпорти в усіх сторінках

~20 файлів (див. список нижче) мають імпортувати з `@/modules/catalog/queries` та `@/modules/catalog/actions` замість старих `@/services/*` та `@/actions/*`.

**Файли для оновлення:**

| Файл | Що змінити |
|---|---|
| `src/app/(layout)/page.tsx` | homepage queries |
| `src/app/(layout)/categories/page.tsx` | category queries |
| `src/app/(layout)/categories/[slug]/page.tsx` | category + product queries |
| `src/app/(layout)/brands/page.tsx` | brand queries |
| `src/app/(layout)/brands/[slug]/page.tsx` | brand + product queries |
| `src/app/(layout)/bestsellers/page.tsx` | bestsellers query |
| `src/app/(layout)/new/page.tsx` | new arrivals query |
| `src/app/(layout)/promotions/page.tsx` | promotions query |
| `src/app/(layout)/search/page.tsx` | search query |
| `src/app/(layout)/collection/[slug]/page.tsx` | collection query |
| `src/app/(layout)/admin/products/*` | admin queries + actions |
| `src/app/(layout)/admin/categories/*` | admin queries + actions |
| `src/app/(layout)/admin/brands/page.tsx` | admin queries + actions |
| `src/app/(layout)/layout.tsx` | categories for nav |
| `src/app/sitemap.ts` | product slugs query |
| `src/actions/client.ts` | reexports |

#### Додати `<Suspense>` boundaries

Для сторінок з `searchParams` (каталог, пошук, адмін):

```tsx
// src/app/(layout)/categories/[slug]/page.tsx
import { Suspense } from "react";

export default function CategoryPage({ params, searchParams }: PageProps<'/categories/[slug]'>) {
  return (
    <>
      <Suspense fallback={<BreadcrumbSkeleton />}>
        <CategoryHeader params={params} />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <CategoryProducts params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
```

#### Видалити `instant = false`

Після міграції кожної сторінки — видалити `export const instant = false`.

---

### Фаза 4: Reorganize Zustand + Client State

---

#### [MOVE] `src/store/use-cart.ts` → `src/modules/cart/store.ts`

Вміст без змін. Zustand persist залишається для кошика та обраного.

#### [MOVE] `src/store/use-favorites.ts` → `src/modules/cart/favorites-store.ts`

Вміст без змін.

#### [DELETE] `src/store/` (після переміщення)

---

### Фаза 5: Cleanup

---

- Видалити порожню `src/services/` директорію
- Видалити порожню `src/actions/` директорію (крім `auth.ts`, `admin-auth.ts`, `upload.ts` — їх перемістити у відповідні модулі або залишити в `src/lib/`)
- Видалити порожню `src/types/` директорію
- Оновити `src/lib/validations.ts` → видалити дублюючі схеми що вже є в `modules/*/schemas.ts`
- Перевірити `src/lib/domain/product.ts` — перемістити в `modules/catalog/schemas.ts` або `modules/catalog/utils.ts`

---

## Verification Plan

### Automated Tests

```bash
# Після кожної фази:
pnpm build                 # Перевірити що компіляція проходить
pnpm run test:e2e           # E2E тести: auth, cache-invalidation

# Після Фази 1 (DB):
pnpm db:gen                 # Drizzle міграція
pnpm db:migrate             # Застосувати

# Після Фази 2 (cache):
NEXT_PRIVATE_DEBUG_CACHE=1 pnpm dev  # Перевірити cache hits/misses
```

### Manual Verification

- Після Фази 2: перевірити що `"use cache"` працює — додати товар через адмін, переконатись що він з'являється на сторінці без перезавантаження
- Після Фази 3: перевірити `<Suspense>` — сторінки каталогу мають показувати skeleton під час завантаження
- Після всіх фаз: deploy на Vercel staging, перевірити Lighthouse Performance

---

## Open Questions

> [!IMPORTANT]
> **Категорії: Яка максимальна глибина вкладеності?**
> Якщо 2-3 рівні — простий `parentId` достатній. Якщо потрібно 5+ рівнів — варто розглянути materialized path (`path: text` стовпець, наприклад `/electronics/engines/bearings/`). Closure Table — оверкіл для цього масштабу.

> [!IMPORTANT]
> **EAV атрибути: Чи потрібна фільтрація по атрибутах у каталозі зараз?**
> Якщо ні — можна відкласти EAV-фільтрацію на наступну ітерацію та зосередитись на базовій міграції M2M. Таблиці `attribute`, `category_attribute`, `product_attribute_value` вже створені, але UI для них можна додати пізніше.
