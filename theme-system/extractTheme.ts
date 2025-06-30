import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

export async function extractTheme(zipPath: string, themeId: string, destDir = './theme-system/themes') {
  const themeDir = path.join(destDir, themeId);
  await fs.promises.mkdir(themeDir, { recursive: true });

  await fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: themeDir }))
    .promise();

  // Validate required files
  const requiredFiles = [
    'layout/theme.liquid',
    'config/settings_schema.json'
  ];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(themeDir, file))) {
      throw new Error(`Missing required theme file: ${file}`);
    }
  }

  // Store metadata (example: write a manifest)
  await fs.promises.writeFile(
    path.join(themeDir, 'manifest.json'),
    JSON.stringify({ themeId, extractedAt: new Date().toISOString() }, null, 2)
  );

  return themeDir;
}