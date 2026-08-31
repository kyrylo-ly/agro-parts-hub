import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllCollectionsUseCase } from "@/use-cases/collections";
import { CollectionsTable } from "@/components/admin/collections/collections-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Колекції</h1>
        <Link href="/admin/collections/new">
          <Button>
            <Plus className="size-4 mr-2" />
            Додати колекцію
          </Button>
        </Link>
      </div>

      <Suspense fallback={<CollectionsSkeleton />}>
        <CollectionsContent />
      </Suspense>
    </div>
  );
}

function CollectionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

async function CollectionsContent() {
  const result = await getAllCollectionsUseCase();

  return (
    <>
      {result.success ? (
        <CollectionsTable collections={result.data} />
      ) : (
        <p className="text-destructive">{result.error}</p>
      )}
    </>
  );
}
