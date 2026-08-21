"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCategory, updateCategory } from "@/actions/categories";
import { Loader2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
}

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
}

interface FormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

async function handleSubmit(
  categoryId: number | undefined,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    parentId: formData.get("parentId")
      ? parseInt(formData.get("parentId") as string, 10)
      : null,
  };

  const result = categoryId
    ? await updateCategory(categoryId, input)
    : await createCategory(input);

  if (!result.success) {
    return {
      error: result.error,
      fieldErrors: "fieldErrors" in result ? result.fieldErrors : undefined,
    };
  }

  return {};
}

export function CategoryForm({ category, categories }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!category;

  const boundAction = handleSubmit.bind(null, category?.id);

  const [state, formAction, pending] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      const result = await boundAction(prevState, formData);
      if (!result.error) {
        toast.success(isEditing ? "Категорію оновлено" : "Категорію створено");
        router.push("/admin/categories");
      }
      return result;
    },
    {}
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Назва *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={category?.name ?? ""}
          required
          placeholder="Підшипники"
        />
        {state.fieldErrors?.name && (
          <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={category?.slug ?? ""}
          placeholder="pidshypnyky (авто-генерується з назви)"
        />
        {state.fieldErrors?.slug && (
          <p className="text-sm text-destructive">{state.fieldErrors.slug[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Батьківська категорія</Label>
        <Select
          name="parentId"
          defaultValue={category?.parentId?.toString() ?? ""}
        >
          <SelectTrigger id="parentId">
            <SelectValue placeholder="Немає (коренева)" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 mr-2 animate-spin" />}
          {isEditing ? "Зберегти" : "Створити"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/categories")}
        >
          Скасувати
        </Button>
      </div>
    </form>
  );
}
