import { getAllBrandsUseCase } from "@/use-cases/brands";
import { BrandsTable } from "@/components/admin/brands/brands-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrandsPage() {
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
      <Suspense fallback={<BrandsSkeleton />}>
        <BrandsContent />
      </Suspense>
    </div>
  );
}

function BrandsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

async function BrandsContent() {
  const result = await getAllBrandsUseCase();

  return (
    <>
      {result.success ? (
        <BrandsTable brands={result.data} />
      ) : (
        <p className="text-destructive">{result.error}</p>
      )}
    </>
  );
}
