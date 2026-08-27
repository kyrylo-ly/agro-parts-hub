import { notFound } from "next/navigation";
import { db } from "@/db/db";
import { brand } from "@/db/schema/store";
import { eq } from "drizzle-orm";
import { BrandForm } from "@/components/admin/brands/brand-form";

//TODO: use Suspense instead (all pages with instant)
export const instant = false;

interface EditBrandPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) notFound();

  const foundBrand = await db.query.brand.findFirst({
    where: eq(brand.id, id),
  });

  if (!foundBrand) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Редагування бренду</h1>
      <BrandForm brand={foundBrand} />
    </div>
  );
}
