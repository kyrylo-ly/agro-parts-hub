import { getBrands } from "@/actions/brands";
import { BrandsTable } from "@/components/admin/brands/brands-table";

export default async function BrandsPage() {
  const result = await getBrands();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Бренди</h1>
      </div>

      {result.success ? (
        <BrandsTable brands={result.data} />
      ) : (
        <p className="text-destructive">{result.error}</p>
      )}
    </div>
  );
}
