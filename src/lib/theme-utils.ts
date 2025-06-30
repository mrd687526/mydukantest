import fs from 'fs/promises';
import path from 'path';
import unzipper from 'unzipper';
import { v4 as uuidv4 } from 'uuid';

const THEMES_DIR = path.join(process.cwd(), 'theme-system', 'themes');

export interface ThemeManifest {
  id: string;
  name: string;
  extractedAt: string;
  layouts: string[];
  templates: string[];
  sections: string[];
  snippets: string[];
  assets: string[];
  settingsSchema: any;
  settingsData: any;
}

/**
 * Extracts a theme zip file to a new directory within the themes folder.
 * @param zipBuffer The buffer of the zip file.
 * @param themeName The name of the theme.
 * @returns The ID of the extracted theme.
 */
export async function extractThemeZip(zipBuffer: Buffer, themeName: string): Promise<string> {
  const themeId = uuidv4();
  const themeDir = path.join(THEMES_DIR, themeId);
  await fs.mkdir(themeDir, { recursive: true });

  const zipFilePath = path.join(themeDir, 'temp_theme.zip');
  await fs.writeFile(zipFilePath, zipBuffer);

  await new Promise((resolve, reject) => {
    fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: themeDir }))
      .on('close', resolve)
      .on('error', reject);
  });

  await fs.unlink(zipFilePath); // Clean up the temporary zip file

  // Validate required files (basic check)
  const requiredFiles = [
    'layout/theme.liquid',
    'config/settings_schema.json'
  ];
  for (const file of requiredFiles) {
    if (!await fileExists(path.join(themeDir, file))) {
      await fs.rm(themeDir, { recursive: true, force: true }); // Clean up incomplete extraction
      throw new Error(`Missing required theme file: ${file} in ${themeName}`);
    }
  }

  // Store metadata
  const manifest: Partial<ThemeManifest> = {
    id: themeId,
    name: themeName,
    extractedAt: new Date().toISOString(),
  };
  await fs.writeFile(
    path.join(themeDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  return themeId;
}

/**
 * Reads the manifest and other metadata for a given theme ID.
 * @param themeId The ID of the theme.
 * @returns The theme manifest.
 */
export async function getThemeManifest(themeId: string): Promise<ThemeManifest | null> {
  const themeDir = path.join(THEMES_DIR, themeId);
  const manifestPath = path.join(themeDir, 'manifest.json');

  if (!await fileExists(manifestPath)) {
    return null;
  }

  const manifestContent = await fs.readFile(manifestPath, 'utf-8');
  const manifest: ThemeManifest = JSON.parse(manifestContent);

  // Add dynamic file lists
  const getFiles = async (subdir: string) => {
    const subDirPath = path.join(themeDir, subdir);
    if (await dirExists(subDirPath)) {
      const files = await fs.readdir(subDirPath);
      return files.map(f => path.join(subdir, f));
    }
    return [];
  };

  manifest.layouts = await getFiles('layout');
  manifest.templates = await getFiles('templates');
  manifest.sections = await getFiles('sections');
  manifest.snippets = await getFiles('snippets');
  manifest.assets = await getFiles('assets');

  // Parse settings schema and data
  const settingsSchemaPath = path.join(themeDir, 'config/settings_schema.json');
  const settingsDataPath = path.join(themeDir, 'config/settings_data.json');
  manifest.settingsSchema = await fileExists(settingsSchemaPath)
    ? JSON.parse(await fs.readFile(settingsSchemaPath, 'utf-8'))
    : {};
  manifest.settingsData = await fileExists(settingsDataPath)
    ? JSON.parse(await fs.readFile(settingsDataPath, 'utf-8'))
    : {};

  return manifest;
}

/**
 * Gets a list of all available theme manifests.
 * @returns An array of theme manifests.
 */
export async function getAllThemeManifests(): Promise<ThemeManifest[]> {
  if (!await dirExists(THEMES_DIR)) {
    return [];
  }

  const themeDirs = await fs.readdir(THEMES_DIR, { withFileTypes: true });
  const themes: ThemeManifest[] = [];

  for (const dirent of themeDirs) {
    if (dirent.isDirectory()) {
      const manifest = await getThemeManifest(dirent.name);
      if (manifest) {
        themes.push(manifest);
      }
    }
  }
  return themes;
}

/**
 * Deletes a theme directory.
 * @param themeId The ID of the theme to delete.
 */
export async function deleteThemeDirectory(themeId: string): Promise<void> {
  const themeDir = path.join(THEMES_DIR, themeId);
  if (await dirExists(themeDir)) {
    await fs.rm(themeDir, { recursive: true, force: true });
  } else {
    throw new Error(`Theme directory not found for ID: ${themeId}`);
  }
}

// Helper to check if a file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Helper to check if a directory exists
async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}