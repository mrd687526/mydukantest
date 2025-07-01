"use client";
import { useCart } from "./cart-context";
import { useState } from "react";
import { logCustomerEvent } from "@/app/actions/customer-events";
import { createClient } from "@/integrations/supabase/client"; // Import client for fetching customer_id

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleAddToCart = async () => {
    setLoading(true);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
    });

    // Log 'added_to_cart' event
    const { data: user } = await supabase.auth.getUser();
    if (user) {
      // Fetch the customer_id associated with the logged-in user's email and the store's profile_id
      const { data: storeProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "store_admin")
        .limit(1)
        .single();

      if (storeProfile) {
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("email", user.email!)
          .eq("profile_id", storeProfile.id)
          .single();

        if (customer) {
          await logCustomerEvent({
            customer_id: customer.id,
            event_type: 'added_to_cart',
            event_details: { product_id: product.id, product_name: product.name, quantity: 1 },
          });
        }
      }
    }
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={loading}
    >
      {loading ? "Adding..." : "Add to Cart"}
    </Button>
  );
}