import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function ProductsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">
          Create, edit, and manage your products and inventory.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>A list of all products in your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">No Products Yet</p>
            <p className="mt-2">
              Get started by creating your first product.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}