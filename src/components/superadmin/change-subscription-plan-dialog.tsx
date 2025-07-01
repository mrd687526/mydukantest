"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSubscriptionPlan } from "@/app/actions/superadmin"; // New action
import { Plan, UserProfileWithSubscription } from "@/lib/types";
import { format } from "date-fns";

const formSchema = z.object({
  planId: z.string().uuid("Please select a valid plan.").nullable(), // Allow null for "No Plan"
  status: z.enum(['trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired']),
  current_period_end: z.string().datetime({ message: "Invalid date format." }).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface ChangeSubscriptionPlanDialogProps {
  userProfile: UserProfileWithSubscription;
  plans: Plan[];
  isOpen: boolean;
  onClose: () => void;
}

export function ChangeSubscriptionPlanDialog({ userProfile, plans, isOpen, onClose }: ChangeSubscriptionPlanDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: plans.find(p => p.name === userProfile.plan_name)?.id || null, // Use null for no plan
      status: userProfile.subscription_status || "active", // Default to active if no status
      current_period_end: userProfile.subscription_end_date ? format(new Date(userProfile.subscription_end_date), "yyyy-MM-dd'T'HH:mm") : null,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const selectedPlan = data.planId ? plans.find(p => p.id === data.planId) : null;
    
    const result = await updateSubscriptionPlan({
      profileId: userProfile.id,
      newStripePriceId: selectedPlan?.stripe_price_id || null, // Pass null if no plan selected
      newStatus: data.status,
      newPeriodEnd: data.current_period_end,
    });

    if (result.error) {
      toast.error("Failed to update subscription", {
        description: result.error,
      });
    } else {
      toast.success(result.message);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Change Subscription for {userProfile.name || userProfile.email}</DialogTitle>
          <DialogDescription>
            Update the subscription plan and status for this user.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Subscription:</p>
              <p className="text-sm text-muted-foreground">
                Plan: {userProfile.plan_name || "None"}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {userProfile.subscription_status ? userProfile.subscription_status.replace('_', ' ') : "None"}
              </p>
              {userProfile.subscription_end_date && (
                <p className="text-sm text-muted-foreground">
                  Renews/Ends: {format(new Date(userProfile.subscription_end_date), 'PPP')}
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select New Plan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Option for no plan / free plan */}
                      <SelectItem value="">No Plan (Free)</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} (${plan.price.toFixed(0)}/{plan.interval})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trialing">Trialing</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="incomplete">Incomplete</SelectItem>
                      <SelectItem value="incomplete_expired">Incomplete Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="current_period_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Period End (Optional)</FormLabel>
                  <FormControl>
                    <input type="datetime-local" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...field} />
                  </FormControl>
                  <FormDescription>
                    Set the end date for the current billing period. Leave blank for no change or if not applicable.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Updating..." : "Update Subscription"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}