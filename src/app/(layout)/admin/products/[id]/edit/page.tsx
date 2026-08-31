import { notFound } from "next/navigation";
import { getAdminProductByIdUseCase as getAdminProductById } from "@/use-cases/products";
import { getAllCategoriesUseCase } from "@/use-cases/categories";
import { getAllBrandsUseCase } from "@/use-cases/brands";
import { getAllCollectionsUseCase } from "@/use-cases/collections";
import { ProductForm } from "@/components/admin/products/product-form";

export const instant = false;


export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [productResult, categoriesResult, brandsResult, collectionsResult] =
    await Promise.all([
      getAdminProductById(id),
      getAllCategoriesUseCase(),
      getAllBrandsUseCase(),
      getAllCollectionsUseCase(),
    ]);

  if (!productResult.success) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Редагувати продукт</h1>
      <ProductForm
        product={{
          ...productResult.data,
          attributes: productResult.data.attributes as Record<string, string> | null,
        }}
        categories={categoriesResult.success ? categoriesResult.data : []}
        brands={brandsResult.success ? brandsResult.data : []}
        collections={collectionsResult.success ? collectionsResult.data : []}
      />
    </div>
  );
}
