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
import { Textarea } from "@/components/ui/textarea";
import { updateSeoSettings } from "@/app/actions/store-settings";
import { Profile } from "@/lib/types";

const seoSettingsSchema = z.object({
  seo_google_analytics_id: z.string().optional().nullable(),
  seo_facebook_pixel_id: z.string().optional().nullable(),
  seo_meta_keywords: z.string().optional().nullable(),
  seo_meta_description: z.string().optional().nullable(),
  seo_meta_image_url: z.string().url("Invalid URL format.").optional().nullable(),
});

type SeoSettingsFormValues = z.infer<typeof seoSettingsSchema>;

interface SeoSettingsFormProps {
  initialData: Profile;
}

export function SeoSettingsForm({ initialData }: SeoSettingsFormProps) {
  const [metaImageFile, setMetaImageFile] = useState<File | null>(null);

  const form = useForm<SeoSettingsFormValues>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      seo_google_analytics_id: initialData.seo_google_analytics_id || "",
      seo_facebook_pixel_id: initialData.seo_facebook_pixel_id || "",
      seo_meta_keywords: initialData.seo_meta_keywords || "",
      seo_meta_description: initialData.seo_meta_description || "",
      seo_meta_image_url: initialData.seo_meta_image_url || "",
    },
  });

  const onSubmit = async (values: SeoSettingsFormValues) => {
    const formData = new FormData();
    formData.append('seo_google_analytics_id', values.seo_google_analytics_id || '');
    formData.append('seo_facebook_pixel_id', values.seo_facebook_pixel_id || '');
    formData.append('seo_meta_keywords', values.seo_meta_keywords || '');
    formData.append('seo_meta_description', values.seo_meta_description || '');
    
    if (metaImageFile) {
      formData.append('seo_meta_image_file', metaImageFile);
    } else if (values.seo_meta_image_url) {
      formData.append('seo_meta_image_url', values.seo_meta_image_url);
    } else {
      formData.append('seo_meta_image_url', '');
    }

    const result = await updateSeoSettings(formData);
    if (result.error) {
      toast.error("Failed to update SEO settings", { description: result.error });
    } else {
      toast.success(result.message);
      setMetaImageFile(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="seo_google_analytics_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Analytics ID</FormLabel>
              <FormControl>
                <Input placeholder="UA-XXXXX-Y or G-XXXXXXXXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seo_facebook_pixel_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facebook Pixel ID</FormLabel>
              <FormControl>
                <Input placeholder="XXXXXXXXXXXXXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seo_meta_keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Keywords</FormLabel>
              <FormControl>
                <Input placeholder="e.g., shoes, apparel, accessories" {...field} />
              </FormControl>
              <FormDescription>Comma-separated keywords for search engines.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seo_meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A short description of your store for search results." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Meta Image</FormLabel>
          {initialData.seo_meta_image_url && (
            <div className="mb-2">
              <Image src={initialData.seo_meta_image_url} alt="Meta Image" width={200} height={100} className="rounded-md object-contain" />
            </div>
          )}
          <FormControl>
            <Input type="file" accept="image/*" onChange={(e) => setMetaImageFile(e.target.files?.[0] || null)} />
          </FormControl>
          <FormDescription>Upload an image for social media sharing (e.g., 1200x630px).</FormDescription>
          <FormMessage />
        </FormItem>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save SEO Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}