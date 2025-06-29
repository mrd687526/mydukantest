"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const commentTemplateFormSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters."),
  template_text: z.string().min(1, "Template text cannot be empty."),
});

export async function createCommentTemplate(
  values: z.infer<typeof commentTemplateFormSchema>
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a template." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to create a template." };
  }

  const { error } = await supabase.from("comment_templates").insert({
    name: values.name,
    template_text: values.template_text,
    profile_id: profile.id,
  });

  if (error) {
    console.error("Supabase error creating comment template:", error.message);
    return { error: "Database error: Could not create template." };
  }

  revalidatePath("/dashboard/templates");
  return { error: null };
}

const replyTemplateFormSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters."),
  template_text: z.string().min(1, "Template text cannot be empty."),
  reply_type: z.enum(["public", "private", "ai"]),
});

export async function createReplyTemplate(
  values: z.infer<typeof replyTemplateFormSchema>
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to create a template." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to create a template." };
  }

  const { error } = await supabase.from("reply_templates").insert({
    name: values.name,
    template_text: values.template_text,
    reply_type: values.reply_type,
    profile_id: profile.id,
  });

  if (error) {
    console.error("Supabase error creating reply template:", error.message);
    return { error: "Database error: Could not create template." };
  }

  revalidatePath("/dashboard/templates");
  return { error: null };
}

export async function deleteCommentTemplate(templateId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("comment_templates").delete().eq("id", templateId);
  if (error) {
    return { error: "Database error: Could not delete template." };
  }
  revalidatePath("/dashboard/templates");
  return { success: true };
}

export async function deleteReplyTemplate(templateId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("reply_templates").delete().eq("id", templateId);
  if (error) {
    return { error: "Database error: Could not delete template." };
  }
  revalidatePath("/dashboard/templates");
  return { success: true };
}