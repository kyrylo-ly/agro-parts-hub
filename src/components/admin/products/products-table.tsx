"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteProduct } from "@/actions/products";

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: string;
  stock: number;
  isActive: boolean;
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
  images: { id: string; url: string }[];
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ProductsTable({
  products,
  meta,
  currentSearch,
}: {
  products: ProductRow[];
  meta: Meta;
  currentSearch?: string;
}) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Видалити продукт "${name}"?`)) return;

    const result = await deleteProduct(id);
    if (result.success) {
      toast.success("Продукт видалено");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {currentSearch
          ? "Нічого не знайдено за вашим запитом."
          : (
            <>
              Продуктів поки немає.{" "}
              <Link href="/admin/products/new" className="text-primary underline">
                Створити перший
              </Link>
            </>
          )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Назва</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Ціна</TableHead>
              <TableHead>Наявність</TableHead>
              <TableHead>Категорія</TableHead>
              <TableHead>Бренд</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[100px]">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0].url}
                      alt=""
                      className="size-10 rounded object-cover"
                    />
                  ) : (
                    <div className="size-10 rounded bg-muted" />
                  )}
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {p.name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {p.sku}
                  </Badge>
                </TableCell>
                <TableCell>{p.price} ₴</TableCell>
                <TableCell>
                  <span className={p.stock > 0 ? "text-green-600" : "text-destructive"}>
                    {p.stock}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  {p.category?.name ?? "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {p.brand?.name ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={p.isActive ? "default" : "secondary"}>
                    {p.isActive ? "Активний" : "Прихований"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/products/${p.id}/edit`}>
                      <Button variant="ghost" size="icon" className="size-8">
                        <Pencil className="size-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(p.id, p.name)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Показано {(meta.page - 1) * meta.limit + 1}–
            {Math.min(meta.page * meta.limit, meta.total)} з {meta.total}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={`/admin/products?page=${pageNum}${currentSearch ? `&search=${currentSearch}` : ""}`}
                >
                  <Button
                    variant={pageNum === meta.page ? "default" : "outline"}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
