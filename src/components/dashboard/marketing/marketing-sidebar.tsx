"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tag, Zap, Mail, Settings } from "lucide-react";

const marketingNavItems = [
  { href: "/dashboard/marketing/coupons", label: "Coupons", icon: Tag },
  { href: "/dashboard/marketing/flash-sales", label: "Flash Sales", icon: Zap },
  { href: "/dashboard/marketing/newsletter", label: "Newsletter", icon: Mail },
  { href: "/dashboard/settings/notifications", label: "Notifications Settings", icon: Settings },
];

export function MarketingSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {marketingNavItems.map((item) => (
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