"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ConnectedAccount } from "@/lib/types";
import { CreateBotDialog } from "./create-bot-dialog";
import { BotStatusToggle } from "./bot-status-toggle";

interface BotManagerClientProps {
  accounts: ConnectedAccount[];
}

export function BotManagerClient({ accounts }: BotManagerClientProps) {
  if (accounts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            No Facebook Pages Connected
          </h3>
          <p className="text-sm text-muted-foreground">
            Please connect a Facebook page from the 'Connect Accounts' page to create a bot.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {accounts.map((account) => {
        const bot = account.bots?.[0];
        return (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle>Page: {account.fb_page_id}</CardTitle>
              <CardDescription>
                Manage the Messenger bot for this Facebook page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bot ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{bot.name}</p>
                    <div className="mt-2">
                      <BotStatusToggle bot={bot} />
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/dashboard/bot-manager/${bot.id}`}>Manage Bot</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-4">
                  <p className="text-muted-foreground">
                    No bot has been created for this page yet.
                  </p>
                  <CreateBotDialog connectedAccountId={account.id} />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}