import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RulesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment Rules</CardTitle>
        <CardDescription>
          Create and manage rules to automate actions based on keywords.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-48">
          <p>Rule management interface coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}