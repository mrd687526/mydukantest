"use client";

import React from "react";
import { CartItem } from "./pos-client";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartManagementProps {
  cart: CartItem[];
  subtotal: number;
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onPay: () => void;
}

export function CartManagement({ cart, subtotal, total, onUpdateQuantity, onRemoveItem, onPay }: CartManagementProps) {
  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-2xl font-bold mb-4">Current Sale</h2>
      <ScrollArea className="flex-1 pr-2 mb-4">
        {cart.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">Cart is empty. Add some products!</div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b py-3 last:border-b-0">
              <div className="flex-1">
                <p className="font-medium text-lg">{item.name}</p>
                <p className="text-muted-foreground text-sm">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-lg w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.inventory_quantity}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)}>
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </ScrollArea>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-lg font-medium">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {/* Taxes, Shipping, Discounts can be added here */}
        <div className="flex justify-between text-2xl font-bold text-primary">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={onPay}
        className="w-full mt-6 py-8 text-xl font-bold"
        disabled={cart.length === 0}
      >
        Pay
      </Button>
    </div>
  );
}