import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getPublicCategories } from "@/services/category-service";

export const revalidate = 7200;

export default async function MainLayout({ children }: LayoutProps<"/">) {
  const categoriesResult = await getPublicCategories();

  // Transform categories into tree structure for navigation
  const allCategories = categoriesResult.success ? categoriesResult.data : [];
  const topLevelCategories = allCategories
    .filter((c) => !c.parent)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.imageUrl,
      children: allCategories
        .filter((child) => child.parent?.id === cat.id)
        .map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          imageUrl: child.imageUrl,
        })),
    }));

  return (
    <>
      <Header categories={topLevelCategories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
