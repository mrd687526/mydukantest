import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { BotEditorClient } from "@/components/dashboard/bot-manager/bot-editor-client";
import type { Bot } from "@/lib/types";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BotEditorPage({
  params,
}: {
  params: { botId: string };
}) {
  const supabase = createClient();
  const { botId } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bot, error } = await supabase
    .from("bots")
    .select("*")
    .eq("id", botId)
    .single();

  if (error || !bot) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Bot not found</h1>
        <p className="text-muted-foreground">
          The requested bot could not be found.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/bot-manager">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bot Manager
          </Link>
        </Button>
      </div>
    );
  }

  return <BotEditorClient bot={bot as Bot} />;
}