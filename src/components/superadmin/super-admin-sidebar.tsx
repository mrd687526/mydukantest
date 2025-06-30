import Link from "next/link";
import {
  Package2,
  LayoutGrid,
  Users,
  Settings,
  ShieldCheck,
  DollarSign, // Import DollarSign icon
} from "lucide-react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav"; // Re-using SidebarNav for list rendering

export async function SuperAdminSidebar() {
  const superAdminNavItems = [
    { href: "/superadmin/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/superadmin/users", label: "Users", icon: Users },
    { href: "/superadmin/plans", label: "Plans", icon: DollarSign }, // New: Plans link
  ];

  return (
    <div className="hidden border-r bg-white md:block dark:bg-gray-950">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/superadmin/dashboard" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-6 w-6" />
            <span>Super Admin</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <div className="px-4 lg:px-6 mb-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Administration
            </h3>
            <SidebarNav items={superAdminNavItems} />
          </div>
        </div>
        <div className="mt-auto p-4 border-t">
           <Link
              href="/dashboard/settings" // Link to general settings, as some settings might be shared
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
        </div>
      </div>
    </div>
  );
}