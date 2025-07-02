"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal("")),
  avatar: z.string().url("Invalid URL format.").optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function AdminProfileForm({ user, profile }: { user: any; profile: any }) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? "",
      email: user?.email ?? "",
      password: "",
      avatar: profile?.avatar ?? "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    if (values.password) formData.append("password", values.password);
    if (avatarFile) formData.append("avatar_file", avatarFile);
    try {
      const res = await fetch("/api/dashboard/profile/update", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        toast.error("Failed to update profile", { description: data.error });
      } else {
        toast.success("Profile updated successfully!");
        form.reset({ ...values, password: "" });
      }
    } catch (error: any) {
      toast.error("Failed to update profile", { description: error.message });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Your name" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="Your email" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>New Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Leave blank to keep current password" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormItem>
          <FormLabel>Profile Picture</FormLabel>
          {profile?.avatar && (
            <div className="mb-2">
              <Image src={profile.avatar} alt="Avatar" width={64} height={64} className="rounded-full object-cover" />
            </div>
          )}
          <FormControl>
            <Input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
          </FormControl>
        </FormItem>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 