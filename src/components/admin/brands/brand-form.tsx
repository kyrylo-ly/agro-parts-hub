"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createBrand, updateBrand } from "@/actions/brands";
import { SingleImageUploader } from "@/components/admin/single-image-uploader";

interface Brand {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

interface BrandFormProps {
  brand?: Brand;
}

interface FormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export function BrandForm({ brand }: BrandFormProps) {
  const router = useRouter();
  const isEditing = !!brand;

  const [imageUrl, setImageUrl] = useState<string>(brand?.imageUrl || "");

  const [state, formAction, pending] = useActionState(
    async (_prevState: FormState, formData: FormData): Promise<FormState> => {
      formData.set("imageUrl", imageUrl);

      const input = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        imageUrl: (formData.get("imageUrl") as string) || null,
      };

      const result = isEditing
        ? await updateBrand(brand.id, input)
        : await createBrand(input);

      if (!result.success) {
        return {
          error: result.error,
          fieldErrors: "fieldErrors" in result ? result.fieldErrors : undefined,
        };
      }

      toast.success(isEditing ? "Бренд оновлено" : "Бренд створено");
      router.push("/admin/brands");
      return {};
    },
    {}
  );

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
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
          defaultValue={brand?.name ?? ""}
          required
          placeholder="Назва бренду"
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
          defaultValue={brand?.slug ?? ""}
          placeholder="brand-name (авто-генерується)"
        />
        {state.fieldErrors?.slug && (
          <p className="text-sm text-destructive">{state.fieldErrors.slug[0]}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label>Зображення</Label>
        <SingleImageUploader 
          folder="brands"
          currentImageUrl={imageUrl}
          onUpload={(url) => setImageUrl(url)}
          onRemove={() => setImageUrl("")}
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
          onClick={() => router.push("/admin/brands")}
        >
          Скасувати
        </Button>
      </div>
    </form>
  );
}
