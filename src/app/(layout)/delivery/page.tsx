import { SectionHeader } from "@/components/section-header";
import { Truck, CreditCard, Wallet, Banknote, MapPin, Package } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Доставка і оплата",
  description: "Умови доставки та оплати запчастин для сільгосптехніки.",
};

export default function DeliveryPage() {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
      <SectionHeader title="Доставка і оплата" subtitle="Зручні та швидкі способи отримання замовлень" />
      
      <div className="grid gap-10 md:grid-cols-2 mt-10">
        {/* Delivery Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Truck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Способи доставки</h2>
          </div>
          
          <div className="grid gap-6">
            <div className="flex gap-4 items-start rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <Package className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Нова Пошта</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Доставка у відділення, поштомат або кур'єром за вашою адресою. Відправка здійснюється в день замовлення (при оформленні до 16:00). Вартість за тарифами перевізника.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <Truck className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Укрпошта</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Доставка у відділення по всій Україні. Економний варіант для негабаритних відправлень. Термін доставки від 2 до 5 днів.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Самовивіз</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Ви можете забрати своє замовлення самостійно з нашого складу або магазину після попереднього погодження з менеджером.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Способи оплати</h2>
          </div>
          
          <div className="grid gap-6">
            <div className="flex gap-4 items-start rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <Banknote className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Готівкою при отриманні</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Оплата готівкою або карткою у відділенні перевізника (післяплата) після огляду товару. Комісію за переказ коштів сплачує покупець.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <CreditCard className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Онлайн-оплата (Visa/Mastercard)</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Безпечна оплата замовлення банківською карткою прямо на сайті через платіжні системи. Без додаткових комісій.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <Wallet className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Безготівковий розрахунок</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Для юридичних та фізичних осіб-підприємців. Можлива оплата з ПДВ або без ПДВ. Рахунок-фактуру формує менеджер після підтвердження замовлення.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
