import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TemplatesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment & Reply Templates</CardTitle>
        <CardDescription>
          Manage your reusable templates for comments and replies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-48">
          <p>Template management interface coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}