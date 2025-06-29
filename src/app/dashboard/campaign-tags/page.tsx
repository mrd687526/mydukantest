import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CampaignTagsPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/comment-manager"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Comment Manager
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Campaign Tags</CardTitle>
          <CardDescription>
            Organize your automation campaigns with custom tags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Tags className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">Coming Soon!</p>
            <p className="mt-2">
              This feature is under development. You'll be able to create and manage tags for your campaigns here soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}