"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/storefront/cart-context";

const personalSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
});
const addressSchema = z.object({
  line1: z.string().min(1, "Address Line 1 is required."),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  zip: z.string().min(1, "Postal Code is required."),
  country: z.string().min(1, "Country is required."),
});
const noteSchema = z.object({
  note: z.string().optional(),
});
const accountSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters.").optional(),
});

export function CheckoutWizard({ allowGuest }: { allowGuest: boolean }) {
  const { items, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [isGuest, setIsGuest] = useState(true);
  const [accountCreated, setAccountCreated] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [discount, setDiscount] = useState(0);

  // Form state for each step
  const personalForm = useForm({ resolver: zodResolver(personalSchema) });
  const billingForm = useForm({ resolver: zodResolver(addressSchema) });
  const deliveryForm = useForm({ resolver: zodResolver(addressSchema) });
  const noteForm = useForm({ resolver: zodResolver(noteSchema) });
  const accountForm = useForm({ resolver: zodResolver(accountSchema) });

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountedTotal = totalAmount - discount;

  const steps = [
    "Cart Review",
    "Personal Details",
    "Billing Address",
    "Delivery Address",
    "Payment Method",
    "Additional Note",
    "Review & Confirm",
    "Success",
  ];

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  function handleApplyPromo() {
    // Mock logic: 'SAVE10' gives 10% off
    if (promoCode.trim().toUpperCase() === "SAVE10") {
      const d = totalAmount * 0.1;
      setDiscount(d);
      setPromoError("");
      toast.success("Promo code applied! 10% off.");
    } else {
      setDiscount(0);
      setPromoError("Invalid promo code");
      toast.error("Invalid promo code");
    }
  }

  // ... Step renderers ...
  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Cart Review</h2>
            <ul className="divide-y border rounded-md mb-4">
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
            {/* Promo code input */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder="Promo code"
                className="border rounded px-2 py-1"
              />
              <Button type="button" onClick={handleApplyPromo}>Apply</Button>
            </div>
            {promoError && <div className="text-red-500 text-sm mb-2">{promoError}</div>}
            {discount > 0 && (
              <div className="text-green-600 text-sm mb-2">Discount applied: -${discount.toFixed(2)}</div>
            )}
            <div className="flex justify-between items-center mt-4 p-4 border-t font-bold text-lg">
              <span>Total:</span>
              <span>${discountedTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={next}>Continue</Button>
            </div>
          </div>
        );
      case 1:
        return (
          <FormProvider {...personalForm}>
            <form onSubmit={personalForm.handleSubmit(() => next())} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Personal Details</h2>
              <Input {...personalForm.register("name") } placeholder="Full Name" />
              <Input {...personalForm.register("email") } placeholder="Email" type="email" />
              <Input {...personalForm.register("phone") } placeholder="Phone (optional)" />
              <div className="flex justify-between mt-4">
                <Button type="button" onClick={prev}>Back</Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </FormProvider>
        );
      case 2:
        return (
          <FormProvider {...billingForm}>
            <form onSubmit={billingForm.handleSubmit(() => next())} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Billing Address</h2>
              <Input {...billingForm.register("line1") } placeholder="Address Line 1" />
              <Input {...billingForm.register("line2") } placeholder="Address Line 2 (optional)" />
              <Input {...billingForm.register("city") } placeholder="City" />
              <Input {...billingForm.register("state") } placeholder="State" />
              <Input {...billingForm.register("zip") } placeholder="Postal Code" />
              <Input {...billingForm.register("country") } placeholder="Country" />
              <div className="flex justify-between mt-4">
                <Button type="button" onClick={prev}>Back</Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </FormProvider>
        );
      case 3:
        return (
          <FormProvider {...deliveryForm}>
            <form onSubmit={deliveryForm.handleSubmit(() => next())} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <Input {...deliveryForm.register("line1") } placeholder="Address Line 1" />
              <Input {...deliveryForm.register("line2") } placeholder="Address Line 2 (optional)" />
              <Input {...deliveryForm.register("city") } placeholder="City" />
              <Input {...deliveryForm.register("state") } placeholder="State" />
              <Input {...deliveryForm.register("zip") } placeholder="Postal Code" />
              <Input {...deliveryForm.register("country") } placeholder="Country" />
              <div className="flex justify-between mt-4">
                <Button type="button" onClick={prev}>Back</Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </FormProvider>
        );
      case 4:
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="mb-4">(Payment method selection UI here)</div>
            <div className="flex justify-between mt-4">
              <Button type="button" onClick={prev}>Back</Button>
              <Button onClick={next}>Continue</Button>
            </div>
          </div>
        );
      case 5:
        return (
          <FormProvider {...noteForm}>
            <form onSubmit={noteForm.handleSubmit(() => next())} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Additional Note</h2>
              <Input {...noteForm.register("note") } placeholder="Any special instructions? (optional)" />
              <div className="flex justify-between mt-4">
                <Button type="button" onClick={prev}>Back</Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </FormProvider>
        );
      case 6:
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Review & Confirm</h2>
            {/* Show all collected info for review */}
            <div className="mb-4">(Show summary of all info here)</div>
            {allowGuest && isGuest && !accountCreated && (
              <div className="mb-4">
                <Button onClick={() => setIsGuest(false)}>Create Account</Button>
              </div>
            )}
            {!isGuest && !accountCreated && (
              <FormProvider {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(async (data) => {
                  try {
                    const res = await fetch("/api/store/checkout/create-guest-account", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: personalForm.getValues("name"),
                        email: personalForm.getValues("email"),
                        password: data.password,
                      }),
                    });
                    const result = await res.json();
                    if (result.success) {
                      setAccountCreated(true);
                      toast.success("Account created!");
                    } else {
                      toast.error(result.error || "Failed to create account");
                    }
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Failed to create account");
                  }
                })} className="space-y-4">
                  <Input {...accountForm.register("password")} type="password" placeholder="Set a password" />
                  <Button type="submit">Create Account</Button>
                </form>
              </FormProvider>
            )}
            <div className="flex justify-between mt-4">
              <Button type="button" onClick={prev}>Back</Button>
              <Button onClick={next}>Confirm Order</Button>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Order Confirmed!</h2>
            <p>Thank you for your purchase.</p>
            <Button onClick={() => { clearCart(); setStep(0); }}>Shop More</Button>
          </div>
        );
      default:
        return null;
    }
  }

  // Order summary component
  function OrderSummary() {
    return (
      <aside className="hidden md:block md:w-80 md:ml-8 bg-gray-50 rounded-lg p-6 shadow sticky top-8 h-fit">
        <h3 className="text-lg font-bold mb-4">Order Summary</h3>
        <ul className="divide-y mb-4">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <span>{item.name} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between"><span>Subtotal:</span><span>${totalAmount.toFixed(2)}</span></div>
        {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span><span>- ${discount.toFixed(2)}</span></div>}
        <div className="flex justify-between"><span>Shipping:</span><span>${selectedShipping.cost.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-lg mt-2"><span>Total:</span><span>${finalTotal.toFixed(2)}</span></div>
      </aside>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-start">
      <div className="flex-1">
        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-bold mb-1 ${i === step ? "bg-blue-600 text-white border-blue-600" : i < step ? "bg-blue-100 text-blue-600 border-blue-400" : "bg-gray-100 text-gray-400 border-gray-200"}`}>{i + 1}</div>
                <span className={`text-xs text-center ${i === step ? "text-blue-600 font-semibold" : "text-gray-400"}`}>{label}</span>
                {i < steps.length - 1 && (
                  <div className={`h-1 w-full ${i < step ? "bg-blue-400" : "bg-gray-200"}`}></div>
                )}
              </div>
            ))}
          </div>
          {renderStep()}
        </div>
      </div>
      <OrderSummary />
    </div>
  );
} 