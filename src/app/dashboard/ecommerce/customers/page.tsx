import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function CustomersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          View and manage your customer list.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>A list of all your customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">No Customers Yet</p>
            <p className="mt-2">
              When customers make a purchase or create an account, they will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}