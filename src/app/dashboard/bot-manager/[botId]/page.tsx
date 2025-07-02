import { createServerClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import { BotEditorClient } from "@/components/dashboard/bot-manager/bot-editor-client";
import type { Bot } from "@/lib/types";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// This interface is designed to explicitly match the erroneous type
// that the Next.js compiler seems to be expecting for `params` and `searchParams`.
interface BotEditorPageProps {
  params: Promise<{ botId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BotEditorPage(props: BotEditorPageProps) {
  // Await the params object, as the compiler seems to treat it as a Promise.
  const actualParams = await props.params;
  const supabase = createServerClient();
  const { botId } = actualParams; // Use the awaited params

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

  // TODO: Check if bot is connected to Meta, for now always show onboarding link
  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="secondary">
          <Link href={`./onboarding`}>Meta App Onboarding</Link>
        </Button>
      </div>
      <BotEditorClient bot={bot as Bot} />
    </div>
  );
}