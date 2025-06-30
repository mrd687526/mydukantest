"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProductsDataTable } from "./products-data-table";
import { Button } from "@/components/ui/button";
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
          <Link href="/dashboard/ecommerce/products/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ProductsDataTable data={products} />
      </CardContent>
    </Card>
  );
}