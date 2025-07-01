"use server";

import { createServerClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Product } from "@/lib/types"; // Import Product type for price lookup
import { logCustomerEvent } from "./customer-events"; // Import the new action
import { updateCustomerLastActive } from "./customers"; // Import the new action
import { Order } from "@/lib/types"; // Import Order type for export

// Schema for creating a new order (for future use, e.g., manual order creation or API integration)
const orderItemSchema = z.object({
  product_id: z.string().uuid("Invalid product ID."),
  variant_id: z.number().int().optional().nullable(), // Added variant_id
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

const orderSchema = z.object({
  profile_id: z.string().uuid("Profile ID is required for multi-tenancy."), // Added profile_id
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
  tracking_number: z.string().optional().nullable(), // Added tracking_number
  shipping_label_url: z.string().url("Invalid URL format.").optional().nullable(), // Added shipping_label_url
  items: z.array(orderItemSchema).min(1, "At least one item is required for the order."),
});

export async function createOrder(values: z.infer<typeof orderSchema>) {
  const supabase = createServerClient();

  // The profile_id for the order is now explicitly passed in `values`.
  const profileIdForOrder = values.profile_id;

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

  // Fetch product prices for order items, ensuring they belong to the same profile
  const productIds = values.items.map(item => item.product_id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price")
    .eq("profile_id", profileIdForOrder) // Ensure products belong to this profile
    .in("id", productIds);

  if (productsError || !products || products.length !== productIds.length) {
    console.error("Supabase error fetching products for order items:", productsError?.message || "Some products not found or do not belong to this store.");
    return { error: "Could not retrieve product details for order items. Ensure products exist and belong to your store." };
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
      variant_id: item.variant_id, // Include variant_id
      quantity: item.quantity,
      price_at_purchase: price,
    };
  });

  // Ensure the provided total_amount matches the calculated one (optional, but good for validation)
  if (Math.abs(calculatedTotalAmount - values.total_amount) > 0.01) {
    // For now, we'll trust the client-provided total_amount, but in a real app, you might enforce server-side calculation.
    // console.warn(`Provided total_amount (${values.total_amount}) does not match calculated total (${calculatedTotalAmount}). Using provided.`);
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
      tracking_number: values.tracking_number, // Include tracking_number
      shipping_label_url: values.shipping_label_url, // Include shipping_label_url
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

  // Log 'placed_order' event and update 'last_active' for the customer
  if (customerId) {
    await logCustomerEvent({
      customer_id: customerId,
      event_type: 'placed_order',
      event_details: { order_id: order.id, total_amount: values.total_amount, product_ids: productIds },
    });
    await updateCustomerLastActive(customerId);
  }

  revalidatePath("/dashboard/ecommerce/orders");
  revalidatePath("/dashboard/ecommerce/customers");
  revalidatePath("/dashboard/ecommerce/analytics"); // Analytics might be affected
  revalidatePath("/dashboard/ecommerce/top-sales-reports"); // Top sales reports will be affected
  revalidatePath("/store/account"); // Revalidate customer's account page
  return { success: true, orderId: order.id }; // Return the order ID
}

export async function deleteOrder(orderId: string) {
  const supabase = createServerClient();
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
  const supabase = createServerClient();
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

export async function updateOrderTracking(orderId: string, trackingNumber: string | null, shippingLabelUrl: string | null) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found." };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      tracking_number: trackingNumber,
      shipping_label_url: shippingLabelUrl,
    })
    .eq("id", orderId)
    .eq("profile_id", profile.id); // Ensure admin owns the order

  if (error) {
    console.error("Supabase error updating order tracking:", error.message);
    return { error: "Database error: Could not update tracking information." };
  }

  revalidatePath(`/dashboard/ecommerce/orders/${orderId}`);
  revalidatePath("/dashboard/ecommerce/orders");
  revalidatePath("/store/account"); // Revalidate customer's account page
  return { success: true, message: "Tracking information updated successfully!" };
}

