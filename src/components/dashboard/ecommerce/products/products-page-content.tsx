"use client";

import { ProductsClient } from "@/components/dashboard/ecommerce/products/products-client";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addDemoProducts } from "@/app/actions/demo-products";

interface ProductsPageContentProps {
  products: Product[];
}

export function ProductsPageContent({ products }: ProductsPageContentProps) {
  const handleAddDemoProducts = async () => {
    const result = await addDemoProducts();
    if (result.error) {
      toast.error("Failed to add demo products", { description: result.error });
    } else {
      toast.success(result.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your products and inventory.
          </p>
        </div>
        <Button onClick={handleAddDemoProducts}>Add 10 Demo Products</Button>
      </div>
      <ProductsClient products={products} />
    </div>
  );
}