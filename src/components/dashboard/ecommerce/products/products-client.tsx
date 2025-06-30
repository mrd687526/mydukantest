"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProductsDataTable } from "./products-data-table";
import { CreateProductDialog } from "./create-product-dialog";
import { Product } from "@/lib/types";

interface ProductsClientProps {
  products: Product[];
}

export function ProductsClient({ products }: ProductsClientProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your store's products and inventory.
            </CardDescription>
          </div>
          <CreateProductDialog />
        </div>
      </CardHeader>
      <CardContent>
        <ProductsDataTable data={products} />
      </CardContent>
    </Card>
  );
}