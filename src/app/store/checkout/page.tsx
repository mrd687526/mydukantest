"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { useCart } from "@/components/storefront/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { createOrder } from "@/app/actions/orders";
import { v4 as uuidv4 } from 'uuid'; // For generating unique order numbers

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const checkoutFormSchema = z.object({
  customer_name: z.string().min(1, "Name is required."),
  customer_email: z.string().email("Invalid email address."),
  shipping_address_line1: z.string().min(1, "Address Line 1 is required."),
  shipping_address_line2: z.string().optional().nullable(),
  shipping_city: z.string().min(1, "City is required."),
  shipping_state: z.string().min(1, "State is required."),
  shipping_postal_code: z.string().min(1, "Postal Code is required."),
  shipping_country: z.string().min(1, "Country is required."),
  shipping_phone: z.string().optional().nullable(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      shipping_address_line1: "",
      shipping_address_line2: "",
      shipping_city: "",
      shipping_state: "",
      shipping_postal_code: "",
      shipping_country: "",
      shipping_phone: "",
    },
  });

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (items.length === 0) {
      toast.info("Your cart is empty. Redirecting to products page.");
      router.push("/store/products");
    }
  }, [items, router]);

  const handleCreateOrderAndPaymentIntent = async (values: CheckoutFormValues) => {
    setIsProcessingOrder(true);
    const orderNumber = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`; // Generate a unique order number

    const orderData = {
      order_number: orderNumber,
      customer_name: values.customer_name,
      customer_email: values.customer_email,
      total_amount: totalAmount,
      status: "pending" as const, // Initial status
      payment_type: "stripe", // Assuming Stripe for now
      shipping_address_line1: values.shipping_address_line1,
      shipping_address_line2: values.shipping_address_line2,
      shipping_city: values.shipping_city,
      shipping_state: values.shipping_state,
      shipping_postal_code: values.shipping_postal_code,
      shipping_country: values.shipping_country,
      shipping_phone: values.shipping_phone,
      items: items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    const createOrderResult = await createOrder(orderData);

    if (createOrderResult.error) {
      toast.error("Failed to create order", { description: createOrderResult.error });
      setIsProcessingOrder(false);
      return;
    }

    const newOrderId = createOrderResult.orderId; // Assuming createOrder returns orderId
    setOrderId(newOrderId);

    // Create Payment Intent
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          currency: "usd", // Or dynamically set based on store settings
          orderId: newOrderId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create payment intent.");
      }

      setClientSecret(data.clientSecret);
      toast.success("Order created. Proceeding to payment.");
    } catch (error: any) {
      toast.error("Failed to set up payment", { description: error.message });
      console.error("Error creating payment intent:", error);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push("/store/products")}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <ul className="divide-y border rounded-md">
            {items.map((item) => (
              <li key={item.id} className="flex items-center py-3 px-4">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded mr-3" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                </div>
                <div className="font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mt-4 p-4 border-t font-bold text-lg">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateOrderAndPaymentIntent)} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shipping_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl><Input placeholder="123-456-7890" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shipping_address_line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shipping_address_line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                  <FormControl><Input placeholder="Apt 4B" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shipping_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="Anytown" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipping_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl><Input placeholder="CA" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shipping_postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl><Input placeholder="90210" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipping_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl><Input placeholder="USA" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!clientSecret ? (
              <Button type="submit" className="w-full" disabled={isProcessingOrder}>
                {isProcessingOrder ? "Processing Order..." : "Continue to Payment"}
              </Button>
            ) : (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <Elements options={{ clientSecret }} stripe={stripePromise}>
                  <CheckoutForm clientSecret={clientSecret} orderId={orderId!} />
                </Elements>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}