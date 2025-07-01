"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input"; // Import Input for name field
import { updateUserProfile } from "@/app/actions/superadmin"; // Updated action name
import { UserProfileWithSubscription } from "@/lib/types"; // Use the combined type

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."), // Added name field
  role: z.enum(['super_admin', 'store_admin']),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserDialogProps {
  userProfile: UserProfileWithSubscription; // Use the combined type
  isOpen: boolean;
  onClose: () => void;
}

export function EditUserDialog({ userProfile, isOpen, onClose }: EditUserDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userProfile.name || "", // Pre-fill name
      role: userProfile.role as 'super_admin' | 'store_admin',
    },
  });

  const onSubmit = async (data: FormValues) => {
    const result = await updateUserProfile({ profileId: userProfile.id, name: data.name, role: data.role }); // Pass name and role

    if (result.error) {
      toast.error("Failed to update user profile", { // Updated toast message
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
          <DialogTitle>Edit User Profile</DialogTitle> {/* Updated title */}
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
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}