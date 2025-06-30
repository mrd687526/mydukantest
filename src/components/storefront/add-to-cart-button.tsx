"use client";
import { useCart } from "./cart-context";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      onClick={() => {
        setLoading(true);
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1,
        });
        setTimeout(() => setLoading(false), 500);
      }}
      disabled={loading}
    >
      {loading ? "Adding..." : "Add to Cart"}
    </Button>
  );
}