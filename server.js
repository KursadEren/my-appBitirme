// server.js
const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app = express();

// Basit CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '100mb' }));

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Screenshot kaydet → output/screenshots/{tag}/
app.post('/api/saveScreenshot', (req, res) => {
  try {
    const { tag, imageData, filename } = req.body;
    if (!tag || !imageData || !filename) {
      return res.status(400).json({ ok: false, error: 'Eksik parametre' });
    }
    const m = imageData.match(/^data:(.+);base64,(.+)$/);
    if (!m) throw new Error('Geçersiz imageData');
    const base64 = m[2];
    const saveDir = path.join(__dirname, 'output', tag);
    ensureDir(saveDir);
    const filePath = path.join(saveDir, filename);
    fs.writeFileSync(filePath, base64, 'base64');
    console.log(`✔ Screenshot kaydedildi: ${filePath}`);
    res.json({ ok: true, path: filePath });
  } catch (err) {
    console.error('saveScreenshot error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// CSV kaydet → output/csv/{tag}/
// CSV kaydet → output/screenshots/{tag}/
app.post('/api/saveCsv', (req, res) => {
  try {
    const { tag, csvData, filename } = req.body;
    if (!tag || !csvData || !filename) {
      return res.status(400).json({ ok: false, error: 'Eksik parametre' });
    }
    // Önceki 'tag' klasörü yerine screenshots altına alıyoruz:
    const saveDir = path.join(__dirname, 'output', tag);
    ensureDir(saveDir);
    const filePath = path.join(saveDir, filename);
    fs.writeFileSync(filePath, csvData, 'utf8');
    console.log(`✔ CSV kaydedildi: ${filePath}`);
    res.json({ ok: true, path: filePath });
  } catch (err) {
    console.error('saveCsv error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} üzerinde çalışıyor`);
});
