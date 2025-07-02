"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const metaSettingsSchema = z.object({
  meta_app_id: z.string().min(1, "Meta App ID is required."),
  meta_app_secret: z.string().min(1, "Meta App Secret is required."),
});

type MetaSettingsFormValues = z.infer<typeof metaSettingsSchema>;

export function MetaSettingsForm() {
  const form = useForm<MetaSettingsFormValues>({
    resolver: zodResolver(metaSettingsSchema),
    defaultValues: {
      meta_app_id: "",
      meta_app_secret: "",
    },
  });

  const onSubmit = async (values: MetaSettingsFormValues) => {
    // TODO: Save securely to backend
    toast.success("Meta App credentials saved (placeholder)");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="meta_app_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Meta App ID</FormLabel>
            <FormControl><Input {...field} placeholder="Enter Meta App ID" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="meta_app_secret" render={({ field }) => (
          <FormItem>
            <FormLabel>Meta App Secret</FormLabel>
            <FormControl><Input {...field} placeholder="Enter Meta App Secret" type="password" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
} 