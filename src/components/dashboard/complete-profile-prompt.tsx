"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/integrations/supabase/client";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface CompleteProfilePromptProps {
  user: User;
}

export function CompleteProfilePrompt({ user }: CompleteProfilePromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    // Use upsert to create or update the profile based on user.id
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, name: data.name }, { onConflict: 'id' }); // Conflict on 'id' to update if exists

    if (error) {
      toast.error("Failed to create/update profile. Please try again.");
      console.error("Profile creation/update error:", error.message || JSON.stringify(error));
    } else {
      toast.success("Profile created successfully!");
      setIsOpen(false);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          Welcome to your Dashboard!
        </h3>
        <p className="text-sm text-muted-foreground">
          Please complete your profile to get started.
        </p>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4">Complete Profile</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Complete Your Profile</DialogTitle>
              <DialogDescription>
                Enter your name to set up your account. You can change this later.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}