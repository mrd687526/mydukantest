"use client";

import { ProductsClient } from "@/components/dashboard/ecommerce/products/products-client";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface ProductsPageContentProps {
  products: Product[];
}

export function ProductsPageContent({ products }: ProductsPageContentProps) {
  const [loading, setLoading] = useState(false);

  const handleAddDemoProducts = async () => {
    setLoading(true);
    const result = await addDemoProducts();
    setLoading(false);
    if (result.error) {
      toast.error("Failed to add demo products", { description: result.error });
    } else {
      toast.success(result.message);
    }
  };

  // Calls the API route to add 10 random laptop products
  async function addDemoProducts() {
    try {
      const res = await fetch("/api/dashboard/ecommerce/products/add-dummy", { method: "POST" });
      const data = await res.json();
      return data;
    } catch (error) {
      return { error: "Failed to add demo products." };
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your products and inventory.
          </p>
        </div>
        <Button onClick={handleAddDemoProducts} disabled={loading} variant="outline">
          {loading ? "Adding..." : "Add 10 Dummy Products"}
        </Button>
      </div>
      <ProductsClient products={products} />
    </div>
  );
}