"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/use-cart";
import { createOrder } from "@/actions/orders";
import { searchCities, searchWarehouses } from "@/actions/shipping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Check, ChevronsUpDown } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    deliveryType: "nova_poshta" as "nova_poshta" | "ukrposhta" | "pickup",
    city: "",
    warehouse: "",
    zipCode: "",
    paymentMethod: "cash_on_delivery" as "cash_on_delivery" | "card_prepayment" | "mono_pay",
    comment: "",
  });

  const [cities, setCities] = React.useState<string[]>([]);
  const [warehouses, setWarehouses] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (formData.deliveryType === "pickup") return;
    searchCities(formData.city).then(setCities);
  }, [formData.city, formData.deliveryType]);

  React.useEffect(() => {
    if (formData.deliveryType === "pickup" || !formData.city) return;
    searchWarehouses(formData.city, "").then(setWarehouses);
  }, [formData.city, formData.deliveryType]);

  const filteredWarehouses = React.useMemo(() => {
    if (!formData.warehouse) return warehouses.slice(0, 50);
    const search = formData.warehouse.toLowerCase();
    return warehouses.filter(w => w.toLowerCase().includes(search)).slice(0, 50);
  }, [warehouses, formData.warehouse]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (type: "nova_poshta" | "ukrposhta" | "pickup") => {
    setFormData((prev) => ({ ...prev, deliveryType: type, city: "", warehouse: "", zipCode: "" }));
  };

  const handlePaymentChange = (type: "cash_on_delivery" | "card_prepayment" | "mono_pay") => {
    setFormData((prev) => ({ ...prev, paymentMethod: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Кошик порожній");
      return;
    }

    setIsSubmitting(true);

    const result = await createOrder({
      ...formData,
      items: items.map(i => ({ productId: i.id, quantity: i.quantity }))
    });

    if (result.success && result.redirectUrl) {
      clearCart();
      if (formData.paymentMethod === "mono_pay") {
        window.location.href = result.redirectUrl;
      } else {
        router.push(result.redirectUrl);
      }
    } else if (!result.success) {
      toast.error(result.error);
      setIsSubmitting(false);
    }
  };

  function formatPrice(p: string | number): string {
    return Number(p).toLocaleString("uk-UA");
  }

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center gap-6 min-h-[50vh]">
        <div className="size-24 rounded-full bg-muted flex items-center justify-center">
          <ShoppingCart className="size-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Ваш кошик порожній</h1>
        <p className="text-muted-foreground max-w-md">
          Схоже, ви ще не додали товари. Перейдіть до каталогу, щоб знайти потрібні запчастини.
        </p>
        <Link href="/catalog">
          <Button size="lg">Перейти до каталогу</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Оформлення замовлення</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-8 flex flex-col gap-8">

          {/* Contact Details */}
          <section className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground size-6 rounded-full flex items-center justify-center text-sm">1</span>
              Контактні дані
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ім'я *</Label>
                <Input id="firstName" name="firstName" required minLength={2} value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Прізвище *</Label>
                <Input id="lastName" name="lastName" required minLength={2} value={formData.lastName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон *</Label>
                <Input id="phone" name="phone" type="tel" required placeholder="+380 XX XXX XX XX" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Delivery Details */}
          <section className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground size-6 rounded-full flex items-center justify-center text-sm">2</span>
              Доставка
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {[
                { id: "nova_poshta", label: "Нова Пошта" },
                { id: "ukrposhta", label: "Укрпошта" },
                { id: "pickup", label: "Самовивіз" }
              ].map(type => (
                <div
                  key={type.id}
                  onClick={() => handleDeliveryChange(type.id as any)}
                  className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 \${formData.deliveryType === type.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <div className={`size-4 rounded-full border flex items-center justify-center \${formData.deliveryType === type.id ? "border-primary" : "border-muted-foreground"}`}>
                    {formData.deliveryType === type.id && <div className="size-2 bg-primary rounded-full" />}
                  </div>
                  <span className="font-medium">{type.label}</span>
                </div>
              ))}
            </div>

            {formData.deliveryType !== "pickup" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Місто *</Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Почніть вводити назву..."
                    list="city-options"
                  />
                  <datalist id="city-options">
                    {cities.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouse">Відділення *</Label>
                  <Input
                    id="warehouse"
                    name="warehouse"
                    required
                    value={formData.warehouse}
                    onChange={handleChange}
                    placeholder="Оберіть відділення..."
                    list="warehouse-options"
                  />
                  <datalist id="warehouse-options">
                    {filteredWarehouses.map(w => <option key={w} value={w} />)}
                  </datalist>
                </div>

                {formData.deliveryType === "ukrposhta" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="zipCode">Поштовий індекс *</Label>
                    <Input id="zipCode" name="zipCode" required pattern="[0-9]{5}" title="5 цифр" placeholder="Наприклад: 01001" value={formData.zipCode} onChange={handleChange} />
                  </div>
                )}
              </div>
            )}
            {formData.deliveryType === "pickup" && (
              <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                Ви можете забрати своє замовлення за адресою: м. Миколаїв, вул. Троїцька 244, магазин 10. Графік роботи: Пн-Пт 8:00 - 14:00.
              </div>
            )}
          </section>

          {/* Payment Details */}
          <section className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground size-6 rounded-full flex items-center justify-center text-sm">3</span>
              Оплата
            </h2>

            <div className="flex flex-col gap-4">
              {[
                { id: "mono_pay", label: "Оплата онлайн (Apple Pay, Google Pay, Картка)" },
                { id: "cash_on_delivery", label: "При отриманні (Накладений платіж)" },
                { id: "card_prepayment", label: "Переказ на картку" }
              ].map(type => (
                <div
                  key={type.id}
                  onClick={() => handlePaymentChange(type.id as any)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 \${formData.paymentMethod === type.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <div className={`size-4 rounded-full border flex items-center justify-center \${formData.paymentMethod === type.id ? "border-primary" : "border-muted-foreground"}`}>
                    {formData.paymentMethod === type.id && <div className="size-2 bg-primary rounded-full" />}
                  </div>
                  <span className="font-medium">{type.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="comment">Коментар до замовлення</Label>
              <textarea
                id="comment"
                name="comment"
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Залиште побажання..."
                value={formData.comment}
                onChange={handleChange}
              />
            </div>
          </section>
        </form>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 sticky top-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="text-xl font-bold">Разом</h3>

            <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative size-16 bg-muted rounded-lg shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                    ) : (
                      <ShoppingCart className="size-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium line-clamp-2">{item.name}</span>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.quantity} шт x {formatPrice(item.price)} ₴</span>
                      <span className="font-bold text-sm">{formatPrice(Number(item.price) * item.quantity)} ₴</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Товари ({items.length})</span>
                <span>{formatPrice(getTotalPrice())} ₴</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Доставка</span>
                <span>За тарифами перевізника</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold mt-2 text-foreground">
                <span>До сплати</span>
                <span>{formatPrice(getTotalPrice())} ₴</span>
              </div>
            </div>

            <Button
              className="w-full h-12 text-base font-semibold"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Оформлення...</> : "Підтвердити замовлення"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
