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
import { deleteBrand } from "@/actions/brands";

interface Brand {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  createdAt: Date;
}

export function BrandsTable({ brands }: { brands: Brand[] }) {
  const router = useRouter();

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Видалити бренд "${name}"?`)) return;

    const result = await deleteBrand(id);
    if (result.success) {
      toast.success("Бренд видалено");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Брендів поки немає. Створіть перший вище або через форму продукту.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Зображення</TableHead>
              <TableHead>Назва</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-[100px]">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt={b.name} className="w-10 h-10 object-contain rounded-md border bg-white" />
                  ) : (
                    <div className="w-10 h-10 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">Немає</div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {b.slug}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/brands/${b.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(b.id, b.name)}
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
    </div>
  );
}
