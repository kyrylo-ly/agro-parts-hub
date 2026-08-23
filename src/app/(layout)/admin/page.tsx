import Link from "next/link";
import { Package, FolderTree, Tag, Layers, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/db";
import { product, category, brand, collection, order } from "@/db/schema/store";
import { count } from "drizzle-orm";

export default async function AdminPage() {
  const [[productCount], [categoryCount], [brandCount], [collectionCount], [orderCount]] =
    await Promise.all([
      db.select({ count: count() }).from(product),
      db.select({ count: count() }).from(category),
      db.select({ count: count() }).from(brand),
      db.select({ count: count() }).from(collection),
      db.select({ count: count() }).from(order),
    ]);

  const stats = [
    {
      title: "Замовлення",
      count: orderCount.count,
      href: "/admin/orders",
      icon: ClipboardList,
    },
    {
      title: "Продукти",
      count: productCount.count,
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Категорії",
      count: categoryCount.count,
      href: "/admin/categories",
      icon: FolderTree,
    },
    {
      title: "Бренди",
      count: brandCount.count,
      href: "/admin/brands",
      icon: Tag,
    },
    {
      title: "Колекції",
      count: collectionCount.count,
      href: "/admin/collections",
      icon: Layers,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Панель адміністратора</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.count}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}