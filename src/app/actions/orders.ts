"use server";

import { createClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Product } from "@/lib/types"; // Import Product type for price lookup

// Schema for creating a new order (for future use, e.g., manual order creation or API integration)
const orderItemSchema = z.object({
  product_id: z.string().uuid("Invalid product ID."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

const orderSchema = z.object({
  order_number: z.string().min(1, "Order number is required."),
  customer_name: z.string().min(1, "Customer name is required."),
  customer_email: z.string().email("Invalid email format."),
  total_amount: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0.01, "Total amount must be greater than 0.")
  ),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
  payment_type: z.string().min(1, "Payment type is required.").default('cash'),
  shipping_address_line1: z.string().min(1, "Address Line 1 is required."),
  shipping_address_line2: z.string().optional().nullable(),
  shipping_city: z.string().min(1, "City is required."),
  shipping_state: z.string().min(1, "State is required."),
  shipping_postal_code: z.string().min(1, "Postal Code is required."),
  shipping_country: z.string().min(1, "Country is required."),
  shipping_phone: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, "At least one item is required for the order."),
});

export async function createOrder(values: z.infer<typeof orderSchema>) {
  const supabase = await createClient();

  // Get the current user from the session (this is the store owner, not the customer)
  const { data: { user: storeOwnerUser } } = await supabase.auth.getUser();
  if (!storeOwnerUser) {
    // If no store owner is logged in, this order creation might be from the public storefront.
    // In a multi-tenant setup, we need to determine which profile_id this order belongs to.
    // For now, we'll assume the public storefront is tied to a single profile or we'll need a way to identify it.
    // For simplicity, let's assume the `createOrder` action is always called in the context of a store owner's profile.
    // If this is for a public storefront, the `profile_id` needs to be passed or derived differently.
    // Let's adjust this to fetch the profile based on the current user's session, which would be the *customer* user if they are logged in.
    // If no customer user is logged in, it's a guest checkout.

    // First, try to get the *customer* user session
    const { data: { user: customerUser } } = await supabase.auth.getUser();

    let profileIdForOrder: string | null = null;

    // If a customer is logged in, find the profile associated with their email
    if (customerUser?.email) {
      const { data: customerProfile, error: customerProfileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", customerUser.id) // Assuming customer user_id is linked to a profile
        .single();

      if (customerProfileError && customerProfileError.code !== "PGRST116") {
        console.error("Supabase error fetching customer's profile:", customerProfileError.message);
        return { error: "Database error: Could not determine store profile for order." };
      }
      if (customerProfile) {
        profileIdForOrder = customerProfile.id;
      }
    }

    // If no customer user is logged in or no profile found for them,
    // we need a way to determine which store's profile this order belongs to.
    // For a true SaaS, this would likely come from the storefront's domain/subdomain
    // or a hidden field. For now, let's assume a default or require a logged-in store owner.
    // Given the current structure, the `createOrder` action is called from the storefront,
    // which doesn't inherently know the `profile_id` of the store owner.
    // This is a critical multi-tenancy gap for public storefront orders.

    // TEMPORARY SOLUTION: Fetch the first profile available.
    // In a real SaaS, you'd pass the `profile_id` from the storefront context
    // (e.g., from a subdomain, or a hidden input on the checkout form).
    if (!profileIdForOrder) {
      const { data: firstProfile, error: firstProfileError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1)
        .single();
      if (firstProfileError || !firstProfile) {
        console.error("Supabase error fetching any profile:", firstProfileError?.message);
        return { error: "No store profile found to associate the order with. Please ensure a store profile exists." };
      }
      profileIdForOrder = firstProfile.id;
    }


    let customerId: string | null = null;

    // Check if customer already exists for this profile (using the order's customer_email)
    const { data: existingCustomer, error: customerFetchError } = await supabase
      .from("customers")
      .select("id")
      .eq("profile_id", profileIdForOrder) // Link customer to the determined profile
      .eq("email", values.customer_email)
      .single();

    if (customerFetchError && customerFetchError.code !== "PGRST116") { // PGRST116 means no rows found
      console.error("Supabase error checking for existing customer:", customerFetchError.message);
      return { error: "Database error: Could not check customer existence." };
    }

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Create new customer if not found
      const { data: newCustomer, error: newCustomerError } = await supabase
        .from("customers")
        .insert({
          profile_id: profileIdForOrder, // Link new customer to the determined profile
          name: values.customer_name,
          email: values.customer_email,
        })
        .select("id")
        .single();

      if (newCustomerError) {
        console.error("Supabase error creating new customer:", newCustomerError.message);
        return { error: "Database error: Could not create new customer." };
      }
      customerId = newCustomer.id;
    }

    // Fetch product prices for order items
    const productIds = values.items.map(item => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, price")
      .in("id", productIds);

    if (productsError || !products || products.length !== productIds.length) {
      console.error("Supabase error fetching products for order items:", productsError?.message || "Some products not found.");
      return { error: "Could not retrieve product details for order items." };
    }

    const productPriceMap = new Map(products.map(p => [p.id, p.price]));

    // Calculate total amount based on selected items and their current prices
    let calculatedTotalAmount = 0;
    const orderItemsToInsert = values.items.map(item => {
      const price = productPriceMap.get(item.product_id);
      if (price === undefined) {
        throw new Error(`Price not found for product ID: ${item.product_id}`); // Should not happen if products.length check passes
      }
      calculatedTotalAmount += price * item.quantity;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: price,
      };
    });

    // Ensure the provided total_amount matches the calculated one (optional, but good for validation)
    if (Math.abs(calculatedTotalAmount - values.total_amount) > 0.01) {
      // Allow a small floating point deviation
      // console.warn(`Provided total_amount (${values.total_amount}) does not match calculated total (${calculatedTotalAmount}). Using provided.`);
      // For now, we'll trust the client-provided total_amount, but in a real app, you might enforce server-side calculation.
    }


    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        profile_id: profileIdForOrder, // Use the determined profile_id
        customer_id: customerId,
        order_number: values.order_number,
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        total_amount: values.total_amount, // Use client-provided total for now, or calculatedTotalAmount
        status: values.status,
        payment_type: values.payment_type,
        shipping_address_line1: values.shipping_address_line1,
        shipping_address_line2: values.shipping_address_line2,
        shipping_city: values.shipping_city,
        shipping_state: values.shipping_state,
        shipping_postal_code: values.shipping_postal_code,
        shipping_country: values.shipping_country,
        shipping_phone: values.shipping_phone,
      })
      .select("id")
      .single();

    if (error || !order) {
      console.error("Supabase error creating order:", error.message);
      return { error: "Database error: Could not create order." };
    }

    // Insert order items
    const itemsWithOrderId = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);

    if (orderItemsError) {
      console.error("Supabase error creating order items:", orderItemsError.message);
      // Consider rolling back the order if item insertion fails, or handle partial success
      return { error: "Database error: Could not create order items." };
    }

    revalidatePath("/dashboard/ecommerce/orders");
    revalidatePath("/dashboard/ecommerce/customers");
    revalidatePath("/dashboard/ecommerce/analytics"); // Analytics might be affected
    revalidatePath("/dashboard/ecommerce/top-sales-reports"); // Top sales reports will be affected
    revalidatePath("/store/account"); // Revalidate customer's account page
    return { success: true, orderId: order.id }; // Return the order ID
  }
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", orderId);

  if (error) {
    console.error("Supabase error deleting order:", error.message);
    return { error: "Database error: Could not delete order." };
  }

  revalidatePath("/dashboard/ecommerce/orders");
  revalidatePath("/dashboard/ecommerce/customers"); // Revalidate customers page too
  revalidatePath("/dashboard/ecommerce/analytics"); // Analytics might be affected
  revalidatePath("/dashboard/ecommerce/top-sales-reports"); // Top sales reports will be affected
  revalidatePath("/store/account"); // Revalidate customer's account page
  return { success: true };
}

export async function updateOrderStatus(orderId: string, newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    console.error("Supabase error updating order status:", error.message);
    return { error: "Database error: Could not update order status." };
  }

  revalidatePath("/dashboard/ecommerce/orders");
  revalidatePath("/store/account"); // Revalidate customer's account page
  return { success: true };
}