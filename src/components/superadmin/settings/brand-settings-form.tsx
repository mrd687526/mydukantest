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
import { Switch } from "@/components/ui/switch";
import { updateBrandSettings } from "@/app/actions/settings";

const brandSettingsSchema = z.object({
  enable_landing_page: z.boolean().default(false),
  enable_signup: z.boolean().default(false),
});

type BrandSettingsFormValues = z.infer<typeof brandSettingsSchema>;

interface BrandSettingsFormProps {
  initialData: Record<string, any>;
}

export function BrandSettingsForm({ initialData }: BrandSettingsFormProps) {
  const [lightLogoFile, setLightLogoFile] = useState<File | null>(null);
  const [darkLogoFile, setDarkLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const form = useForm<BrandSettingsFormValues>({
    resolver: zodResolver(brandSettingsSchema),
    defaultValues: {
      enable_landing_page: initialData.enable_landing_page === 'true',
      enable_signup: initialData.enable_signup === 'true',
    },
  });

  const onSubmit = async (values: BrandSettingsFormValues) => {
    const formData = new FormData();
    formData.append('enable_landing_page', String(values.enable_landing_page));
    formData.append('enable_signup', String(values.enable_signup));
    if (lightLogoFile) formData.append('brand_logo_light', lightLogoFile);
    if (darkLogoFile) formData.append('brand_logo_dark', darkLogoFile);
    if (faviconFile) formData.append('brand_favicon', faviconFile);

    const result = await updateBrandSettings(formData);
    if (result.error) {
      toast.error("Failed to update settings", { description: result.error });
    } else {
      toast.success(result.message);
      // Optionally reset file inputs if needed
      setLightLogoFile(null);
      setDarkLogoFile(null);
      setFaviconFile(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo Uploads */}
          <div className="space-y-6">
            <FormItem>
              <FormLabel>Light Logo</FormLabel>
              {initialData.brand_logo_light && (
                <Image src={initialData.brand_logo_light} alt="Light Logo" width={150} height={50} className="rounded-md bg-gray-200 p-2" />
              )}
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => setLightLogoFile(e.target.files?.[0] || null)} />
              </FormControl>
              <FormDescription>Upload a logo for light mode.</FormDescription>
            </FormItem>
            <FormItem>
              <FormLabel>Dark Logo</FormLabel>
              {initialData.brand_logo_dark && (
                <Image src={initialData.brand_logo_dark} alt="Dark Logo" width={150} height={50} className="rounded-md bg-gray-800 p-2" />
              )}
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => setDarkLogoFile(e.target.files?.[0] || null)} />
              </FormControl>
              <FormDescription>Upload a logo for dark mode.</FormDescription>
            </FormItem>
            <FormItem>
              <FormLabel>Favicon</FormLabel>
              {initialData.brand_favicon && (
                <Image src={initialData.brand_favicon} alt="Favicon" width={32} height={32} className="rounded-md" />
              )}
              <FormControl>
                <Input type="file" accept="image/x-icon,image/png,image/svg+xml" onChange={(e) => setFaviconFile(e.target.files?.[0] || null)} />
              </FormControl>
              <FormDescription>Upload a .ico, .png, or .svg file.</FormDescription>
            </FormItem>
          </div>
          {/* Feature Toggles */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="enable_landing_page"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Public Landing Page</FormLabel>
                    <FormDescription>Make the main landing page accessible to visitors.</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enable_signup"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable New User Signup</FormLabel>
                    <FormDescription>Allow new users to register for an account.</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Brand Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}