"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createCheckoutSession } from "@/app/actions/billing";
import { getPublicPlans } from "@/app/actions/plans"; // Import the new action
import { Plan } from "@/lib/types"; // Import the Plan type
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/integrations/supabase/client"; // Import client for user session

export default function PricingPage() {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchPlansAndSubscription = async () => {
      setIsLoadingPlans(true);
      const { data: fetchedPlans, error: plansError } = await getPublicPlans();
      if (plansError) {
        toast.error("Failed to load plans", { description: plansError });
      } else {
        setPlans(fetchedPlans || []);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profile) {
          const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('profile_id', profile.id)
            .single();

          if (subError && subError.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error("Error fetching subscription status:", subError);
          }
          setUserSubscriptionStatus(subscription?.status || null);
        }
      }
      setIsLoadingPlans(false);
    };

    fetchPlansAndSubscription();
  }, [supabase]);

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) {
      toast.info("This is the Free Plan!");
      return;
    }
    setLoadingPriceId(priceId);
    const result = await createCheckoutSession({ priceId });

    if (result.error) {
      toast.error("Subscription failed", { description: result.error });
    } else if (result.url) {
      window.location.href = result.url; // Redirect to Stripe Checkout
    }
    setLoadingPriceId(null);
  };

  const isCurrentPlan = (plan: Plan) => {
    if (plan.stripe_price_id === null && userSubscriptionStatus === null) {
      return true; // Free plan
    }
    // This logic would need to be more robust if you track current plan by price ID
    // For now, we'll assume if a user has any active subscription, they are on a paid plan.
    // A more complete solution would involve fetching the user's current subscription's price_id
    // and comparing it to the plan's stripe_price_id.
    return false;
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

      {isLoadingPlans ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl w-full">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-4">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-10 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter className="pt-4">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl w-full">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col ${
                plan.is_active && plan.name === "Pro Plan" ? "border-2 border-primary shadow-lg" : "" // Example: Highlight Pro Plan
              }`}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="mt-2">
                  <span className="text-4xl font-extrabold text-foreground">
                    ${plan.price.toFixed(0)}
                  </span>
                  <span className="text-muted-foreground"> per {plan.interval}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 text-muted-foreground">
                  {plan.features && plan.features.length > 0 ? (
                    plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center">
                      <X className="h-5 w-5 text-red-500 mr-2" />
                      No features listed
                    </li>
                  )}
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan.stripe_price_id)}
                  disabled={loadingPriceId === plan.stripe_price_id || (userSubscriptionStatus === 'active' && plan.stripe_price_id !== null)}
                >
                  {plan.stripe_price_id === null ? "Current Plan" : (loadingPriceId === plan.stripe_price_id ? "Loading..." : "Get Started")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}