import fs from 'fs';
import path from 'path';

export interface ThemeManifest {
  themeId: string;
  layouts: string[];
  templates: string[];
  sections: string[];
  snippets: string[];
  assets: string[];
  settingsSchema: any;
  settingsData: any;
}

export async function parseTheme(themeDir: string, themeId: string): Promise<ThemeManifest> {
  const getFiles = (subdir: string) =>
    fs.existsSync(path.join(themeDir, subdir))
      ? fs.readdirSync(path.join(themeDir, subdir)).map(f => path.join(subdir, f))
      : [];

  const layouts = getFiles('layout');
  const templates = getFiles('templates');
  const sections = getFiles('sections');
  const snippets = getFiles('snippets');
  const assets = getFiles('assets');

  // Parse settings
  const settingsSchemaPath = path.join(themeDir, 'config/settings_schema.json');
  const settingsDataPath = path.join(themeDir, 'config/settings_data.json');
  const settingsSchema = fs.existsSync(settingsSchemaPath)
    ? JSON.parse(fs.readFileSync(settingsSchemaPath, 'utf-8'))
    : {};
  const settingsData = fs.existsSync(settingsDataPath)
    ? JSON.parse(fs.readFileSync(settingsDataPath, 'utf-8'))
    : {};

  return {
    themeId,
    layouts,
    templates,
    sections,
    snippets,
    assets,
    settingsSchema,
    settingsData,
  };
}