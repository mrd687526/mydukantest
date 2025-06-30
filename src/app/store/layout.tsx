import Link from "next/link";
import { ShoppingCart, Package2 } from "lucide-react";
import { CartProvider } from "@/components/storefront/cart-context";
import { Button } from "@/components/ui/button";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
          <Link href="/store" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Package2 className="h-6 w-6" />
            <span>MyShop</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/store">Home</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/store/products">Products</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/store/cart" className="flex items-center gap-1">
                <ShoppingCart className="w-5 h-5" />
                Cart
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </nav>
        </header>
        <main className="flex-1 container mx-auto py-8 px-4">{children}</main>
        <footer className="bg-white border-t py-6 text-center text-sm text-muted-foreground">
          <div className="container mx-auto px-4">
            <p>&copy; {new Date().getFullYear()} MyShop. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
              <Link href="/data-deletion" className="hover:underline">Data Deletion</Link>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}