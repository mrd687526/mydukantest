"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateIdentitySettings } from "@/app/actions/store-settings";
import { Profile } from "@/lib/types";

const identitySettingsSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters."),
  logo_url: z.string().url("Invalid URL format.").optional().nullable(),
});

type IdentitySettingsFormValues = z.infer<typeof identitySettingsSchema>;

interface IdentitySettingsFormProps {
  initialData: Profile;
}

export function IdentitySettingsForm({ initialData }: IdentitySettingsFormProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<IdentitySettingsFormValues>({
    resolver: zodResolver(identitySettingsSchema),
    defaultValues: {
      name: initialData.name || "",
      logo_url: initialData.logo_url || "",
    },
  });

  const onSubmit = async (values: IdentitySettingsFormValues) => {
    const formData = new FormData();
    formData.append('name', values.name);
    if (logoFile) {
      formData.append('logo_file', logoFile);
    } else if (values.logo_url) {
      formData.append('logo_url', values.logo_url); // Keep existing URL if no new file
    } else {
      formData.append('logo_url', ''); // Clear if no file and no existing URL
    }

    const result = await updateIdentitySettings(formData);
    if (result.error) {
      toast.error("Failed to update identity settings", { description: result.error });
    } else {
      toast.success(result.message);
      setLogoFile(null); // Clear file input after successful upload
      // Re-fetch profile data to update the form with the new logo_url if it was uploaded
      // For simplicity, we'll rely on revalidatePath in the action, so a refresh will show it.
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Store Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Store Logo</FormLabel>
          {initialData.logo_url && (
            <div className="mb-2">
              <Image src={initialData.logo_url} alt="Store Logo" width={150} height={50} className="rounded-md object-contain" />
            </div>
          )}
          <FormControl>
            <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </FormControl>
          <FormDescription>Upload your store's logo. Max 5MB.</FormDescription>
          <FormMessage />
        </FormItem>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Identity Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}