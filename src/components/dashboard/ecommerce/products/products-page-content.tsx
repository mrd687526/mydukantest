"use client";

import { ProductsClient } from "@/components/dashboard/ecommerce/products/products-client";
import { Product } from "@/lib/types";

interface ProductsPageContentProps {
  products: Product[];
}

export function ProductsPageContent({ products }: ProductsPageContentProps) {
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your products and inventory.
          </p>
        </div>
      </div>
      <ProductsClient products={products} />
    </div>
  );
}