import React from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/storefront/product-card";

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">Related Products</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <div key={product.id} className="min-w-[220px] max-w-xs flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
} 