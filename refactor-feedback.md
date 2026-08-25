# Фідбек по плану рефакторингу та змінах

## TL;DR

План загалом **добрий**, архітектурне бачення правильне. Але є серйозні прогалини, невідповідності та кращі альтернативи. Нижче — детальний розбір.

---

## 1. Фідбек по змінах (unstaged diff)

### ✅ Що добре

- **`productToCategory` Many-to-Many** — правильне рішення, видалення `categoryId` з product
- **EAV система** (`attribute`, `category_attribute`, `product_attribute_value`) — гарна нормалізована структура
- **Новий `product.repository.ts`** — правильний крок до модульної архітектури, `"use cache"` + `cacheTag` замість `unstable_cache`
- **Оновлення `global-setup.ts`** — підтримка E2E тестів синхронізована зі схемою

### ⚠️ Проблеми в поточних змінах

#### 1.1. `"use cache"` без `cacheComponents: true`

> [!CAUTION]
> У [`next.config.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/next.config.ts) **НЕ ввімкнено `cacheComponents: true`**. Без цього флагу `"use cache"` просто не працюватиме! Це перша річ яку треба зробити.

```ts
// next.config.ts — треба додати:
const nextConfig: NextConfig = {
  cacheComponents: true,  // ← ОБОВ'ЯЗКОВО
  reactCompiler: true,
  // ...
};
```

#### 1.2. Відсутній `cacheLife` у всіх `"use cache"` функціях

> [!WARNING]
> Згідно з [Next.js 16 docs](file:///Users/kyrylo/dev/repos/agro-parts-hub/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md), без `cacheLife` використовується `default` профіль (stale: 5m, revalidate: 15m). У вашому старому коді `revalidate: 7200` (2 години). Потрібно явно вказувати `cacheLife('hours')` або створити кастомний профіль.

В [`product.repository.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/modules/catalog/infrastructure/product.repository.ts) — жодна функція не має `cacheLife`:

```ts
// ❌ Зараз
export async function getPublicProductBySlug(slug: string) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCTS, getProductTag(slug));
  // ...
}

// ✅ Повинно бути
export async function getPublicProductBySlug(slug: string) {
  "use cache";
  cacheLife("hours"); // Явний TTL
  cacheTag(CACHE_TAGS.PRODUCTS, getProductTag(slug));
  // ...
}
```

#### 1.3. `revalidate = 7200` на сторінці продукту — несумісний з Cache Components

