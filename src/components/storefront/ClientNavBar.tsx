"use client";
import { useState } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import Link from "next/link";

export default function ClientNavBar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {/* Persistent Navigation Bar */}
      <nav className="w-full bg-white dark:bg-gray-900 shadow sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-3">
          <div className="font-bold text-xl">My Dukan</div>
          <div className="flex items-center gap-2">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open navigation menu"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Desktop nav */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/store">Home</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/store#products">Products</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/store/cart">Cart</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/store/account">Account</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            {/* Dark mode toggle */}
            <button
              className="ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle dark mode"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>
        {/* Mobile nav menu */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t shadow px-4 py-2 space-y-2">
            <Link href="/store" className="block py-2 text-lg" onClick={() => setMobileNavOpen(false)}>Home</Link>
            <Link href="/store#products" className="block py-2 text-lg" onClick={() => setMobileNavOpen(false)}>Products</Link>
            <Link href="/store/cart" className="block py-2 text-lg" onClick={() => setMobileNavOpen(false)}>Cart</Link>
            <Link href="/store/account" className="block py-2 text-lg" onClick={() => setMobileNavOpen(false)}>Account</Link>
          </div>
        )}
      </nav>
    </ThemeProvider>
  );
} 