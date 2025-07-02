"use client";

import Link from "next/link";
import { CircleUser, Menu, Package2, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createBrowserClient } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { clearCacheAction } from "@/app/actions/cache";

export function SuperAdminHeader({ user }: { user: User | null }) {
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleClearCache = () => {
    const promise = clearCacheAction();
    toast.promise(promise, {
      loading: "Clearing cache...",
      success: (data) => {
        if (data.error) throw new Error(data.error);
        router.refresh();
        return "Cache cleared successfully!";
      },
      error: (err) => err.message || "Failed to clear cache.",
    });
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 dark:bg-gray-950">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/superadmin/dashboard"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <ShieldCheck className="h-6 w-6" />
              <span className="sr-only">Super Admin</span>
            </Link>
            <Link
              href="/superadmin/dashboard"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <Package2 className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/superadmin/users"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <Users className="h-5 w-5" />
              Users
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <h1 className="text-lg font-semibold">Super Admin Panel</h1>
      </div>
      <Link href="/dashboard">
        <Button variant="outline" className="mr-2">View Store Admin Dashboard</Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.email || "Super Admin"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleClearCache}>Clear Cache</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}