import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const buyerLinks = [
  { label: "Доставка і оплата", href: "/delivery" },
  { label: "Повернення та обмін", href: "/returns" },
  { label: "Гарантія", href: "/warranty" },
];

const companyLinks = [
  { label: "Про нас", href: "/about" },
  { label: "Контакти", href: "/contacts" },
];

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="mt-auto border-t bg-muted/30">
      {/* Main footer content */}
      <div className="container mx-auto max-w-[1400px] px-4 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Покупцям */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Покупцям
            </h3>
            <ul className="space-y-2.5">
              {buyerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Компанія */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Компанія
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Каталог */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Каталог
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Усі категорії
                </Link>
              </li>
              <li>
                <Link
                  href="/brands"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Бренди
                </Link>
              </li>
              <li>
                <Link
                  href="/new"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Новинки
                </Link>
              </li>
              <li>
                <Link
                  href="/bestsellers"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Хіти продажу
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Контакти */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Контакти
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+380952476193"
                  className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Phone className="size-4 shrink-0" />
                  +38 (095) 247-61-93
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@agrolit.com"
                  className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Mail className="size-4 shrink-0" />
                  info@agrolit.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0 mt-0.5" />
                <span>м. Миколаїв, вул. Троїцька 244</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>Пн–Пт: 9:00–18:00</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <Separator />
      <div className="container mx-auto max-w-350 px-4 py-4 lg:px-8">
        <p className="text-center text-xs text-muted-foreground">
          © {currentYear} Агро Літ. Всі права захищено.
        </p>
      </div>
    </footer>
  );
}
