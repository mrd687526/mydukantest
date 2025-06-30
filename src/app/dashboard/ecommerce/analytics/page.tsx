import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your store's performance and growth.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Store Analytics</CardTitle>
          <CardDescription>An overview of your store's key metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <LineChart className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">Analytics Coming Soon</p>
            <p className="mt-2">
              Once you have sales data, your analytics dashboard will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}