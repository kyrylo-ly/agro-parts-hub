"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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
import { InlineCreateBrand } from "./inline-create-brand";

interface Brand {
  id: number;
  name: string;
  slug: string;
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

  return (
    <div className="space-y-4">
      <InlineCreateBrand onCreated={() => router.refresh()} />

      {brands.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Брендів поки немає. Створіть перший вище або через форму продукту.
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Назва</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-[80px]">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {b.slug}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(b.id, b.name)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
