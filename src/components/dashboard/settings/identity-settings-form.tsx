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
import { updateProfileSettings } from "@/app/actions/profile";
import { Profile } from "@/lib/types";

const profileSettingsSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters.").nullable(),
  avatar: z.string().url("Invalid URL format.").optional().nullable(),
  stripe_customer_id: z.string().optional().nullable(),
  role: z.enum(["super_admin", "store_admin"]),
  logo_url: z.string().url("Invalid URL format.").optional().nullable(),
  seo_google_analytics_id: z.string().optional().nullable(),
  seo_facebook_pixel_id: z.string().optional().nullable(),
  seo_meta_keywords: z.string().optional().nullable(),
  seo_meta_description: z.string().optional().nullable(),
  seo_meta_image_url: z.string().url("Invalid URL format.").optional().nullable(),
  custom_domain: z.string().optional().nullable(),
  subdomain: z.string().optional().nullable(),
  custom_css: z.string().optional().nullable(),
  custom_js: z.string().optional().nullable(),
  checkout_enable_notes: z.boolean().nullable(),
  checkout_require_login: z.boolean().nullable(),
  shipping_address: z.string().optional().nullable(),
  shipping_city: z.string().optional().nullable(),
  shipping_state: z.string().optional().nullable(),
  shipping_zip_code: z.string().optional().nullable(),
  shipping_country: z.string().optional().nullable(),
});

type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;

interface IdentitySettingsFormProps {
  initialData: Profile;
}

export function IdentitySettingsForm({ initialData }: IdentitySettingsFormProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      ...initialData,
      name: initialData.name ?? '',
      avatar: initialData.avatar ?? '',
      stripe_customer_id: initialData.stripe_customer_id ?? '',
      logo_url: initialData.logo_url ?? '',
      seo_google_analytics_id: initialData.seo_google_analytics_id ?? '',
      seo_facebook_pixel_id: initialData.seo_facebook_pixel_id ?? '',
      seo_meta_keywords: initialData.seo_meta_keywords ?? '',
      seo_meta_description: initialData.seo_meta_description ?? '',
      seo_meta_image_url: initialData.seo_meta_image_url ?? '',
      custom_domain: initialData.custom_domain ?? '',
      subdomain: initialData.subdomain ?? '',
      custom_css: initialData.custom_css ?? '',
      custom_js: initialData.custom_js ?? '',
      shipping_address: initialData.shipping_address ?? '',
      shipping_city: initialData.shipping_city ?? '',
      shipping_state: initialData.shipping_state ?? '',
      shipping_zip_code: initialData.shipping_zip_code ?? '',
      shipping_country: initialData.shipping_country ?? '',
      checkout_enable_notes: initialData.checkout_enable_notes ?? false,
      checkout_require_login: initialData.checkout_require_login ?? false,
    },
  });

  const onSubmit = async (values: ProfileSettingsFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });
    if (avatarFile) formData.append('avatar_file', avatarFile);
    if (logoFile) formData.append('logo_file', logoFile);
    const result = await updateProfileSettings(formData);
    if (result.error) {
      toast.error("Failed to update profile settings", { description: result.error });
    } else {
      toast.success(result.message);
      setAvatarFile(null);
      setLogoFile(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Identity Section */}
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Store Name</FormLabel>
            <FormControl><Input placeholder="Your Store Name" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormItem>
          <FormLabel>Avatar</FormLabel>
          {initialData.avatar && (
            <div className="mb-2">
              <Image src={initialData.avatar} alt="Avatar" width={50} height={50} className="rounded-full object-contain" />
            </div>
          )}
              <FormControl>
            <Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
        <FormItem>
          <FormLabel>Logo</FormLabel>
          {initialData.logo_url && (
            <div className="mb-2">
              <Image src={initialData.logo_url} alt="Logo" width={150} height={50} className="rounded-md object-contain" />
            </div>
          )}
          <FormControl>
            <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </FormControl>
          <FormMessage />
        </FormItem>
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <FormControl><Input placeholder="Role" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* SEO Section */}
        <FormField control={form.control} name="seo_google_analytics_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Google Analytics ID</FormLabel>
            <FormControl><Input placeholder="Google Analytics ID" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="seo_facebook_pixel_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Facebook Pixel ID</FormLabel>
            <FormControl><Input placeholder="Facebook Pixel ID" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="seo_meta_keywords" render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Keywords</FormLabel>
            <FormControl><Input placeholder="Meta Keywords" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="seo_meta_description" render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Description</FormLabel>
            <FormControl><Input placeholder="Meta Description" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="seo_meta_image_url" render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Image URL</FormLabel>
            <FormControl><Input placeholder="Meta Image URL" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* Customization Section */}
        <FormField control={form.control} name="custom_domain" render={({ field }) => (
          <FormItem>
            <FormLabel>Custom Domain</FormLabel>
            <FormControl><Input placeholder="Custom Domain" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="subdomain" render={({ field }) => (
          <FormItem>
            <FormLabel>Subdomain</FormLabel>
            <FormControl><Input placeholder="Subdomain" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="custom_css" render={({ field }) => (
          <FormItem>
            <FormLabel>Custom CSS</FormLabel>
            <FormControl><Input placeholder="Custom CSS" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="custom_js" render={({ field }) => (
          <FormItem>
            <FormLabel>Custom JS</FormLabel>
            <FormControl><Input placeholder="Custom JS" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* Checkout Section */}
        <FormField control={form.control} name="checkout_enable_notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Enable Notes at Checkout</FormLabel>
            <FormControl><Input type="checkbox" checked={!!field.value} onChange={e => field.onChange(e.target.checked)} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="checkout_require_login" render={({ field }) => (
          <FormItem>
            <FormLabel>Require Login at Checkout</FormLabel>
            <FormControl><Input type="checkbox" checked={!!field.value} onChange={e => field.onChange(e.target.checked)} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* Shipping Section */}
        <FormField control={form.control} name="shipping_address" render={({ field }) => (
          <FormItem>
            <FormLabel>Shipping Address</FormLabel>
            <FormControl><Input placeholder="Shipping Address" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="shipping_city" render={({ field }) => (
          <FormItem>
            <FormLabel>Shipping City</FormLabel>
            <FormControl><Input placeholder="Shipping City" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="shipping_state" render={({ field }) => (
          <FormItem>
            <FormLabel>Shipping State</FormLabel>
            <FormControl><Input placeholder="Shipping State" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="shipping_zip_code" render={({ field }) => (
          <FormItem>
            <FormLabel>Shipping Zip Code</FormLabel>
            <FormControl><Input placeholder="Shipping Zip Code" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="shipping_country" render={({ field }) => (
          <FormItem>
            <FormLabel>Shipping Country</FormLabel>
            <FormControl><Input placeholder="Shipping Country" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Profile Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}