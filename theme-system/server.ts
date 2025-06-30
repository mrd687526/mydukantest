import express from 'express';
import path from 'path';
import { renderThemePage } from './renderTheme';
import { fetchShopData } from './fetchShopData';

const app = express();
const PORT = process.env.PORT || 4000;

// Example: GET /preview/:themeId/:template
app.get('/preview/:themeId/:template', async (req, res) => {
  const { themeId, template } = req.params;
  const themeDir = path.join(__dirname, 'themes', themeId);

  try {
    const html = await renderThemePage(themeDir, template, fetchShopData);
    res.send(html);
  } catch (err: any) {
    res.status(500).send('Error rendering theme: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Theme server running on port ${PORT}`);
});