export interface ThemeUploadResult {
  themeId: string;
  themeDir: string;
}

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