import { SectionHeader } from "@/components/section-header";
import { Users, Tractor, Settings2, ShieldCheck, HeartHandshake, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Про компанію | Агро Літ",
  description: "Агро Літ — надійний постачальник запчастин для тракторів та сільгосптехніки.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Надійний партнер вашого агробізнесу</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          «Агро Літ» — спеціалізований інтернет-магазин запчастин для тракторів, комбайнів та іншої сільськогосподарської техніки. Ми допомагаємо українським аграріям працювати без простоїв.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        {[
          { label: "Років на ринку", value: "10+" },
          { label: "Товарів у каталозі", value: "50 000+" },
          { label: "Задоволених клієнтів", value: "15 000+" },
          { label: "Брендів в асортименті", value: "100+" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-6 bg-card border rounded-2xl shadow-sm">
            <span className="text-3xl md:text-4xl font-black text-primary mb-2">{stat.value}</span>
            <span className="text-sm text-muted-foreground font-medium text-center">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Хто ми?</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
            <p>
              Ми знаємо, як важливо під час посівної чи збору врожаю мати справну техніку. Кожна година простою коштує дорого, тому наша головна місія — забезпечити вас необхідними деталями у найкоротші терміни.
            </p>
            <p>
              В нашому асортименті ви знайдете запчастини для тракторів МТЗ, ЮМЗ, Т-150, Т-40, комбайнів та різноманітного причіпного обладнання. Ми працюємо як з оригінальними деталями, так і з якісними аналогами від перевірених виробників.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="bg-primary/5 rounded-2xl p-6 border h-40 flex flex-col justify-end">
              <Tractor className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold">Широкий вибір</h3>
            </div>
            <div className="bg-primary/5 rounded-2xl p-6 border h-48 flex flex-col justify-end">
              <Settings2 className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold">Точний підбір</h3>
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="bg-primary/5 rounded-2xl p-6 border h-48 flex flex-col justify-end">
              <ShieldCheck className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold">Гарантія якості</h3>
            </div>
            <div className="bg-primary/5 rounded-2xl p-6 border h-40 flex flex-col justify-end">
              <Zap className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold">Швидка доставка</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-muted/50 rounded-3xl p-8 md:p-12 border">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Наші принципи роботи</h2>
          <p className="text-muted-foreground">Ми будуємо довгострокові відносини з кожним клієнтом</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center border shadow-sm mb-4">
              <HeartHandshake className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Чесність</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ми завжди відкрито говоримо про виробника деталі, її якість та реальні терміни доставки. Ніяких прихованих платежів чи неякісних підробок під виглядом оригіналу.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center border shadow-sm mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Експертність</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Наші менеджери — це фахівці, які розбираються в сільгосптехніці. Вони допоможуть підібрати саме ту деталь, яка ідеально підійде для вашої модифікації.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center border shadow-sm mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Оперативність</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Власний склад дозволяє нам відправляти більшість замовлень в день їх оформлення. Ми цінуємо ваш час та розуміємо важливість швидкого ремонту.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
