import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Reports</CardTitle>
        <CardDescription>
          View detailed reports for your automation campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-48">
          <p>Reporting interface coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}