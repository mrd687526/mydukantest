"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";

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
import { Input } from "@/components/ui/input";
import { updateUserProfile } from "@/app/actions/superadmin";
import { UserProfileWithSubscription, Plan } from "@/lib/types"; // Import Plan type
import { ChangeSubscriptionPlanDialog } from "./change-subscription-plan-dialog"; // Import new dialog

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.enum(['super_admin', 'store_admin']),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserDialogProps {
  userProfile: UserProfileWithSubscription;
  isOpen: boolean;
  onClose: () => void;
  allPlans: Plan[]; // Pass all available plans to this dialog
}

export function EditUserDialog({ userProfile, isOpen, onClose, allPlans }: EditUserDialogProps) {
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userProfile.name || "",
      role: userProfile.role as 'super_admin' | 'store_admin',
    },
  });

  const onSubmit = async (data: FormValues) => {
    const result = await updateUserProfile({ profileId: userProfile.id, name: data.name, role: data.role });

    if (result.error) {
      toast.error("Failed to update user profile", {
        description: result.error,
      });
    } else {
      toast.success(result.message);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update details for {userProfile.name || userProfile.email}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="User's Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="store_admin">Store Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subscription Status Section */}
            <div className="space-y-2 border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold">Subscription Status</h3>
              <p className="text-sm text-muted-foreground">
                Current Plan: {userProfile.plan_name || "None"}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {userProfile.subscription_status ? userProfile.subscription_status.replace('_', ' ') : "None"}
              </p>
              {userProfile.subscription_end_date && (
                <p className="text-sm text-muted-foreground">
                  Renews/Ends: {format(new Date(userProfile.subscription_end_date), 'PPP')}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsChangePlanDialogOpen(true)}
                className="mt-2"
              >
                Change Plan
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {isChangePlanDialogOpen && (
        <ChangeSubscriptionPlanDialog
          userProfile={userProfile}
          plans={allPlans}
          isOpen={isChangePlanDialogOpen}
          onClose={() => setIsChangePlanDialogOpen(false)}
        />
      )}
    </Dialog>
  );
}