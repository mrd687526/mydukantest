"use client";

import { useState, useEffect } from "react";
import { Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicPlans } from "@/app/actions/plans";
import { createPlanRequest, getPlanRequestsForProfile } from "@/app/actions/plan-requests";
import { Plan, PlanRequest } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRequests, setUserRequests] = useState<PlanRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [plansRes, requestsRes] = await Promise.all([
        getPublicPlans(),
        getPlanRequestsForProfile(),
      ]);

      if (plansRes.error) {
        toast.error("Failed to load plans", { description: plansRes.error });
      } else {
        setPlans(plansRes.data || []);
      }

      if (requestsRes.error) {
        toast.error("Failed to load your requests", { description: requestsRes.error });
      } else {
        setUserRequests(requestsRes.data || []);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleRequestPlan = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    const result = await createPlanRequest({ planId: selectedPlan.id, notes });
    if (result.error) {
      toast.error("Failed to submit request", { description: result.error });
    } else {
      toast.success(result.message);
      // Refetch requests to update status
      const requestsRes = await getPlanRequestsForProfile();
      if (!requestsRes.error) setUserRequests(requestsRes.data || []);
    }
    setIsSubmitting(false);
    setSelectedPlan(null);
    setNotes("");
  };

  const pendingRequest = userRequests.find(req => req.status === 'pending');

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

      {pendingRequest && (
        <Card className="w-full max-w-2xl mb-8 bg-blue-50 border-blue-200">
          <CardHeader className="flex-row items-center gap-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle>Request Pending</CardTitle>
              <CardDescription>
                Your request for the '{pendingRequest.plans?.name}' plan submitted on {format(new Date(pendingRequest.requested_at), 'PPP')} is currently pending approval.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl w-full">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-4"><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-10 w-1/2" /></CardHeader>
              <CardContent className="flex-grow space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></CardContent>
              <CardFooter className="pt-4"><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Dialog open={!!selectedPlan} onOpenChange={(isOpen) => !isOpen && setSelectedPlan(null)}>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl w-full">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="text-4xl font-extrabold text-foreground">${plan.price.toFixed(0)}</span>
                    <span className="text-muted-foreground"> per {plan.interval}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 text-muted-foreground">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button className="w-full" onClick={() => setSelectedPlan(plan)} disabled={!!pendingRequest}>
                    {pendingRequest ? "Request Pending" : "Request Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request '{selectedPlan?.name}'</DialogTitle>
              <DialogDescription>
                Your request will be sent to an administrator for approval. You can add optional notes below.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific requirements or questions..."/>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSelectedPlan(null)}>Cancel</Button>
              <Button onClick={handleRequestPlan} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}