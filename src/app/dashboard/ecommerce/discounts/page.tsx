import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";

export default function DiscountsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Discounts</h1>
        <p className="text-muted-foreground">
          Create and manage discount codes and automatic promotions.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Discounts</CardTitle>
          <CardDescription>A list of all your active and expired discounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Ticket className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">No Discounts Yet</p>
            <p className="mt-2">
              Get started by creating your first discount code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}