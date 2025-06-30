"use client";
import { useCart } from "@/components/storefront/cart-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0)
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link href="/store" className="text-primary underline">
          Continue Shopping
        </Link>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.id} className="flex items-center py-4">
            {item.image_url && (
              <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
            )}
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
              <div className="text-primary font-bold">${item.price.toFixed(2)}</div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor={`qty-${item.id}`}>Qty:</Label>
                <input
                  id={`qty-${item.id}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateQuantity(item.id, Number(e.target.value))}
                  className="w-16 border rounded px-2 py-1"
                />
              </div>
            </div>
            <Button variant="ghost" onClick={() => removeFromCart(item.id)}>
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center mt-6">
        <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
        <Button onClick={clearCart} variant="outline">Clear Cart</Button>
      </div>
      <div className="mt-6 text-right">
        <Button asChild>
          <Link href="/store/checkout">Proceed to Checkout</Link>
        </Button>
      </div>
    </div>
  );
}