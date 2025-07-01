"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

const newsletterFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;

export function NewsletterSignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: NewsletterFormValues) => {
    setIsSubmitting(true);
    const result = await subscribeToNewsletter(data);
    if (result.error) {
      toast.error("Subscription failed", { description: result.error });
    } else {
      toast.success(result.message);
      form.reset();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Stay Updated!</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Subscribe to our newsletter for exclusive offers and updates.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your@example.com"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </Form>
    </div>
  );
}