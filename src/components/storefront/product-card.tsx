"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Product } from "@/lib/types";
import AddToCartButton from "./add-to-cart-button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <Link href={`/store/products/${product.id}`} className="relative block aspect-square overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
      </Link>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-lg font-semibold line-clamp-2 mb-1">
          <Link href={`/store/products/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="text-primary font-bold text-xl">
          ${product.price.toFixed(2)}
        </p>
        {product.sale_price && product.sale_price < product.price && (
          <p className="text-sm text-muted-foreground line-through">
            ${product.sale_price.toFixed(2)}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
}