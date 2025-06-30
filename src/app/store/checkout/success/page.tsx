"use client";

import { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/storefront/cart-context";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Clear the cart once the order is successfully placed
    clearCart();
  }, [clearCart]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 p-4">
      <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed Successfully!</h1>
      <p className="text-lg text-gray-700 text-center mb-6">
        Thank you for your purchase. Your order {orderId ? `(#${orderId})` : ''} has been received and is being processed.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/store/products">Continue Shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/ecommerce/orders">View Your Orders (Admin)</Link>
        </Button>
      </div>
    </div>
  );
}