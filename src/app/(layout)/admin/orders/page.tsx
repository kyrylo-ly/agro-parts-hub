import { getAdminOrders } from "@/actions/admin/orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusSelect } from "./status-select";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Замовлення</h1>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Suspense fallback={<AdminOrdersSkeleton />}>
          <AdminOrdersContent />
        </Suspense>
      </div>
    </div>
  );
}

function AdminOrdersSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

async function AdminOrdersContent() {
  const { data: orders = [], success, error } = await getAdminOrders();

  if (!success) {
    return <div className="text-destructive font-medium p-4">{error}</div>;
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">ID / Дата</TableHead>
          <TableHead>Клієнт</TableHead>
          <TableHead>Товари</TableHead>
          <TableHead className="text-right">Сума</TableHead>
          <TableHead className="w-[150px]">Статус</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              Замовлень поки немає.
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => {
            const clientName =
              (order.shippingDetails as any)?.firstName ||
              (order.shippingDetails as any)?.name ||
              "Невідомо";
            const clientPhone =
              (order.shippingDetails as any)?.phone || "Не вказано";

            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium align-top">
                  <div className="text-xs text-muted-foreground truncate w-24" title={order.id}>
                    ...{order.id.slice(-8)}
                  </div>
                  <div className="text-xs whitespace-nowrap mt-1">
                    {formatDate(order.createdAt)}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="font-medium text-sm">{clientName}</div>
                  <div className="text-xs text-muted-foreground">
                    {clientPhone}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <ul className="text-xs space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex gap-2 justify-between items-start">
                        <span className="line-clamp-2">
                          {item.product?.name || "Видалений товар"}
                        </span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">
                          x{item.quantity}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="text-right font-bold align-top whitespace-nowrap">
                  {parseFloat(order.totalPrice).toLocaleString("uk-UA")} ₴
                </TableCell>
                <TableCell className="align-top">
                  <StatusSelect orderId={order.id} initialStatus={order.status} />
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
