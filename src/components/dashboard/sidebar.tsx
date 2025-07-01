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
  ShoppingCart,
  Package,
  Users,
  Ticket,
  Palette,
  DollarSign, // Import DollarSign icon for Plans
  Store, // Import Store icon for Store Settings
  Megaphone, // New icon for Marketing
  ScanLine, // New icon for POS
} from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { SidebarReportsSection } from "./sidebar-reports-section";
import { createClient } from "@/integrations/supabase/server"; // Import server client to check user role

export async function DashboardSidebar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isSuperAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id) // Fetch profile by user.id
      .single();
    if (profile && profile.role === 'super_admin') {
      isSuperAdmin = true;
    }
  }

  const marketingNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/dashboard/accounts", label: "Connect Accounts", icon: Facebook },
    { href: "/dashboard/facebook-posts", label: "Facebook Posts", icon: Newspaper },
    { href: "/dashboard/comment-manager", label: "Comment Manager", icon: MessageSquareText },
    { href: "/dashboard/bot-manager", label: "Bot Manager", icon: BotMessageSquare },
    { href: "/dashboard/editor", label: "Drag and Drop Editor", icon: LayoutGrid },
  ];

  const ecommerceNavItems = [
    { href: "/dashboard/ecommerce/orders", label: "Orders", icon: ShoppingCart },
    { href: "/dashboard/ecommerce/products", label: "Products", icon: Package },
    { href: "/dashboard/ecommerce/customers", label: "Customers", icon: Users },
    { href: "/dashboard/ecommerce/analytics", label: "Analytics", icon: LineChart },
    { href: "/dashboard/ecommerce/discounts", label: "Discounts", icon: Ticket },
    { href: "/dashboard/themes", label: "Themes", icon: Palette },
    { href: "/dashboard/pricing", label: "Plans", icon: DollarSign }, // Added Plans link
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
          <div className="px-4 lg:px-6 mb-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              E-Commerce
            </h3>
            <SidebarNav items={ecommerceNavItems} />
            <SidebarReportsSection />
          </div>
          <div className="px-4 lg:px-6 mb-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Marketing Tools
            </h3>
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/dashboard/marketing"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Megaphone className="h-4 w-4" />
                Marketing Overview
              </Link>
            </nav>
          </div>
          <div className="px-4 lg:px-6 mb-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Point of Sale
            </h3>
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/dashboard/pos"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <ScanLine className="h-4 w-4" />
                POS Terminal
              </Link>
            </nav>
          </div>
          {/* Super Admin section removed from here, now in its own sidebar */}
        </div>
        <div className="mt-auto p-4 border-t">
           <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link
              href="/dashboard/settings/identity" // New link for Store Settings
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Store className="h-4 w-4" />
              Store Settings
            </Link>
        </div>
      </div>
    </div>
  );
}