import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RepliesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto Replies</CardTitle>
        <CardDescription>
          Manage your reply templates for public, private, and AI-generated responses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-48">
          <p>Reply template management interface coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}