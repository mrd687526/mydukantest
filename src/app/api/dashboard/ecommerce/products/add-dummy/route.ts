import { NextResponse } from "next/server";
import { createProduct } from "@/app/actions/products";

const laptopNames = [
  "Acer Swiftbook 14",
  "Dell Inspiron 15",
  "HP Pavilion x360",
  "Lenovo ThinkPad X1",
  "Apple MacBook Pro 13",
  "Asus ZenBook 14",
  "MSI Modern 15",
  "Samsung Galaxy Book",
  "Microsoft Surface Laptop Go",
  "Razer Blade Stealth 13"
];

const laptopImages = [
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST() {
  let errors = [];
  for (let i = 0; i < 10; i++) {
    const idx = i % laptopNames.length;
    const price = getRandomInt(400, 2000);
    const inventory_quantity = getRandomInt(5, 50);
    const product = {
      name: laptopNames[idx],
      description: `A high-performance laptop: ${laptopNames[idx]}.`,
      price,
      sku: `LAPTOP-${1000 + i}`,
      inventory_quantity,
      image_url: laptopImages[idx],
      category: "Laptops",
      subcategory: "Electronics",
      brand: laptopNames[idx].split(" ")[0],
      label: i % 2 === 0 ? "New Arrival" : "Best Seller",
      variant: null,
      sale_price: price - getRandomInt(20, 100),
      weight_kg: getRandomInt(1, 3),
      tags: "laptop,computer,tech",
      stock_status: "in_stock",
      product_specification: "16GB RAM, 512GB SSD, Intel i7",
      product_details: "1 year warranty included.",
      is_trending: i % 3 === 0,
    };
    // @ts-ignore
    const result = await createProduct(product);
    if (result && result.error) {
      errors.push(result.error);
    }
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(", ") }, { status: 500 });
  }
  return NextResponse.json({ error: null, message: "10 dummy laptop products added!" });
} 