import { getBrands } from "@/actions/brands";
import { BrandsTable } from "@/components/admin/brands/brands-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function BrandsPage() {
  const result = await getBrands();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Бренди</h1>
        <Link href="/admin/brands/new">
          <Button>
            <Plus className="size-4 mr-2" />
            Додати бренд
          </Button>
        </Link>
      </div>

      {result.success ? (
        <BrandsTable brands={result.data} />
      ) : (
        <p className="text-destructive">{result.error}</p>
      )}
    </div>
  );
}
