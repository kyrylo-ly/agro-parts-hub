"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createCollection, updateCollection } from "@/actions/collections";

interface Collection {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

interface CollectionFormProps {
  collection?: Collection;
}

interface FormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export function CollectionForm({ collection }: CollectionFormProps) {
  const router = useRouter();
  const isEditing = !!collection;

  const [state, formAction, pending] = useActionState(
    async (_prevState: FormState, formData: FormData): Promise<FormState> => {
      const input = {
        title: formData.get("title") as string,
        slug: formData.get("slug") as string,
        description: (formData.get("description") as string) || null,
        imageUrl: (formData.get("imageUrl") as string) || null,
      };

      const result = isEditing
        ? await updateCollection(collection.id, input)
        : await createCollection(input);

      if (!result.success) {
        return {
          error: result.error,
          fieldErrors: "fieldErrors" in result ? result.fieldErrors : undefined,
        };
      }

      toast.success(isEditing ? "Колекцію оновлено" : "Колекцію створено");
      router.push("/admin/collections");
      return {};
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
        <Label htmlFor="title">Назва *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={collection?.title ?? ""}
          required
          placeholder="Сезонні пропозиції"
        />
        {state.fieldErrors?.title && (
          <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={collection?.slug ?? ""}
          placeholder="sezonni-propozytsii (авто-генерується)"
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
          defaultValue={collection?.description ?? ""}
          placeholder="Опис колекції..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL зображення</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          defaultValue={collection?.imageUrl ?? ""}
          placeholder="https://..."
        />
        {state.fieldErrors?.imageUrl && (
          <p className="text-sm text-destructive">{state.fieldErrors.imageUrl[0]}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 mr-2 animate-spin" />}
          {isEditing ? "Зберегти" : "Створити"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/collections")}
        >
          Скасувати
        </Button>
      </div>
    </form>
  );
}
