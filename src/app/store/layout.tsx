import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { CartProvider } from "@/components/storefront/cart-context";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <Link href="/store" className="text-xl font-bold text-primary">MyShop</Link>
          <nav className="flex items-center gap-4">
            <Link href="/store" className="hover:underline">Home</Link>
            <Link href="/store/cart" className="flex items-center gap-1 hover:underline">
              <ShoppingCart className="w-5 h-5" />
              Cart
            </Link>
          </nav>
        </header>
        <main className="flex-1 container mx-auto py-8 px-4">{children}</main>
        <footer className="bg-white border-t py-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MyShop. All rights reserved.
        </footer>
      </div>
    </CartProvider>
  );
}