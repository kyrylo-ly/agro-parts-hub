import { notFound } from "next/navigation";
import { getCategoryById, getCategories } from "@/actions/categories";
import { CategoryForm } from "@/components/admin/categories/category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    notFound();
  }

  const [categoryResult, categoriesResult] = await Promise.all([
    getCategoryById(categoryId),
    getCategories(),
  ]);

  if (!categoryResult.success) {
    notFound();
  }

  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Редагувати категорію</h1>
      <CategoryForm
        category={categoryResult.data}
        categories={categories.filter((c) => c.id !== categoryId)}
      />
    </div>
  );
}
