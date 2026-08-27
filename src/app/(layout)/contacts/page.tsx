import { SectionHeader } from "@/components/section-header";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакти",
  description: "Зв'яжіться з нами для консультації та замовлення запчастин.",
};

export default function ContactsPage() {
  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
      <SectionHeader
        title="Контакти"
        subtitle="Ми завжди на зв'язку та готові допомогти"
      />

      <div className="grid lg:grid-cols-3 gap-8 mt-10">
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex gap-4 p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-full h-fit text-primary">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Телефони</h3>
              <div className="space-y-1 text-muted-foreground">
                <a
                  href="tel:+380952476193"
                  className="block hover:text-primary transition-colors"
                >
                  +38 (095) 247-61-93
                </a>
                <a
                  href="tel:+380990000000"
                  className="block hover:text-primary transition-colors"
                >
                  +38 (099) 000-00-00
                </a>
                <a
                  href="tel:+380670000000"
                  className="block hover:text-primary transition-colors"
                >
                  +38 (067) 000-00-00
                </a>
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-full h-fit text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Графік роботи</h3>
              <div className="space-y-1 text-muted-foreground text-sm">
                <div className="flex justify-between gap-4">
                  <span>Пн - Пт:</span>
                  <span className="font-medium text-foreground">
                    09:00 - 18:00
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Субота:</span>
                  <span className="font-medium text-foreground">
                    09:00 - 15:00
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Неділя:</span>
                  <span className="font-medium text-destructive">Вихідний</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-full h-fit text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Електронна пошта</h3>
              <a
                href="mailto:info@agrolit.com.ua"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                info@agrolit.com.ua
              </a>
            </div>
          </div>

          <div className="flex gap-4 p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-full h-fit text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Адреса</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                м. Дніпро, вул. Агрономічна, 1 (Склад та точка видачі)
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              >
                Прокласти маршрут <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Feedback Form / Messengers */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-muted/30 p-8 rounded-3xl border h-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Напишіть нам
              </h2>
              <p className="text-muted-foreground">
                Заповніть форму нижче, і наш менеджер зв`яжеться з вами
                найближчим часом.
              </p>
            </div>

            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Ваше ім`я
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Іван Іванов"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Номер телефону
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="+38 (000) 000-00-00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Повідомлення
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Опишіть, яка деталь вам потрібна..."
                ></textarea>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2"
              >
                Надіслати повідомлення
              </button>
            </form>

            <div className="mt-12 pt-8 border-t">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Ми у месенджерах
              </h3>
              <div className="flex gap-4">
                <button className="flex items-center justify-center gap-2 rounded-md bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors px-4 py-2 font-medium text-sm">
                  WhatsApp
                </button>
                <button className="flex items-center justify-center gap-2 rounded-md bg-[#7c519b]/10 text-[#7c519b] hover:bg-[#7c519b]/20 transition-colors px-4 py-2 font-medium text-sm">
                  Viber
                </button>
                <button className="flex items-center justify-center gap-2 rounded-md bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors px-4 py-2 font-medium text-sm">
                  Telegram
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
