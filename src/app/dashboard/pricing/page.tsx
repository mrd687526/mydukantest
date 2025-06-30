"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createCheckoutSession } from "@/app/actions/billing";

// Dummy pricing data - In a real app, you'd fetch this from Stripe or your database
const pricingPlans = [
  {
    name: "Basic Plan",
    price: "$19",
    interval: "per month",
    stripePriceId: "price_1Pj123ABCDEF", // Replace with your actual Stripe Price ID
    features: [
      "5 Automation Campaigns",
      "Unlimited Comment Templates",
      "Basic Reports",
      "Email Support",
    ],
    isRecommended: false,
  },
  {
    name: "Pro Plan",
    price: "$49",
    interval: "per month",
    stripePriceId: "price_1Pj456GHIJKL", // Replace with your actual Stripe Price ID
    features: [
      "Unlimited Automation Campaigns",
      "Advanced Reports",
      "AI-Powered Replies",
      "Priority Support",
      "E-commerce Integrations",
      "Bot Manager Access",
    ],
    isRecommended: true,
  },
];

export default function PricingPage() {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    setLoadingPriceId(priceId);
    const result = await createCheckoutSession({ priceId });

    if (result.error) {
      toast.error("Subscription failed", { description: result.error });
    } else if (result.url) {
      window.location.href = result.url; // Redirect to Stripe Checkout
    }
    setLoadingPriceId(null);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Choose Your Plan
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Unlock powerful features to grow your business.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl w-full">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col ${
              plan.isRecommended ? "border-2 border-primary shadow-lg" : ""
            }`}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="mt-2">
                <span className="text-4xl font-extrabold text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground"> {plan.interval}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2 text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan.stripePriceId)}
                disabled={loadingPriceId === plan.stripePriceId}
              >
                {loadingPriceId === plan.stripePriceId ? "Loading..." : "Get Started"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}