"use server";

import { revalidatePath } from "next/cache";

export async function clearCacheAction() {
  try {
    // This revalidates the cache for all pages in your application.
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error clearing cache:", error);
    return { error: "An unexpected error occurred while clearing the cache." };
  }
}