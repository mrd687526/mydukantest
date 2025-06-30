import fs from 'fs';
import path from 'path';
import { Liquid } from 'liquidjs';
import { getMockShopifyData } from './mockShopifyData';

export async function renderThemePage(themeDir: string, templateName: string, data: any = null) {
  const engine = new Liquid({
    root: themeDir,
    extname: '.liquid',
    cache: false,
  });

  // Load template (e.g., 'templates/index.liquid')
  const templatePath = path.join(themeDir, 'templates', `${templateName}.liquid`);
  if (!fs.existsSync(templatePath)) throw new Error('Template not found: ' + templatePath);

  // Use real data or fallback to mock data
  const context = data || getMockShopifyData();

  // Render
  const html = await engine.renderFile(path.relative(themeDir, templatePath), context);
  return html;
}