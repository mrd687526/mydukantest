import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function CampaignsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation Campaigns</CardTitle>
        <CardDescription>
          Create, manage, and monitor your automation campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-48">
          <p>Campaign management interface coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}