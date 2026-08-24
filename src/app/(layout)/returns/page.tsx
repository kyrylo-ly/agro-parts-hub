import { SectionHeader } from "@/components/section-header";
import { RefreshCw, Clock, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Обмін та повернення",
  description: "Інформація про умови обміну та повернення товарів.",
};

export default function ReturnsPage() {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
      <SectionHeader title="Обмін та повернення" subtitle="Прозорі умови для вашої впевненості" />
      
      <div className="mx-auto max-w-4xl mt-10 space-y-10">
        
        {/* Main Info */}
        <section className="rounded-2xl bg-primary/5 p-8 border border-primary/10">
          <div className="flex items-start gap-4">
            <RefreshCw className="h-8 w-8 text-primary mt-1 shrink-0" />
            <div>
              <h2 className="text-xl font-bold mb-3">Повернення товару протягом 14 днів</h2>
              <p className="text-muted-foreground leading-relaxed">
                Відповідно до Закону України «Про захист прав споживачів», ви маєте право обміняти або повернути товар належної якості протягом 14 днів з моменту покупки, не рахуючи дня купівлі, якщо він не підійшов за розміром, формою, габаритами або з інших причин не може бути використаний за призначенням.
              </p>
            </div>
          </div>
        </section>

        {/* Conditions */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Умови обміну та повернення</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Товар не був у використанні і не має слідів монтажу.",
              "Збережено товарний вигляд, комплектація, ярлики та пломби.",
              "Збережено цілісність заводського пакування.",
              "Наявний розрахунковий документ (чек або видаткова накладна)."
            ].map((text, i) => (
              <div key={i} className="flex gap-3 items-center p-4 rounded-xl border bg-card">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Non-returnable */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            <h2 className="text-2xl font-bold tracking-tight">Товари, що не підлягають поверненню</h2>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <ul className="space-y-3 text-muted-foreground text-sm list-disc pl-5 marker:text-destructive">
              <li>Товари, які були у використанні або мають сліди встановлення.</li>
              <li>Деталі, привезені під індивідуальне замовлення клієнта з-за кордону.</li>
              <li>Електрообладнання (датчики, реле, блоки керування тощо) після їх встановлення на техніку.</li>
              <li>Товари з пошкодженим або втраченим заводським пакуванням.</li>
            </ul>
          </div>
        </section>

        {/* Process */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Як оформити повернення?</h2>
          <div className="grid sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-6 left-1/6 right-1/6 h-0.5 bg-border -z-10" />
            
            <div className="flex flex-col items-center text-center gap-3 bg-background relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg ring-4 ring-background">
                1
              </div>
              <h3 className="font-semibold">Зв'яжіться з нами</h3>
              <p className="text-xs text-muted-foreground">Зателефонуйте менеджеру або напишіть у месенджер для узгодження деталей.</p>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3 bg-background relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg ring-4 ring-background">
                2
              </div>
              <h3 className="font-semibold">Відправте товар</h3>
              <p className="text-xs text-muted-foreground">Надішліть товар транспортною компанією без післяплати. Доставку оплачує покупець.</p>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3 bg-background relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg ring-4 ring-background">
                3
              </div>
              <h3 className="font-semibold">Отримайте кошти</h3>
              <p className="text-xs text-muted-foreground">Після огляду товару на складі ми повернемо кошти на вашу картку протягом 1-3 робочих днів.</p>
            </div>
          </div>
        </section>

        {/* Note */}
        <div className="flex gap-3 items-start p-4 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-xl border border-amber-500/20">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            У разі отримання товару з браком або помилково надісланої деталі з нашої вини, всі витрати на транспортування оплачує магазин.
          </p>
        </div>

      </div>
    </div>
  );
}
