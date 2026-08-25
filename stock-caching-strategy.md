# Стратегія кешування stock + salesCount

## Проблема

При замовленні ([`orders.ts`](file:///Users/kyrylo/dev/repos/agro-parts-hub/src/actions/orders.ts#L68-L80)):
```ts
stock: sql`${product.stock} - ${item.quantity}`,
salesCount: sql`${product.salesCount} + ${item.quantity}`,
```

Це **мутація від покупця**, не від адміна. З `cacheLife('catalog')` та `revalidate: Infinity` юзер побачить стару наявність, поки адмін щось не зробить.

---

## 3 варіанти рішення

### Варіант A: Split Page — максимальна оптимізація ⭐

**Ідея:** Розділити дані товару на дві частини:
- **Стабільні** (назва, ціна, опис, картинки, характеристики) → `cacheLife('catalog')` — кеш назавжди
- **Волатильні** (stock, salesCount) → динамічний `<Suspense>` — завжди свіжі

```tsx
// src/app/(layout)/product/[slug]/page.tsx

export default function ProductPage({ params }: PageProps<'/product/[slug]'>) {
  return (
    <>
      {/* 95% сторінки — кешоване назавжди */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </>
  );
}

// Кешований контент — назва, ціна, опис, картинки
async function ProductContent({ params }) {
  const { slug } = await params;
  const product = await getCachedProduct(slug); // "use cache" + cacheLife('catalog')
  
  return (
    <div>
      <ProductGallery images={product.images} />
      <h1>{product.name}</h1>
      <span>{product.price} ₴</span>
      
      {/* Тільки бейдж наявності — динамічний */}
      <Suspense fallback={<StockBadgeSkeleton />}>
        <StockBadge productId={product.id} />
      </Suspense>
      
      {/* Кнопка "Додати в кошик" — клієнтська, перевіряє stock при натисканні */}
      <AddToCartButton product={product} />
    </div>
  );
}

// Крихітний динамічний запит — тільки stock
async function StockBadge({ productId }: { productId: string }) {
  const stock = await getProductStock(productId); // БЕЗ кешу, ~1ms запит
  return <Badge>{stock > 0 ? "В наявності" : "Немає в наявності"}</Badge>;
}
```

```ts
// modules/catalog/queries.ts

// Кешований запит — все крім stock/salesCount
export async function getCachedProduct(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.PRODUCTS, getProductTag(slug));
  // ... повний запит з brand, images, categories
}

// Динамічний запит — тільки stock (БЕЗ "use cache")
export async function getProductStock(productId: string) {
  const [result] = await db
    .select({ stock: product.stock })
    .from(product)
    .where(eq(product.id, productId));
  return result?.stock ?? 0;
}
```

**Плюси:**
- 95% сторінки — з кешу, миттєво
- Stock завжди актуальний
- Немає потреби інвалідувати кеш при покупці
- Bestsellers/New Arrivals порядок оновлюється окремо

**Мінуси:**
- Додатковий запит на stock (але це `SELECT stock FROM product WHERE id = ?` — <1ms)
- Потрібен `<Suspense>` + skeleton для badge

---

### Варіант B: Targeted `updateTag` — простий

**Ідея:** При кожному замовленні — інвалідувати кеш конкретних товарів.

```ts
// modules/orders/actions.ts
export async function createOrder(data: CheckoutData) {
  // ... transaction ...
  
  // Інвалідувати кеш куплених товарів
  for (const item of data.items) {
    const p = products.find(pr => pr.id === item.productId)!;
    updateTag(getProductTag(p.slug));  // конкретний товар
  }
  updateTag(CACHE_TAGS.BESTSELLERS);   // порядок може змінитись
}
```

**Плюси:**
- Простіше в реалізації
- Весь товар (включно з stock) оновлюється одразу

**Мінуси:**
- Кеш сторінки товару інвалідується при КОЖНІЙ покупці
- Для популярних товарів (10+ покупок/день) — кеш постійно збивається
- Навантаження на DB більше (перерендер всієї сторінки)

---

### Варіант C: Hybrid — баланс ⭐⭐ (Рекомендація)

**Ідея:** Комбінація A + B:
1. **Сторінка товару** — Split Page (як варіант A): stock через `<Suspense>`
2. **Списки** (bestsellers, каталог) — `revalidateTag` (stale-while-revalidate) при покупці
3. **Адмін мутації** — `updateTag` (миттєво)

```ts
// modules/orders/actions.ts
export async function createOrder(data: CheckoutData) {
  // ... transaction ...
  
  // Stale-while-revalidate для списків (юзер бачить старе, нове готується у фоні)
  if(кількість на складі 0){
  revalidateTag(CACHE_TAGS.BESTSELLERS, "catalog");
  }
  // НЕ інвалідуємо конкретний товар — stock показується динамічно через Suspense
}

// modules/catalog/actions.ts (адмін)
export async function updateProduct(id: string, input: ProductInput) {
  await requireAdmin();
  // ... update ...
  updateTag(CACHE_TAGS.PRODUCTS);        // миттєво для адміна
  updateTag(getProductTag(oldSlug));
}
```

**Плюси:**
- Сторінка товару НІКОЛИ не інвалідується при покупці → максимальний cache hit rate
- Stock завжди актуальний (динамічний Suspense)
- Bestsellers порядок оновлюється у фоні (stale-while-revalidate)
- Адмін бачить зміни миттєво

**Мінуси:**
- Трохи складніше ніж варіант B
- Bestsellers можуть бути на ~5 хвилин неактуальні (але для e-commerce це норма)

---

## Порівняльна таблиця

| Аспект | A: Split Page | B: Targeted updateTag | C: Hybrid ⭐ |
|---|---|---|---|
| Stock актуальність | ✅ Завжди | ✅ Після rerender | ✅ Завжди |
| Cache hit rate | ✅ 99%+ | ⚠️ Знижується при покупках | ✅ 99%+ |
| Bestsellers актуальність | ❌ Стале | ✅ Миттєво | ⚠️ SWR (~5хв) |
| Складність | ⚠️ Середня | ✅ Проста | ⚠️ Середня |
| DB навантаження | ✅ Мінімальне | ⚠️ Вище | ✅ Мінімальне |

---

## Рекомендація: Варіант C (Hybrid)

Для вашого масштабу (MVP e-commerce, не Amazon) це ідеальний баланс:
- Stock **завжди актуальний** на сторінці товару
- Кеш **не збивається** від покупок  
- Bestsellers оновлюються **у фоні** (юзер не чекає)
- Адмін бачить **миттєво**

### Зміни в плані рефакторингу

1. **`modules/catalog/queries.ts`** — додати `getProductStock(id)` без кешу
2. **`app/(layout)/product/[slug]/page.tsx`** — додати `<Suspense>` навколо `<StockBadge />`
3. **`modules/orders/actions.ts`** — додати `revalidateTag(CACHE_TAGS.BESTSELLERS, "catalog")` після замовлення
4. **Списки товарів** (каталог, категорії) — stock badge в картках теж через `<Suspense>` або показувати тільки ціну без stock (як в більшості e-commerce)

> [!NOTE]
> **Для карток товарів в списках** (каталог, головна) — не потрібен динамічний stock. Показуйте ціну та назву, а stock перевіряйте тільки на сторінці товару та при додаванні в кошик. Це стандарт e-commerce (Rozetka, Amazon так роблять).
