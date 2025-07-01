"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductsForPOS } from "@/app/actions/products";
import { Product } from "@/lib/types";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { PlusCircle } from "lucide-react";

interface ProductSelectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onProductSelect: (product: Product) => void;
}

export function ProductSelection({ searchTerm, setSearchTerm, onProductSelect }: ProductSelectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await getProductsForPOS(debouncedSearchTerm);
      if (error) {
        toast.error("Failed to fetch products", { description: error });
        setProducts([]);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [debouncedSearchTerm]);

  return (
    <div className="flex flex-col h-full">
      <Input
        placeholder="Search products by name or SKU..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-3 text-lg"
      />
      <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-2">
        {loading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">No products found.</div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden">
              {product.image_url && (
                <div className="relative w-full h-32 bg-gray-200">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-t-lg"
                  />
                </div>
              )}
              <CardHeader className="p-3 pb-0 flex-grow">
                <CardTitle className="text-base font-semibold line-clamp-2">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{product.sku}</p>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">Stock: {product.inventory_quantity}</span>
                </div>
                <Button
                  onClick={() => onProductSelect(product)}
                  className="w-full text-base py-6"
                  disabled={product.inventory_quantity <= 0}
                >
                  <PlusCircle className="mr-2 h-5 w-5" /> Add
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}