import { SectionHeader } from "@/components/section-header";
import { ShieldCheck, FileCheck, Wrench, Settings } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Гарантія",
  description: "Офіційна гарантія на запчастини для сільгосптехніки.",
};

export default function WarrantyPage() {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
      <SectionHeader title="Гарантія" subtitle="Гарантійні зобов'язання та сервіс" />
      
      <div className="mx-auto max-w-4xl mt-10 space-y-12">
        
        {/* Intro */}
        <section className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-6">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            Інтернет-магазин «Агро Літ» реалізує лише якісні запчастини від перевірених виробників. На всі товари, представлені в нашому асортименті, надається гарантія від виробника.
          </p>
        </section>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <FileCheck className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Термін гарантії</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Гарантійний термін встановлюється заводом-виробником і залежить від категорії деталі. Зазвичай він становить від 1 до 12 місяців. Точний термін можна дізнатися в описі товару або у менеджера.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <Wrench className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Умови надання</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Гарантія поширюється на заводський брак. Для збереження гарантії деталь повинна бути встановлена кваліфікованим спеціалістом на спеціалізованому СТО.
            </p>
          </div>
        </div>

        {/* Warranty Denied */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Гарантія не поширюється у випадках:</h2>
          <div className="bg-muted/50 rounded-2xl p-6 border">
            <ul className="space-y-4">
              {[
                "Природне зношення деталі під час експлуатації.",
                "Пошкодження внаслідок неправильного монтажу або використання не за призначенням.",
                "Механічні пошкодження, отримані після передачі товару покупцю (удари, падіння).",
                "Внесення конструктивних змін до деталі покупцем.",
                "Використання неякісних паливно-мастильних матеріалів або охолоджуючих рідин, що призвели до поломки.",
                "Відсутність документа, що підтверджує факт покупки (видаткова накладна, чек)."
              ].map((text, i) => (
                <li key={i} className="flex gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Claim Procedure */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Порядок гарантійного звернення</h2>
          <ol className="space-y-4 list-decimal pl-5 text-muted-foreground text-sm marker:text-primary marker:font-bold">
            <li className="pl-2">Зв'яжіться з нашим менеджером та повідомте про виявлений дефект.</li>
            <li className="pl-2">Надішліть нам фото або відео деталі, що демонструють брак.</li>
            <li className="pl-2">Додайте копію документа про покупку та, за необхідності, акт дефектації з СТО, де проводився монтаж.</li>
            <li className="pl-2">Ми передаємо інформацію виробнику для прийняття рішення (зазвичай це займає від 3 до 14 робочих днів).</li>
            <li className="pl-2">У разі підтвердження гарантійного випадку ми безкоштовно замінимо деталь на нову або повернемо кошти.</li>
          </ol>
        </section>

      </div>
    </div>
  );
}
