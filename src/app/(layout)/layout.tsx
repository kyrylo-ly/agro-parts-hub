import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getPublicCategories } from "@/services/category-service";



export default async function MainLayout({ children }: LayoutProps<"/">) {
  const categoriesResult = await getPublicCategories();

  // Transform categories into tree structure for navigation
  const allCategories = categoriesResult.success ? categoriesResult.data : [];

  type ChildCategory = { id: number; name: string; slug: string; imageUrl: string | null };
  const childrenMap = new Map<number, ChildCategory[]>();

  for (const cat of allCategories) {
    if (cat.parent) {
      const parentId = cat.parent.id;
      const childData = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.imageUrl,
      };
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, [childData]);
      } else {
        childrenMap.get(parentId)!.push(childData);
      }
    }
  }

  const topLevelCategories = allCategories
    .filter((c) => !c.parent)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.imageUrl,
      children: childrenMap.get(cat.id) || [],
    }));

  return (
    <>
      <Header categories={topLevelCategories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
