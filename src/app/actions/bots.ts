"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const botSchema = z.object({
  name: z.string().min(3, "Bot name must be at least 3 characters."),
  connected_account_id: z.string().uuid(),
});

export async function createBot(values: z.infer<typeof botSchema>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile." };
  }

  const { error } = await supabase.from("bots").insert({
    name: values.name,
    connected_account_id: values.connected_account_id,
    profile_id: profile.id,
    status: "inactive",
  });

  if (error) {
    console.error("Supabase error creating bot:", error.message);
    return { error: "Database error: Could not create bot." };
  }

  revalidatePath("/dashboard/bot-manager");
  return { success: true };
}

export async function updateBotFlow(botId: string, flowData: any) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("bots")
    .update({ flow_data: flowData })
    .eq("id", botId);

  if (error) {
    console.error("Supabase error saving bot flow:", error.message);
    return { error: "Database error: Could not save bot flow." };
  }

  revalidatePath(`/dashboard/bot-manager/${botId}`);
  return { success: true };
}

export async function updateBotStatus(botId: string, currentStatus: 'active' | 'inactive') {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in." };
  }

  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

  const { error } = await supabase
    .from("bots")
    .update({ status: newStatus })
    .eq("id", botId);

  if (error) {
    console.error("Supabase error updating bot status:", error.message);
    return { error: "Database error: Could not update bot status." };
  }

  revalidatePath("/dashboard/bot-manager");
  revalidatePath(`/dashboard/bot-manager/${botId}`);
  return { success: true };
}