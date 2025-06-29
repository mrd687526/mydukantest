"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateBotStatus } from "@/app/actions/bots";
import type { Bot } from "@/lib/types";

interface BotStatusToggleProps {
  bot: Bot;
}

export function BotStatusToggle({ bot }: BotStatusToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await updateBotStatus(bot.id, bot.status);
      if (result.error) {
        toast.error("Failed to update status", { description: result.error });
      } else {
        toast.success(`Bot ${bot.status === 'inactive' ? "activated" : "deactivated"}.`);
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`status-toggle-${bot.id}`}
        checked={bot.status === 'active'}
        onCheckedChange={handleToggle}
        disabled={isPending}
        aria-readonly={isPending}
      />
      <Label htmlFor={`status-toggle-${bot.id}`} className="capitalize">
        {isPending ? "Updating..." : bot.status}
      </Label>
    </div>
  );
}