import fs from 'fs';
import path from 'path';
import { Liquid } from 'liquidjs';

export async function renderThemePage(
  themeDir: string,
  templateName: string,
  getData: () => Promise<any>
) {
  const engine = new Liquid({
    root: themeDir,
    extname: '.liquid',
    cache: false,
  });

  const templatePath = path.join(themeDir, 'templates', `${templateName}.liquid`);
  if (!fs.existsSync(templatePath)) throw new Error('Template not found: ' + templatePath);

  const context = await getData();

  const html = await engine.renderFile(path.relative(themeDir, templatePath), context);
  return html;
}