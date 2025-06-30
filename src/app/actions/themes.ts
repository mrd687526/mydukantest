"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  extractThemeZip,
  getAllThemeManifests,
  deleteThemeDirectory,
  ThemeManifest,
} from "@/lib/theme-utils";

const uploadThemeSchema = z.object({
  themeName: z.string().min(1, "Theme name is required."),
  themeFile: z.instanceof(File, { message: "Theme file is required." }),
});

export async function uploadTheme(formData: FormData) {
  const themeName = formData.get("themeName");
  const themeFile = formData.get("themeFile");

  const validatedFields = uploadThemeSchema.safeParse({
    themeName,
    themeFile,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { themeName: validatedThemeName, themeFile: validatedThemeFile } =
    validatedFields.data;

  try {
    const arrayBuffer = await validatedThemeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const themeId = await extractThemeZip(buffer, validatedThemeName);

    revalidatePath("/dashboard/themes");
    return { success: true, themeId, message: "Theme uploaded successfully!" };
  } catch (error: any) {
    console.error("Error uploading theme:", error);
    return { error: error.message || "Failed to upload theme." };
  }
}

export async function getThemes(): Promise<{ data: ThemeManifest[] | null; error: string | null }> {
  try {
    const themes = await getAllThemeManifests();
    return { data: themes, error: null };
  } catch (error: any) {
    console.error("Error fetching themes:", error);
    return { data: null, error: error.message || "Failed to fetch themes." };
  }
}

export async function deleteTheme(themeId: string) {
  try {
    await deleteThemeDirectory(themeId);
    revalidatePath("/dashboard/themes");
    return { success: true, message: "Theme deleted successfully!" };
  } catch (error: any) {
    console.error("Error deleting theme:", error);
    return { error: error.message || "Failed to delete theme." };
  }
}