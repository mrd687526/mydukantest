"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Brush, Mail, HardDrive, Cookie, Globe } from "lucide-react";

const settingsNavItems = [
  { href: "/superadmin/settings/brand", label: "Brand", icon: Brush },
  { href: "/superadmin/settings/email", label: "Email", icon: Mail },
  { href: "/superadmin/settings/storage", label: "Storage", icon: HardDrive },
  { href: "/superadmin/settings/cookie", label: "Cookie", icon: Cookie },
  { href: "/superadmin/settings/geography", label: "Geography", icon: Globe },
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