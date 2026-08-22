import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getPublicCategories } from "@/actions/public";

export default async function MainLayout({ children }: LayoutProps<"/">) {
  const [session, categoriesResult] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getPublicCategories(),
  ]);

  // Transform categories into tree structure for navigation
  const allCategories = categoriesResult.success ? categoriesResult.data : [];
  const topLevelCategories = allCategories
    .filter((c) => !c.parent)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      children: allCategories
        .filter((child) => child.parent?.id === cat.id)
        .map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
        })),
    }));

  return (
    <>
      <Header
        name={session?.user.name ?? ""}
        email={session?.user.email ?? ""}
        avatar={session?.user.image ?? ""}
        role={session?.user.role ?? ""}
        categories={topLevelCategories}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
