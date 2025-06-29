import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CampaignDetailPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const supabase = createClient();
  const { campaignId } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: campaign, error } = await supabase
    .from("automation_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (error || !campaign) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Campaign not found</h1>
        <p>The requested campaign could not be found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/campaigns">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Link>
        </Button>
      </div>
    );
  }

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
            <Badge variant={campaign.is_active ? "default" : "outline"}>
              {campaign.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p>Created on: {new Date(campaign.created_at).toLocaleDateString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Rules</CardTitle>
          <CardDescription>
            Define keywords and actions for incoming comments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Rule management will be implemented here soon.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Tags</CardTitle>
          <CardDescription>
            Organize your campaigns with tags.
          </CardDescription>
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