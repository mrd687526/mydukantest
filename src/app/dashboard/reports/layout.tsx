import { type PropsWithChildren } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, ShoppingCart, Warehouse } from "lucide-react";

interface ReportNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const reportSubNavItems: ReportNavItem[] = [
  { href: "/dashboard/reports/customer", label: "Customer Reports", icon: Users },
  { href: "/dashboard/reports/orders", label: "Order Reports", icon: ShoppingCart },
  { href: "/dashboard/reports/stock", label: "Stock Reports", icon: Warehouse },
];

export default function ReportsLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Analyze your store's performance with detailed reports.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        <nav className="flex flex-col gap-1">
          {reportSubNavItems.map((item) => (
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
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}