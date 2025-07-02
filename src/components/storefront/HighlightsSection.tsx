import React from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/storefront/product-card";

interface HighlightsSectionProps {
  bestSellers: Product[];
  newArrivals: Product[];
  deals: Product[];
}

function ProductRow({ title, products }: { title: string; products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4 pl-2">{title}</h2>
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

export default function HighlightsSection({ bestSellers, newArrivals, deals }: HighlightsSectionProps) {
  return (
    <div className="my-8">
      <ProductRow title="Best Sellers" products={bestSellers} />
      <ProductRow title="New Arrivals" products={newArrivals} />
      <ProductRow title="Deals" products={deals} />
    </div>
  );
} 