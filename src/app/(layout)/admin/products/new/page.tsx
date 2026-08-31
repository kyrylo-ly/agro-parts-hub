import { getAllCategoriesUseCase } from "@/use-cases/categories";
import { getAllBrandsUseCase } from "@/use-cases/brands";
import { getAllCollectionsUseCase } from "@/use-cases/collections";
import { ProductForm } from "@/components/admin/products/product-form";

export default async function NewProductPage() {
  const [categoriesResult, brandsResult, collectionsResult] = await Promise.all([
    getAllCategoriesUseCase(),
    getAllBrandsUseCase(),
    getAllCollectionsUseCase(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Новий продукт</h1>
      <ProductForm
        categories={categoriesResult.success ? categoriesResult.data : []}
        brands={brandsResult.success ? brandsResult.data : []}
        collections={collectionsResult.success ? collectionsResult.data : []}
      />
    </div>
  );
}
