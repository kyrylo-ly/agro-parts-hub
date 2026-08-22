"use client";

import { useActionState, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCategory, updateCategory, getCategoryProductImages } from "@/actions/categories";
import { Loader2, ImageIcon } from "lucide-react";
import { SingleImageUploader } from "@/components/admin/single-image-uploader";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  imageUrl?: string | null;
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
    imageUrl: (formData.get("imageUrl") as string) || null,
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

  const [imageUrl, setImageUrl] = useState<string>(category?.imageUrl || "");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const boundAction = handleSubmit.bind(null, category?.id);

  const [state, formAction, pending] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      // imageUrl is managed in React state, we need to append it to formData before submitting
      formData.set("imageUrl", imageUrl);
      
      const result = await boundAction(prevState, formData);
      if (!result.error) {
        toast.success(isEditing ? "Категорію оновлено" : "Категорію створено");
        router.push("/admin/categories");
      }
      return result;
    },
    {}
  );

  async function loadProductImages() {
    if (!category) return;
    setIsLoadingImages(true);
    const result = await getCategoryProductImages(category.id);
    if (result.success && result.data) {
      setProductImages(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoadingImages(false);
  }

  function handleDialogOpenChange(open: boolean) {
    setIsDialogOpen(open);
    if (open && productImages.length === 0) {
      loadProductImages();
    }
  }

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

      <div className="space-y-4">
        <Label>Зображення</Label>
        
        <div className="flex flex-col gap-4">
          <SingleImageUploader 
            folder="categories"
            currentImageUrl={imageUrl}
            onUpload={(url) => setImageUrl(url)}
            onRemove={() => setImageUrl("")}
          />

          {isEditing && (
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger
                render={
                  <Button variant="outline" type="button" className="max-w-sm" />
                }
              >
                <ImageIcon className="mr-2 size-4" />
                Обрати з товарів цієї категорії
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Оберіть зображення</DialogTitle>
                </DialogHeader>
                
                {isLoadingImages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : productImages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Не знайдено жодного фото у товарах цієї категорії.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-4">
                    {productImages.map((imgUrl, i) => (
                      <div 
                        key={i}
                        className="cursor-pointer border rounded-md overflow-hidden aspect-square hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => {
                          setImageUrl(imgUrl);
                          setIsDialogOpen(false);
                        }}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover bg-muted" />
                      </div>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>

        {state.fieldErrors?.imageUrl && (
          <p className="text-sm text-destructive">{state.fieldErrors.imageUrl[0]}</p>
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

      <div className="flex gap-3 pt-4">
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
