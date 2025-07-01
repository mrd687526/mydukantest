"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ReceiptText, BarChart3, TrendingUp, Warehouse, ShoppingCart, Users } from "lucide-react"; // Added ShoppingCart and Users icons
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType; // LucideIcon
}

const reportNavItems: NavItem[] = [
  { href: "/dashboard/reports/customer", label: "Customer Reports", icon: Users }, // Changed icon
  { href: "/dashboard/reports/orders", label: "Order Reports", icon: ShoppingCart }, // New
  { href: "/dashboard/reports/stock", label: "Stock Reports", icon: Warehouse }, // Changed path
  { href: "/dashboard/ecommerce/refunds", label: "Refund Requests", icon: ReceiptText }, // Kept existing
  { href: "/dashboard/ecommerce/top-sales-reports", label: "Top Sales Reports", icon: TrendingUp }, // Kept existing
];

export function SidebarReportsSection() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(reportNavItems.some(item => pathname.startsWith(item.href))); // Open if any child is active

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="grid items-start px-2 text-sm font-medium lg:px-4">
      <CollapsibleTrigger className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary w-full">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-4 w-4" /> {/* General icon for Reports */}
          Reports
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "rotate-0")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <nav className="grid gap-2 pl-6 py-1"> {/* Indent sub-items */}
          {reportNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname.startsWith(item.href) && "bg-muted text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </CollapsibleContent>
    </Collapsible>
  );
}