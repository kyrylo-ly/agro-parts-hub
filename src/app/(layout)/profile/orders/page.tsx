import { getUserOrders } from "@/actions/orders";
import Image from "next/image";
import Link from "next/link";
import { Package, Calendar, CreditCard, Box } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Мої замовлення",
};

export const instant = false;

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8 lg:py-16 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Мої замовлення</h1>
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="border-b bg-muted/30 p-4 sm:px-6 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-24 lg:ml-auto" />
              <Skeleton className="h-6 w-24 lg:ml-auto" />
            </div>
          </div>
          <div className="p-4 sm:px-6">
            <div className="flex gap-4">
              <Skeleton className="size-20 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function OrdersContent() {
  const result = await getUserOrders(1, 50);

  if (!result.success) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-xl">
        {result.error}
      </div>
    );
  }

  const orders = result.data;

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6">
        <div className="size-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
          <Package className="size-10" />
        </div>
        <h1 className="text-2xl font-bold">У вас ще немає замовлень</h1>
        <p className="text-muted-foreground max-w-md">
          Зробіть своє перше замовлення, і воно з`явиться тут.
        </p>
        <Link href="/categories" className="mt-4">
          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8">
            Перейти до каталогу
          </span>
        </Link>
      </div>
    );
  }

  const statusMap = {
    pending: {
      label: "Очікує",
      color: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    },
    processing: {
      label: "В обробці",
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
    },
    shipped: {
      label: "Відправлено",
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
    },
    delivered: {
      label: "Доставлено",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    },
    cancelled: {
      label: "Скасовано",
      color: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };

  const paymentStatusMap = {
    unpaid: "Не оплачено",
    paid: "Оплачено",
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const statusConfig = statusMap[order.status as keyof typeof statusMap];

        return (
          <div
            key={order.id}
            className="bg-card border rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="border-b bg-muted/30 p-4 sm:px-6 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg">
                    Замовлення №{order.id.slice(0, 8)}
                  </span>
                  {statusConfig && (
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold border rounded-full ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    {new Date(order.createdAt).toLocaleDateString("uk-UA")}
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="size-4" />
                    {paymentStatusMap[
                      order.paymentStatus as keyof typeof paymentStatusMap
                    ] || order.paymentStatus}
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-sm text-muted-foreground mb-1">
                  Сума замовлення
                </div>
                <div className="font-bold text-xl">
                  {Number(order.totalPrice).toLocaleString("uk-UA")} ₴
                </div>
              </div>
            </div>

            <div className="p-4 sm:px-6">
              <div className="space-y-4">
                {order.items.map((item) => {
                  const product = item.product;
                  const productName = product?.name || "Видалений товар";
                  const productUrl = product?.slug
                    ? `/product/${product.slug}`
                    : "#";

                  return (
                    <div key={item.id} className="flex gap-4">
                      <Link href={productUrl} className="shrink-0 block">
                        <div className="relative size-20 bg-white rounded-xl border p-1 overflow-hidden">
                          {product?.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={productName}
                              fill
                              sizes="80px"
                              className="object-contain"
                            />
                          ) : (
                            <Box className="size-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/30" />
                          )}
                        </div>
                      </Link>
                      <div className="flex flex-col flex-1 min-w-0 py-1">
                        <Link
                          href={productUrl}
                          className={`font-medium line-clamp-2 transition-colors ${product ? "hover:text-primary" : "pointer-events-none text-muted-foreground"}`}
                        >
                          {productName}
                        </Link>
                        <div className="mt-auto flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity} шт x{" "}
                            {Number(item.priceAtPurchase).toLocaleString(
                              "uk-UA",
                            )}{" "}
                            ₴
                          </span>
                          <span className="font-semibold">
                            {(
                              Number(item.priceAtPurchase) * item.quantity
                            ).toLocaleString("uk-UA")}{" "}
                            ₴
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
