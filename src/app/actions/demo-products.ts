"use server";

import { createServerClient } from "@/integrations/supabase/server";
import { revalidatePath } from "next/cache";
import { Product } from "@/lib/types";

export async function addDemoProducts() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to add demo products." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "You must have a profile to add demo products." };
  }

  const demoProducts: Partial<Product>[] = [
    {
      profile_id: profile.id,
      name: "Wireless Bluetooth Headphones",
      description: "Immersive sound with noise-cancelling technology and comfortable earcups. Long-lasting battery life.",
      price: 79.99,
      inventory_quantity: 50,
      image_url: "https://picsum.photos/seed/headphones/400/300",
      category: "Electronics",
      brand: "AudioTech",
      sku: "AT-HP001",
      is_trending: true,
      is_downloadable: false,
    },
    {
      profile_id: profile.id,
      name: "Smartwatch with Heart Rate Monitor",
      description: "Track your fitness, receive notifications, and monitor your health with this sleek smartwatch.",
      price: 129.99,
      inventory_quantity: 30,
      image_url: "https://picsum.photos/seed/smartwatch/400/300",
      category: "Wearables",
      brand: "FitGear",
      sku: "FG-SW002",
      is_trending: false,
      is_downloadable: false,
    },
    {
      profile_id: profile.id,
      name: "Organic Coffee Beans (1lb)",
      description: "Premium single-origin organic coffee beans, medium roast with notes of chocolate and caramel.",
      price: 18.50,
      inventory_quantity: 100,
      image_url: "https://picsum.photos/seed/coffee/400/300",
      category: "Food & Beverage",
      brand: "BeanCrafters",
      sku: "BC-CB003",
      is_trending: true,
      is_downloadable: false,
    },
    {
      profile_id: profile.id,
      name: "Portable Power Bank (10000mAh)",
      description: "Keep your devices charged on the go with this high-capacity, fast-charging power bank.",
      price: 35.00,
      inventory_quantity: 75,
      image_url: "https://picsum.photos/seed/powerbank/400/300",
      category: "Electronics",
      brand: "ChargeUp",
      sku: "CU-PB004",
      is_trending: false,
      is_downloadable: false,
    },
    {
      profile_id: profile.id,
      name: "Digital Marketing E-book",
      description: "A comprehensive guide to modern digital marketing strategies for small businesses. (Downloadable PDF)",
      price: 25.00,
      inventory_quantity: 9999, // Unlimited for digital
      image_url: "https://picsum.photos/seed/ebook/400/300",
      category: "Digital Products",
      brand: "KnowledgeHub",
      sku: "KH-DM005",
      is_trending: true,
      is_downloadable: true,
    },
    {
      profile_id: profile.id,
      name: "Yoga Mat (Eco-Friendly)",
      description: "Non-slip, durable, and made from sustainable materials. Perfect for all yoga styles.",
      price: 45.00,
      inventory_quantity: 40,
      image_url: "https://picsum.photos/seed/yogamat/400/300",
      category: "Sports & Outdoors",
      brand: "GreenFlow",
      sku: "GF-YM006",
      is_trending: false,
      is_downloadable: false,
    },
    {
      profile_id: profile.id,
      name: "Stainless Steel Water Bottle",
      description: "Double-walled, vacuum-insulated bottle keeps drinks cold for 24 hours and hot for 12.",
      price: 22.00,
      inventory_quantity: 60,
      image_url: "https://picsum.photos/seed/waterbottle/400/300",
      category: "Home Goods",
      brand: "HydroPure",
      sku: "HP-WB007",
      is_trending: true,
      is_downloadable: false,
    },
    {
      profile_id: profile.id,
      name: "Beginner's Guide to Coding (Online Course)",
      description: "An interactive online course covering the basics of programming with practical exercises.",
      price: 199.00,
      inventory_quantity: 9999, // Unlimited for digital
      image_url: "https://picsum.photos/seed/onlinecourse/400/300",
      category: "Digital Products",
      brand: "CodeAcademy",
      sku: "CA-BC008",
      is_trending: false,
      is_downloadable: true,
    },
    {
      profile_id: profile.id,
      name: "Aromatherapy Essential Oil Diffuser",
      description: "Ultrasonic diffuser with LED lighting and auto shut-off. Perfect for relaxation.",
      price: 30.00,
      inventory_quantity: 25,
      image_url: "https://picsum.photos/seed/diffuser/400/300",
      category: "Health & Wellness",
      brand: "ZenAura",
      sku: "ZA-ED009",
      is_trending: false,
      is_downloadable: false,
    },
    {
      profile_id: profile.id,
      name: "Noise-Cancelling Earbuds",
      description: "Compact and powerful earbuds with active noise cancellation for crystal-clear audio.",
      price: 99.99,
      inventory_quantity: 45,
      image_url: "https://picsum.photos/seed/earbuds/400/300",
      category: "Electronics",
      brand: "SoundFlow",
      sku: "SF-EB010",
      is_trending: true,
      is_downloadable: false,
    },
  ];

  const { error } = await supabase.from("products").insert(demoProducts);

  if (error) {
    console.error("Supabase error inserting demo products:", error.message);
    return { error: "Database error: Could not add demo products." };
  }

  revalidatePath("/dashboard/ecommerce/products");
  return { success: true, message: "10 demo products added successfully!" };
}