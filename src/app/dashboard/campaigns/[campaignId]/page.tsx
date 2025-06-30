import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquareReply,
  MessageSquarePlus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CampaignStatusToggle } from "@/components/dashboard/campaigns/campaign-status-toggle";
import { CampaignRulesClient } from "@/components/dashboard/campaigns/campaign-rules-client";
import { CampaignAdvancedSettings } from "@/components/dashboard/campaigns/campaign-advanced-settings";

export default async function Page(props: {
  params: { campaignId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { params } = props;
  const supabase = createClient();
  const { campaignId } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // Fetch profile by user.id
    .single();
  if (!profile) redirect("/dashboard");

  const campaignRes = await supabase
    .from("automation_campaigns")
    .select("*")
    .eq("id", campaignId)
    .eq("profile_id", profile.id)
    .single();

  if (campaignRes.error || !campaignRes.data) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Campaign not found</h1>
        <p>
          The requested campaign could not be found or you do not have
          permission to view it.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/campaigns">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Link>
        </Button>
      </div>
    );
  }
  const campaign = campaignRes.data;

  const rulesRes = await supabase
    .from("campaign_rules")
    .select(`*, reply_templates ( name )`)
    .eq("campaign_id", campaignId);

  const templatesRes = await supabase
    .from("reply_templates")
    .select("*")
    .eq("profile_id", profile.id);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/campaigns"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Campaigns
      </Link>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{campaign.name}</CardTitle>
              <CardDescription>
                Manage settings, rules, and tags for this campaign.
              </CardDescription>
            </div>
            <CampaignStatusToggle campaign={campaign} />
          </div>
        </CardHeader>
        <CardContent>
          <p>
            Created on: {new Date(campaign.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Auto Replies Sent
            </CardTitle>
            <MessageSquareReply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Not replied yet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Auto Comments Posted
            </CardTitle>
            <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Not commented yet
            </p>
          </CardContent>
        </Card>
      </div>

      <CampaignAdvancedSettings />

      <div className="space-y-4">
        <div className="space-y-1">
            <h3 className="text-xl font-semibold">Comment & Inbox Reply</h3>
            <p className="text-sm text-muted-foreground">
                Set up rules to automatically handle comments and send private messages.
            </p>
        </div>
        <CampaignRulesClient
            campaignId={campaign.id}
            rules={rulesRes.data || []}
            replyTemplates={templatesRes.data || []}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Tags</CardTitle>
          <CardDescription>Organize your campaigns with tags.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Tag management will be implemented here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}