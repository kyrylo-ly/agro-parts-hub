"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboboxCreate, type ComboboxItem } from "@/components/admin/combobox-create";
import { KeyValueEditor } from "@/components/admin/key-value-editor";
import { ImageUploader } from "@/components/admin/image-uploader";
import { createProduct, updateProduct } from "@/actions/products";
import { createBrand } from "@/actions/brands";
import { createCategory } from "@/actions/categories";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface CollectionRef {
  id: number;
  title: string;
  slug: string;
  productCount?: number;
}

interface ProductData {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  attributes: Record<string, string> | null;
  isActive: boolean;
  categoryId: number;
  brandId: number | null;
  images: { id: string; url: string; orderIndex: number }[];
  collections?: { collection: { id: number; title: string } }[];
}

interface ProductFormProps {
  product?: ProductData;
  categories: Category[];
  brands: Brand[];
  collections: CollectionRef[];
}

interface FormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export function ProductForm({
  product,
  categories,
  brands: initialBrands,
  collections,
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  // Controlled state for complex fields
  const [categoryId, setCategoryId] = useState(product?.categoryId?.toString() ?? "");
  const [brandId, setBrandId] = useState(product?.brandId?.toString() ?? "");
  const [attributes, setAttributes] = useState<Record<string, string>>(
    (product?.attributes as Record<string, string>) ?? {}
  );
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>(
    product?.collections?.map((c) => c.collection.id) ?? []
  );
  const [brands, setBrands] = useState(initialBrands);
  const [categoryList, setCategoryList] = useState(categories);
  const [refreshKey, setRefreshKey] = useState(0);

  // Category items for Combobox
  const categoryItems: ComboboxItem[] = categoryList.map((c) => ({
    value: c.id.toString(),
    label: c.parentId
      ? `${categoryList.find((p) => p.id === c.parentId)?.name ?? ""} → ${c.name}`
      : c.name,
  }));

  // Brand items for Combobox
  const brandItems: ComboboxItem[] = brands.map((b) => ({
    value: b.id.toString(),
    label: b.name,
  }));

  async function handleCreateBrand(name: string): Promise<ComboboxItem | null> {
    const result = await createBrand({ name });
    if (result.success) {
      const newBrand = result.data;
      setBrands((prev) => [...prev, newBrand]);
      toast.success(`Бренд "${name}" створено`);
      return { value: newBrand.id.toString(), label: newBrand.name };
    }
    toast.error(result.error);
    return null;
  }

  async function handleCreateCategory(name: string): Promise<ComboboxItem | null> {
    const result = await createCategory({ name });
    if (result.success) {
      const newCat = result.data;
      setCategoryList((prev) => [...prev, newCat]);
      toast.success(`Категорію "${name}" створено`);
      return { value: newCat.id.toString(), label: newCat.name };
    }
    toast.error(result.error);
    return null;
  }

  const [state, formAction, pending] = useActionState(
    async (_prevState: FormState, formData: FormData): Promise<FormState> => {
      // Clean attributes — remove entries with empty keys
      const cleanedAttributes: Record<string, string> = {};
      for (const [key, val] of Object.entries(attributes || {})) {
        if (key && typeof key === "string" && key.trim()) {
          cleanedAttributes[key.trim()] = typeof val === "string" ? val.trim() : String(val ?? "");
        }
      }

      const input = {
        sku: formData.get("sku") as string,
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        description: (formData.get("description") as string) || null,
        price: formData.get("price") as string,
        compareAtPrice: (formData.get("compareAtPrice") as string) || null,
        stock: parseInt((formData.get("stock") as string) ?? "0", 10),
        categoryId: parseInt(categoryId, 10),
        brandId: brandId ? parseInt(brandId, 10) : null,
        attributes:
          Object.keys(cleanedAttributes).length > 0 ? cleanedAttributes : null,
        isActive,
        collectionIds: selectedCollectionIds,
      };

      const result = isEditing
        ? await updateProduct(product.id, input)
        : await createProduct(input);

      if (!result.success) {
        return {
          error: result.error,
          fieldErrors: ("fieldErrors" in result ? result.fieldErrors : undefined) as Record<string, string[] | undefined> | undefined,
        };
      }

      toast.success(isEditing ? "Продукт оновлено" : "Продукт створено");

      if (!isEditing && result.data) {
        // Redirect to edit page to allow image upload
        router.push(`/admin/products/${result.data.id}/edit`);
      } else {
        router.push("/admin/products");
      }
      return {};
    },
    {}
  );

  function toggleCollection(collectionId: number) {
    setSelectedCollectionIds((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Basic Info */}
      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-medium">Основна інформація</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              name="sku"
              defaultValue={product?.sku ?? ""}
              required
              placeholder="ART-12345"
            />
            {state.fieldErrors?.sku && (
              <p className="text-sm text-destructive">{state.fieldErrors.sku[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Назва *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name ?? ""}
              required
              placeholder="Підшипник 6205 2RS"
            />
            {state.fieldErrors?.name && (
              <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={product?.slug ?? ""}
            placeholder="pidshypnyk-6205-2rs (авто-генерується з назви)"
          />
          {state.fieldErrors?.slug && (
            <p className="text-sm text-destructive">{state.fieldErrors.slug[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Опис</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={product?.description ?? ""}
            placeholder="Детальний опис продукту..."
            rows={4}
          />
        </div>
      </fieldset>

      {/* Pricing & Stock */}
      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-medium">Ціна та наявність</legend>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="price">Ціна (₴) *</Label>
            <Input
              id="price"
              name="price"
              defaultValue={product?.price ?? ""}
              required
              placeholder="199.99"
              inputMode="decimal"
            />
            {state.fieldErrors?.price && (
              <p className="text-sm text-destructive">{state.fieldErrors.price[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Стара ціна (₴)</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              defaultValue={product?.compareAtPrice ?? ""}
              placeholder="249.99"
              inputMode="decimal"
            />
            {state.fieldErrors?.compareAtPrice && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.compareAtPrice[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Кількість на складі *</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min={0}
              defaultValue={product?.stock ?? 0}
              required
            />
            {state.fieldErrors?.stock && (
              <p className="text-sm text-destructive">{state.fieldErrors.stock[0]}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Category & Brand */}
      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-medium">Категорія та бренд</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Категорія *</Label>
            <ComboboxCreate
              items={categoryItems}
              value={categoryId}
              onValueChange={setCategoryId}
              placeholder="Оберіть категорію..."
              searchPlaceholder="Пошук категорії..."
              createLabel="Створити нову категорію"
              onCreateNew={handleCreateCategory}
            />
            {state.fieldErrors?.categoryId && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.categoryId[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Бренд</Label>
            <ComboboxCreate
              items={brandItems}
              value={brandId}
              onValueChange={setBrandId}
              placeholder="Оберіть бренд..."
              searchPlaceholder="Пошук бренду..."
              createLabel="Створити новий бренд"
              onCreateNew={handleCreateBrand}
            />
          </div>
        </div>
      </fieldset>

      {/* Collections */}
      {collections.length > 0 && (
        <fieldset className="space-y-4 rounded-lg border p-4">
          <legend className="px-2 text-sm font-medium">Колекції</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((col) => (
              <label
                key={col.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
              >
                <Checkbox
                  checked={selectedCollectionIds.includes(col.id)}
                  onCheckedChange={() => toggleCollection(col.id)}
                />
                <span className="text-sm">{col.title}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Attributes */}
      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-medium">Атрибути</legend>
        <KeyValueEditor value={attributes} onChange={setAttributes} />
      </fieldset>

      {/* Images (only for editing, because product ID is needed) */}
      {isEditing && (
        <fieldset className="space-y-4 rounded-lg border p-4">
          <legend className="px-2 text-sm font-medium">Зображення</legend>
          <ImageUploader
            key={refreshKey}
            productId={product.id}
            images={product.images}
            onImagesChange={() => {
              setRefreshKey((k) => k + 1);
              router.refresh();
            }}
          />
        </fieldset>
      )}

      {!isEditing && (
        <p className="text-sm text-muted-foreground">
          💡 Зображення можна буде завантажити після створення продукту.
        </p>
      )}

      {/* Status */}
      <fieldset className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="isActive" className="text-sm font-medium">
              Активний
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Неактивні продукти не показуються покупцям
            </p>
          </div>
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
      </fieldset>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 mr-2 animate-spin" />}
          {isEditing ? "Зберегти зміни" : "Створити продукт"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Скасувати
        </Button>
      </div>
    </form>
  );
}
