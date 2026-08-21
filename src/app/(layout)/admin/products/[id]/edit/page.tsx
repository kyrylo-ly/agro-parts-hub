import { notFound } from "next/navigation";
import { getProductById } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { getBrands } from "@/actions/brands";
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
      getProductById(id),
      getCategories(),
      getBrands(),
      getCollections(),
    ]);

  if (!productResult.success) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Редагувати продукт</h1>
      <ProductForm
        product={productResult.data}
        categories={categoriesResult.success ? categoriesResult.data : []}
        brands={brandsResult.success ? brandsResult.data : []}
        collections={collectionsResult.success ? collectionsResult.data : []}
      />
    </div>
  );
}
