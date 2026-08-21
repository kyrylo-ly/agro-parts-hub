import { CollectionForm } from "@/components/admin/collections/collection-form";

export default function NewCollectionPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Нова колекція</h1>
      <CollectionForm />
    </div>
  );
}
