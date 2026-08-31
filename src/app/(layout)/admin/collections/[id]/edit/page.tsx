import { notFound } from "next/navigation";
import { getCollectionByIdUseCase } from "@/use-cases/collections";
import { CollectionForm } from "@/components/admin/collections/collection-form";

export const instant = false;


export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collectionId = parseInt(id, 10);

  if (isNaN(collectionId)) {
    notFound();
  }

  const result = await getCollectionByIdUseCase(collectionId);

  if (!result.success) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Редагувати колекцію</h1>
      <CollectionForm collection={result.data} />
    </div>
  );
}