В [`page.tsx`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/app/(layout)/product/[slug]/page.tsx#L16) лишився:
```ts
export const revalidate = 7200;
```
Згідно з міграційним гайдом, з `cacheComponents: true` цей export **викличе помилку**. Потрібно видалити його і покластися на `cacheLife` у repository-функціях.

#### 1.4. `searchProductsQuick` — без кешування, і це правильно... але без `"server-only"` захисту

[`searchProductsQuick`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/modules/catalog/infrastructure/product.repository.ts#L108-L146) не має `"use cache"` — і це ок для пошуку. Але файл вже має `import "server-only"` зверху, тому це покрито.

#### 1.5. Незавершена міграція — половина коду в старому `services/`, половина в новому `modules/`

Зараз маємо одночасно:
- [`src/services/product-service.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/services/product-service.ts) — старий, з `unstable_cache`, ще посилається на `product.categoryId`
- [`src/modules/catalog/infrastructure/product.repository.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/modules/catalog/infrastructure/product.repository.ts) — новий

Старий сервіс **зламаний** після видалення `categoryId` зі схеми (рядки 60, 66, 221, 329, 449, 480 — усі посилаються на `product.categoryId` та `category` relation що більше не існує). Сторінка продукту вже імпортує з нового repository, але інші сторінки (каталог, категорії, адмін) все ще тягнуть зламаний сервіс.

> [!IMPORTANT]
> **Не комітьте ці зміни** поки не мігруєте всі файли що імпортують з `src/services/product-service.ts`. Інакше `pnpm build` зламається.

---

## 2. Фідбек по архітектурному плану

### ✅ Погоджуюсь

| Рішення | Коментар |
|---------|----------|
| DDD / Bounded Contexts | ✅ Правильний підхід для фулстек моноліту |
| `"use cache"` замість `unstable_cache` | ✅ Стандарт Next.js 16 |
| Server Components First | ✅ Правильно |
| M2M для товар-категорія | ✅ Гнучко для e-commerce |
| EAV для характеристик | ✅ Нормалізовано |

### ⚠️ Не погоджуюсь / пропоную краще

#### 2.1. «Повна відмова від Zustand» — **НЕ для кошика**

> [!WARNING]
> Кошик в URL (`searchParams`) або на сервері — **поганий UX** для e-commerce:
> - URL з кошиком виглядає потворно і ламає SEO
> - Серверний кошик вимагає автентифікації (а у вас є анонімні покупці)
> - `localStorage` через Zustand persist — стандарт для анонімного кошика

**Рекомендація:** Залиште [`use-cart.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/store/use-cart.ts) з Zustand persist. Він правильно написаний. Те ж саме для [`use-favorites.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/store/use-favorites.ts).

**Що дійсно видалити:** Zustand для серверних даних (якщо такий є). Фільтри/пошук — так, в URL.

#### 2.2. Clean Architecture з 4 шарами — **надто складно** для цього проєкту

Проєкт має ~15 файлів сервісів, ~10 actions, ~20 сторінок. Це **невеликий e-commerce**. Повноцінний DDD з 4 шарами (Domain → Infrastructure → Application → Presentation) створить:
- 4+ директорії × N модулів = ~20+ нових тек
- Багато файлів-прошарків з 10-20 рядками
- Boilerplate перевищить бізнес-логіку

**Альтернатива — спрощена модульна архітектура (2-3 шари):**

```text
src/
  modules/
    catalog/
      queries.ts          # DAL + "use cache" (ваш infrastructure)
      actions.ts           # Server Actions (mutations)
      schemas.ts           # Zod schemas + types
      components/          # UI компоненти цього модулю
    cart/
      ...
    orders/
      ...
  app/                     # Тільки routing + page composition
  db/                      # Drizzle schema + config
  components/ui/           # Shared design-system components
```

Переваги:
- Менше indirection
- Кожен файл на своєму місці
- Легко знайти де що
- `queries.ts` = ваш "infrastructure" + "application" для read-side (бо application layer для queries — це зазвичай прозорий прошарок)

#### 2.3. Категорії — потрібна чіткість щодо ієрархії

> [!IMPORTANT]
> В плані написано «відмовляємося від жорсткого `parentId`» і пропонується Many-to-Many через `product_to_category`. Але в [`category-service.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/services/category-service.ts) широко використовуються `parent` та `children` relations. А в новій схемі їх вже нема!

Питання: **Чи потрібна ієрархія категорій (дерево)?**

- Якщо **так** → залиште `parentId` в таблиці `category` для дерева категорій, але додайте `product_to_category` M2M для товар↔категорія
- Якщо **ні** → тоді категорії стають плоскими тегами, і весь UI навігації по ієрархії зламається

Для e-commerce зазвичай потрібне **обидва**: дерево категорій + M2M прив'язка товарів. Closure Table (згаданий в плані) — це оверкіл для 2-3 рівнів вкладеності.

#### 2.4. `updateTag` замість `revalidateTag` для Server Actions

Згідно з [міграційним гайдом](file:///Users/kyrylo/dev/repos/agro-parts-hub/node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md), Next.js 16 має нову функцію `updateTag` для Server Actions — вона забезпечує "read-your-own-writes" (юзер одразу бачить свої зміни). Ваш план каже використовувати `revalidateTag`, але для мутацій в Server Actions краще `updateTag`.

```ts
// ❌ Ваш план: revalidateTag в Server Action
"use server"
import { revalidateTag } from "next/cache"
export async function updateProduct(data) {
  await db.update(product).set(data)...
  revalidateTag("products") // stale-while-revalidate
}

// ✅ Краще: updateTag для Server Actions
"use server"  
import { updateTag } from "next/cache"
export async function updateProduct(data) {
  await db.update(product).set(data)...
  updateTag("products") // юзер одразу бачить зміни
}
```

#### 2.5. `Suspense` boundaries для динамічних даних

З `cacheComponents: true`, сторінки з `searchParams`, `cookies()`, `headers()` повинні огортати динамічні частини в `<Suspense>`. Цього немає в плані, але це критично для:
- Сторінки каталогу (фільтри через `searchParams`)
- Сторінки замовлень (потрібен `cookies()` для auth)
- Адмін-панелі

```tsx
// Приклад: catalog page з searchParams
export default function CatalogPage({ searchParams }: PageProps<'/catalog'>) {
  return (
    <div>
      <CachedSidebar /> {/* "use cache" — рендериться як статичний shell */}
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
```

---

## 3. Додаткові рекомендації

### 3.1. Zod 4 — скористайтесь новими фічами

У вас [Zod 4.4.3](file:///Users/kyrylo/dev/repos/agro-parts-hub/package.json#L39). Zod 4 має `z.interface()` для кращого TS-виведення і `z.string().email().brand()` для branded types. Скористайтесь ними в доменному шарі:

```ts
// modules/catalog/schemas.ts
import { z } from "zod";

export const ProductSku = z.string().min(2).max(50).brand("ProductSku");
export type ProductSku = z.infer<typeof ProductSku>;

export const Price = z.string().regex(/^\d+(\.\d{1,2})?$/).brand("Price");
export type Price = z.infer<typeof Price>;
```

### 3.2. Видаліть `categoryId` з `productSchema`

[`validations.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/lib/validations.ts#L25) ще має `categoryId: z.number().int().positive("Category is required")` — це зламає форму створення товару після міграції на M2M. Потрібно замінити на `categoryIds: z.array(z.number().int().positive()).min(1)`.

### 3.3. GIN-індекс на `attributes` JSONB — видаліть

В [schema](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/db/schema/store.ts#L179):
```ts
index("product_attributes_gin_idx").using("gin", table.attributes),
```
Якщо ви мігруєте атрибути в EAV (`product_attribute_value`), цей GIN-індекс на legacy JSONB стає непотрібним і тільки уповільнює INSERT'и.

### 3.4. `product_to_category` — додайте індекс на `categoryId`

Для запиту "всі товари в категорії" потрібен індекс:
```ts
export const productToCategory = pgTable(
    "product_to_category",
    { ... },
    (t) => [
      primaryKey({ columns: [t.productId, t.categoryId] }),
      index("ptc_category_id_idx").on(t.categoryId), // ← додати
    ]
);
```
PK `(product_id, category_id)` покриває лукап "категорії товару", але не "товари категорії".

### 3.5. Порядок фаз — `cacheComponents` ПЕРЕД міграцією кешування

Рекомендований порядок:
1. **Спочатку** увімкніть `cacheComponents: true` + додайте `instant = false` на всі сторінки (codemod)
2. **Потім** мігруйте `unstable_cache` → `"use cache"` + `cacheLife` + `cacheTag`
3. **Потім** міняйте схему БД

Це дозволить мати робочий build на кожному кроці.

### 3.6. `cmdk` + `shadcn` — а чи не дублює це `@base-ui/react`?

У вас одночасно:
- `@base-ui/react` (headless UI)
- `shadcn` (styled + headless на Radix)
- `cmdk` (command palette)

Shadcn v4+ перейшов на Base UI. Перевірте чи не маєте дублюючих компонентів (Modal з shadcn vs Dialog з base-ui тощо). Ідеально — один UI kit.

---

## 4. Чек-лист до початку рефакторингу

| # | Що зробити | Пріоритет |
|---|-----------|-----------|
| 1 | Увімкнути `cacheComponents: true` в `next.config.ts` | 🔴 Блокер |
| 2 | Додати `cacheLife('hours')` до всіх `"use cache"` функцій | 🔴 Блокер |
| 3 | Видалити `export const revalidate` зі сторінок | 🔴 Блокер |
| 4 | Вирішити питання з ієрархією категорій (parentId + M2M або тільки M2M) | 🔴 Дизайн |
| 5 | Мігрувати ВСІ імпортери `product-service.ts` перед комітом | 🔴 Блокер |
| 6 | Оновити `productSchema` в `validations.ts` (categoryId → categoryIds) | 🟡 Важливо |
| 7 | Додати індекс на `categoryId` в `product_to_category` | 🟡 Важливо |
| 8 | Видалити GIN-індекс з `attributes` JSONB | 🟢 Можна пізніше |
| 9 | Розглянути `updateTag` замість `revalidateTag` в Server Actions | 🟢 Можна пізніше |
| 10 | Залишити Zustand для cart/favorites (localStorage) | 🟡 Дизайн |
