"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  FolderTree,
  Tag,
  Layers,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    title: "Дашборд",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Продукти",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Категорії",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Бренди",
    href: "/admin/brands",
    icon: Tag,
  },
  {
    title: "Колекції",
    href: "/admin/collections",
    icon: Layers,
  },
  {
    title: "Замовлення",
    href: "/admin/orders",
    icon: ClipboardList,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-4">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
            Адмін
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
