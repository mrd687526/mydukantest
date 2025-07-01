"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Store, Search, Code, ShoppingCart, Truck } from "lucide-react";

const settingsNavItems = [
  { href: "/dashboard/settings/identity", label: "Identity", icon: Store },
  { href: "/dashboard/settings/seo", label: "SEO", icon: Search },
  { href: "/dashboard/settings/customizations", label: "Customizations", icon: Code },
  { href: "/dashboard/settings/checkout", label: "Checkout", icon: ShoppingCart },
  { href: "/dashboard/settings/shipping", label: "Shipping", icon: Truck },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {settingsNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === item.href && "bg-muted text-primary"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}