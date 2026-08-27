# Архітектурна пропозиція для масштабування MVP

Оскільки поточний проєкт побудований швидко (MVP) і має тісну прив'язку до фреймворку (Next.js) та бази даних (Drizzle ORM), при зростанні проєкту виникнуть проблеми з підтримкою, тестуванням та зміною технологій.

Цей документ описує стратегію переходу від "швидкого MVP" до масштабованої, enterprise-ready архітектури з використанням принципів SOLID та Clean Architecture.

## 1. Аналіз поточного стану

Зараз у проєкті використовується "шар" серверних дій (`src/actions`) та сервісів (`src/services`).
**Проблеми поточної архітектури:**

- **Тісна зв'язність (High Coupling):** Бізнес-логіка (наприклад, у `products.ts`) безпосередньо імпортує об'єкт `db`, викликає `revalidatePath`, працює зі стораджем (R2) та займається валідацією.
- **Порушення SRP (Single Responsibility Principle):** Серверні дії виконують маршрутизацію (Next.js), кешування, бізнес-логіку та доступ до БД.
- **Відсутність Unit-тестів:** Через жорстку прив'язку до бази даних та Next.js середовища, писати швидкі юніт-тести практично неможливо.
- **Складність переходу на інший бекенд:** Якщо магазин вистрілить і Next.js перестане справлятися (або команда вирішить виділити бекенд на NestJS / Go / Java), доведеться переписувати всю логіку з нуля.

## 2. Пропоноване рішення: Clean Architecture & Domain-Driven Design (DDD)

Головна мета — ізолювати бізнес-логіку від інфраструктури (Next.js, Drizzle, R2).

### Нова структура папок (Feature-Sliced або Domain-Based)

Замість технічного поділу (`actions`, `services`, `components`), перейдіть до доменного:

```text
src/
├── app/                  # Тільки Next.js роутінг та UI
├── components/           # Спільні UI компоненти (Shadcn, кнопки тощо)
├── core/                 # Базові абстракції (Error handling, DI container)
├── infrastructure/       # Реалізації адаптерів (Drizzle db, R2 storage)
└── modules/              # Доменні модулі (products, orders, users)
    └── products/
        ├── domain/       # Сутності та Інтерфейси (Ports)
        ├── use-cases/    # Бізнес-логіка (Application Layer)
        ├── persistence/  # Drizzle Repositories (Adapters)
        └── presentation/ # Next.js Actions & Controllers
```

## 3. Принципи та Патерни, які варто впровадити

### 1. Repository Pattern (Патерн Репозиторій)

Сховайте прямі виклики Drizzle ORM за інтерфейсами. Це дозволить легко підміняти базу даних (або мокати її для тестів) і дотримуватись DIP (Dependency Inversion Principle).

### 2. Dependency Injection (Впровадження залежностей)

Замість прямих імпортів (наприклад, `import { db } from "@/db/db"`), передавайте залежності через конструктор або використовуйте DI-контейнер (наприклад, `awilix` або `tsyringe`).

### 3. Separation of Concerns (Розділення відповідальності)

Next.js Server Actions мають займатися лише одним: приймати HTTP-запит (через RPC), викликати Use Case (бізнес-логіку) і повертати результат. Кешування (`revalidatePath`) має бути винесене в декоратори або окремі адаптери.

---

## 4. Приклад рефакторингу (Як це виглядає на практиці)

### Крок 1. Визначаємо інтерфейс (Port)

```typescript
// src/modules/products/domain/product.repository.ts
import type { Product, ProductInput } from "./product.entity";

export interface IProductRepository {
  create(data: ProductInput): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  update(id: string, data: Partial<ProductInput>): Promise<Product>;
  delete(id: string): Promise<void>;
}
```

### Крок 2. Створюємо Use Case (Бізнес-логіка)

Жодного слова про Next.js чи Drizzle!

```typescript
// src/modules/products/use-cases/create-product.use-case.ts
import { IProductRepository } from "../domain/product.repository";

export class CreateProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(input: ProductInput) {
    // 1. Валідація бізнес-правил
    if (input.price < 0) throw new Error("Price cannot be negative");

    // 2. Генерація slug
    const slug = input.slug || this.generateSlug(input.name);

    // 3. Збереження
    const product = await this.productRepo.create({ ...input, slug });

    // Можна додати публікацію подій (Event Driven), наприклад: ProductCreatedEvent
    return product;
  }

  private generateSlug(name: string) {
    /* ... */
  }
}
```

### Крок 3. Інфраструктура (Реалізація репозиторію)

```typescript
// src/modules/products/persistence/drizzle-product.repository.ts
import { db } from "@/infrastructure/db";
import { product } from "@/infrastructure/db/schema";
import { IProductRepository } from "../domain/product.repository";

export class DrizzleProductRepository implements IProductRepository {
  async create(data: ProductInput) {
    const [newProduct] = await db.insert(product).values(data).returning();
    return newProduct;
  }
  // ... інші методи
}
```

### Крок 4. Серверна дія (Next.js Entrypoint)

```typescript
// src/app/actions/product.actions.ts
"use server";
import { revalidatePath, updateTag } from "next/cache";
import { CreateProductUseCase } from "@/modules/products/use-cases/create-product.use-case";
import { DrizzleProductRepository } from "@/modules/products/persistence/drizzle-product.repository";
import { CACHE_TAGS } from "@/core/constants";

// В ідеалі це ініціалізується через DI контейнер
const productRepo = new DrizzleProductRepository();
const createProductUseCase = new CreateProductUseCase(productRepo);

export async function createProductAction(input: ProductInput) {
  try {
    // 1. Авторизація (Next.js специфіка)
    await requireAdmin();

    // 2. Виклик бізнес-логіки
    const result = await createProductUseCase.execute(input);

    // 3. Інвалідація кешу (Next.js специфіка)
    revalidatePath("/admin/products");
    updateTag(CACHE_TAGS.PRODUCTS);

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## 5. План поетапного переходу (Без зупинки розробки)

Вам не потрібно переписувати все відразу. Використовуйте підхід **"Strangler Fig"**:

1.  **Додайте інструменти тестування:** Налаштуйте Vitest або Jest для юніт-тестів.
2.  **Нові фічі розробляйте за новими правилами:** Усі нові сутності створюйте вже у папці `src/modules/` з інтерфейсами та репозиторіями.
3.  **Поступовий рефакторинг старих дій:** Коли доведеться змінювати `actions/products.ts`, винесіть логіку у Use Case.
4.  **Створення спільного DI-контейнера:** Налаштуйте ініціалізацію залежностей, щоб уникнути ручного створення об'єктів у кожному Action.

## Висновок

Цей підхід дозволить вам:

- **Писати 100% юніт-тести** на бізнес-логіку.
- **Легко міняти ORM** (наприклад, Drizzle на Prisma) або СУБД.
- **Масштабувати команду**, оскільки кожен домен буде ізольований.
- **Готовність до мікросервісів:** Use Case легко обгорнути в REST/GraphQL API на NestJS у майбутньому без зміни самої логіки.
