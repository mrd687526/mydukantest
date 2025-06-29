"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function CampaignAdvancedSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Settings</CardTitle>
        <CardDescription>
          Configure additional automation features for this campaign.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
          <Label htmlFor="delay-reply" className="flex flex-col space-y-1">
            <span>Enable Delay Reply</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Wait a specified amount of time before sending a reply.
            </span>
          </Label>
          <div className="flex items-center gap-2">
            <Input type="number" defaultValue={0} className="w-20" />
            <span>seconds</span>
            <Switch id="delay-reply" />
          </div>
        </div>

        <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
          <Label htmlFor="url-shortener" className="flex flex-col space-y-1">
            <span>My Dukan Url Shortener Bot</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Automatically shorten any URLs in your replies.
            </span>
          </Label>
          <Switch id="url-shortener" />
        </div>

        <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
          <Label htmlFor="full-page" className="flex flex-col space-y-1">
            <span>Full Page Campaign</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Apply these rules to all posts on the page.
            </span>
          </Label>
          <Switch id="full-page" />
        </div>

        <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
          <Label htmlFor="auto-like" className="flex flex-col space-y-1">
            <span>Auto Like & Share</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Enable automatic liking of comments.
            </span>
          </Label>
          <Switch id="auto-like" />
        </div>
      </CardContent>
    </Card>
  );
}