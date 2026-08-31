import { getAllCategoriesUseCase } from "@/use-cases/categories";
import { CategoryForm } from "@/components/admin/categories/category-form";

export default async function NewCategoryPage() {
  const result = await getAllCategoriesUseCase();
  const categories = result.success ? result.data : [];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Нова категорія</h1>
      <CategoryForm categories={categories} />
    </div>
  );
}
