import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCollections } from "@/actions/collections";
import { CollectionsTable } from "@/components/admin/collections/collections-table";

export default async function CollectionsPage() {
  const result = await getCollections();

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

      {result.success ? (
        <CollectionsTable collections={result.data} />
      ) : (
        <p className="text-destructive">{result.error}</p>
      )}
    </div>
  );
}
