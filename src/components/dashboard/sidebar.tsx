import Link from "next/link";
import {
  LayoutGrid,
  Facebook,
  MessageSquareText,
  Package2,
  LineChart,
  Settings,
  BotMessageSquare,
  Newspaper,
  ShoppingCart, // New icon for E-Commerce
} from "lucide-react";
import { SidebarNav } from "./sidebar-nav";

export function DashboardSidebar() {
  const marketingNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/dashboard/accounts", label: "Connect Accounts", icon: Facebook },
    { href: "/dashboard/facebook-posts", label: "Facebook Posts", icon: Newspaper },
    { href: "/dashboard/comment-manager", label: "Comment Manager", icon: MessageSquareText },
    { href: "/dashboard/bot-manager", label: "Bot Manager", icon: BotMessageSquare },
    { href: "/dashboard/reports", label: "Reports", icon: LineChart },
  ];

  const ecommerceNavItems = [
    // No items yet, but ready for future expansion
  ];

  return (
    <div className="hidden border-r bg-white md:block dark:bg-gray-950">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span>CommentFlow</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <div className="px-4 lg:px-6 mb-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Marketing
            </h3>
            <SidebarNav items={marketingNavItems} />
          </div>
          <div className="px-4 lg:px-6">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              E-Commerce
            </h3>
            {ecommerceNavItems.length > 0 ? (
              <SidebarNav items={ecommerceNavItems} />
            ) : (
              <div className="text-sm text-muted-foreground py-2 px-3">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Coming Soon</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-auto p-4 border-t">
           <Link
              href="/dashboard/settings"
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