export async function exportOrdersToCsv(): Promise<{ data: string | null; error: string | null }> {
  const supabase = createServerClient();

  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "You must be logged in to export data." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "You must have a profile to export data." };
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      profile_id,
      order_number,
      customer_name,
      customer_email,
      total_amount,
      status,
      created_at,
      updated_at,
      customer_id,
      payment_type,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      shipping_country,
      shipping_phone,
      tracking_number,
      shipping_label_url,
      order_items (
        product_id,
        quantity,
        price_at_purchase,
        products ( name )
      )
    `)
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching orders for export:", error.message);
    return { data: null, error: "Database error: Could not fetch orders for export." };
  }

  if (!orders || orders.length === 0) {
    return { data: null, error: "No order data to export." };
  }

  // Define CSV headers
  const headers = [
    "Order ID", "Order Number", "Customer Name", "Customer Email", "Total Amount",
    "Status", "Payment Type", "Created At", "Updated At", "Shipping Address 1",
    "Shipping Address 2", "Shipping City", "Shipping State", "Shipping Postal Code",
    "Shipping Country", "Shipping Phone", "Tracking Number", "Shipping Label URL",
    "Product Name", "Quantity", "Price at Purchase" // For order items
  ];

  // Map data to CSV rows, handling multiple order items per order
  const csvRows: string[] = [];
  orders.forEach((order: any) => {
    if (order.order_items && order.order_items.length > 0) {
      order.order_items.forEach((item: any) => {
        csvRows.push([
          order.id,
          order.order_number,
          order.customer_name,
          order.customer_email,
          order.total_amount,
          order.status,
          order.payment_type,
          order.created_at,
          order.updated_at,
          order.shipping_address_line1,
          order.shipping_address_line2,
          order.shipping_city,
          order.shipping_state,
          order.shipping_postal_code,
          order.shipping_country,
          order.shipping_phone,
          order.tracking_number || "",
          order.shipping_label_url || "",
          item.products?.name || "N/A",
          item.quantity,
          item.price_at_purchase,
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
      });
    } else {
      // Handle orders with no items (shouldn't happen if order_items are mandatory)
      csvRows.push([
        order.id,
        order.order_number,
        order.customer_name,
        order.customer_email,
        order.total_amount,
        order.status,
        order.payment_type,
        order.created_at,
        order.updated_at,
        order.shipping_address_line1,
        order.shipping_address_line2,
        order.shipping_city,
        order.shipping_state,
        order.shipping_postal_code,
        order.shipping_country,
        order.shipping_phone,
        order.tracking_number || "",
        order.shipping_label_url || "",
        "N/A", 0, 0 // Placeholder for product details
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
    }
  });

  const csvContent = [
    headers.join(','),
    ...csvRows
  ].join('\n');

  return { data: csvContent, error: null };
}

// New schema for POS checkout
const posCheckoutSchema = z.object({
  cartItems: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1, "Cart cannot be empty."),
  payment_type: z.string().min(1, "Payment type is required."),
  customer_email: z.string().email("Invalid customer email.").optional().nullable(),
  customer_name: z.string().optional().nullable(),
  total_amount: z.number().min(0.01, "Total amount must be greater than 0."),
});

export async function processPOSCheckout(values: z.infer<typeof posCheckoutSchema>) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) return { error: "Profile not found." };

  const profileId = profile.id;

  let customerId: string | null = null;
  let customerName = values.customer_name || "POS Customer";
  let customerEmail = values.customer_email || `pos_guest_${Date.now()}@example.com`; // Default for guests

  // Handle customer creation/lookup
  if (values.customer_email) {
    const { data: existingCustomer, error: customerFetchError } = await supabase
      .from("customers")
      .select("id, name")
      .eq("profile_id", profileId)
      .eq("email", values.customer_email)
      .single();

    if (customerFetchError && customerFetchError.code !== "PGRST116") {
      console.error("Supabase error checking for existing customer:", customerFetchError.message);
      return { error: "Database error: Could not check customer existence." };
    }

    if (existingCustomer) {
      customerId = existingCustomer.id;
      customerName = existingCustomer.name; // Use existing name if available
    } else {
      const { data: newCustomer, error: newCustomerError } = await supabase
        .from("customers")
        .insert({
          profile_id: profileId,
          name: customerName,
          email: customerEmail,
        })
        .select("id")
        .single();

      if (newCustomerError) {
        console.error("Supabase error creating new customer:", newCustomerError.message);
        return { error: "Database error: Could not create new customer." };
      }
      customerId = newCustomer.id;
    }
  }

  // Fetch product details and check inventory
  const productIds = values.cartItems.map(item => item.product_id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price, inventory_quantity")
    .eq("profile_id", profileId)
    .in("id", productIds);

  if (productsError || !products || products.length !== productIds.length) {
    console.error("Supabase error fetching products for POS checkout:", productsError?.message || "Some products not found or do not belong to this store.");
    return { error: "Could not retrieve product details. Ensure products exist and belong to your store." };
  }

  const productMap = new Map(products.map(p => [p.id, p]));
  let calculatedTotalAmount = 0;
  const orderItemsToInsert: any[] = [];
  const inventoryUpdates: { id: string; new_quantity: number }[] = [];

  for (const item of values.cartItems) {
    const product = productMap.get(item.product_id);
    if (!product) {
      return { error: `Product with ID ${item.product_id} not found.` };
    }
    if (product.inventory_quantity < item.quantity) {
      return { error: `Not enough stock for ${product.name}. Available: ${product.inventory_quantity}, Requested: ${item.quantity}.` };
    }

    calculatedTotalAmount += product.price * item.quantity;
    orderItemsToInsert.push({
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: product.price,
    });
    inventoryUpdates.push({
      id: product.id,
      new_quantity: product.inventory_quantity - item.quantity,
    });
  }

  // Basic validation for total amount (client-side total should match server-side calculation)
  if (Math.abs(calculatedTotalAmount - values.total_amount) > 0.01) {
    // In a real POS, you might want to strictly enforce server-calculated total or handle discrepancies.
    // For now, we'll proceed but log a warning.
    console.warn(`POS: Client-provided total_amount (${values.total_amount}) does not match calculated total (${calculatedTotalAmount}). Using client-provided.`);
  }

  // Generate a simple order number for POS
  const orderNumber = `POS-${Date.now()}`;

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      profile_id: profileId,
      customer_id: customerId,
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      total_amount: values.total_amount, // Use client-provided total for now
      status: 'delivered', // POS sales are typically completed immediately
      payment_type: values.payment_type,
      source: 'pos', // Mark as POS sale
      shipping_charge: 0, // Assuming no shipping for POS
      discount_amount: 0, // Assuming no discounts applied directly in POS for now
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("Supabase error creating POS order:", orderError.message);
    return { error: "Database error: Could not create POS order." };
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
    console.error("Supabase error creating POS order items:", orderItemsError.message);
    // In a real transaction, you'd roll back the order here. For Supabase, this might require a database function.
    // For now, we'll return an error and rely on manual cleanup if this happens.
    return { error: "Database error: Could not create POS order items. Order created, but items failed." };
  }

  // Update product inventory
  const updatePromises = inventoryUpdates.map(update =>
    supabase.from("products")
      .update({ inventory_quantity: update.new_quantity })
      .eq("id", update.id)
  );

  const updateResults = await Promise.all(updatePromises);
  for (const res of updateResults) {
    if (res.error) {
      console.error("Supabase error updating product inventory:", res.error.message);
      // Critical error: inventory not updated. Manual intervention needed.
      return { error: "Database error: Could not update product inventory. Order and items created, but inventory failed." };
    }
  }

  // Log 'placed_order' event and update 'last_active' for the customer
  if (customerId) {
    await logCustomerEvent({
      customer_id: customerId,
      event_type: 'placed_order',
      event_details: { order_id: order.id, total_amount: values.total_amount, source: 'pos' },
    });
    await updateCustomerLastActive(customerId);
  }

  revalidatePath("/dashboard/ecommerce/orders");
  revalidatePath("/dashboard/ecommerce/customers");
  revalidatePath("/dashboard/ecommerce/analytics");
  revalidatePath("/dashboard/ecommerce/top-sales-reports");
  revalidatePath("/dashboard/reports/stock"); // Stock reports affected
  return { success: true, orderId: order.id, orderNumber: order.order_number };
}