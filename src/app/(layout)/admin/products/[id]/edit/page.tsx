import { notFound } from "next/navigation";
import { getAdminProductById } from "@/services/product-service";
import { getAllCategories } from "@/services/category-service";
import { getAllBrands } from "@/services/brand-service";
import { getCollections } from "@/actions/collections";
import { ProductForm } from "@/components/admin/products/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [productResult, categoriesResult, brandsResult, collectionsResult] =
    await Promise.all([
      getAdminProductById(id),
      getAllCategories(),
      getAllBrands(),
      getCollections(),
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
