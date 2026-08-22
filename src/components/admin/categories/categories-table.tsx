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
import { deleteCategory } from "@/actions/categories";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parent?: { id: number; name: string } | null;
  children?: { id: number }[];
  imageUrl?: string | null;
  createdAt: Date;
}

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const router = useRouter();

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Видалити категорію "${name}"?`)) return;

    const result = await deleteCategory(id);
    if (result.success) {
      toast.success("Категорію видалено");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Категорій поки немає.{" "}
        <Link href="/admin/categories/new" className="text-primary underline">
          Створити першу
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Зображення</TableHead>
            <TableHead>Назва</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Батьківська</TableHead>
            <TableHead>Дочірніх</TableHead>
            <TableHead className="w-[100px]">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-contain rounded-md border bg-white" />
                ) : (
                  <div className="w-10 h-10 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">Немає</div>
                )}
              </TableCell>
              <TableCell className="font-medium">{cat.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-mono text-xs">
                  {cat.slug}
                </Badge>
              </TableCell>
              <TableCell>
                {cat.parent ? (
                  <span className="text-sm">{cat.parent.name}</span>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">{cat.children?.length ?? 0}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/categories/${cat.id}/edit`}>
                    <Button variant="ghost" size="icon" className="size-8">
                      <Pencil className="size-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(cat.id, cat.name)}
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
  );
}
