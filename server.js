// server.js
// -------------------------------------------------
// Basit Express sunucusu – PNG, CSV ve JSON kaydetme
// Her şey tek klasörde: 135_Output/<TAG>/
// -------------------------------------------------
const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 4000;

/* ---------- Middleware ---------- */

// Geliştirme için basit CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// JSON gövdeleri 100 MB’e kadar
app.use(express.json({ limit: '100mb' }));

// Eksik klasörleri oluştur
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

/* ---------- 1) Screenshot ---------- */
app.post('/api/saveScreenshot', (req, res) => {
  try {
    const { tag, imageData, filename } = req.body;
    if (!tag || !imageData || !filename)
      return res.status(400).json({ ok:false, error:'Eksik parametre' });

    const m = imageData.match(/^data:(.+);base64,(.+)$/);
    if (!m) return res.status(400).json({ ok:false, error:'Geçersiz imageData' });

    const dir = path.join(__dirname, '135_Output', tag);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, filename), m[2], 'base64');

    console.log('✔ PNG:', path.join(dir, filename));
    res.json({ ok:true });
  } catch (err) {
    console.error('saveScreenshot:', err);
    res.status(500).json({ ok:false, error:err.message });
  }
});

/* ---------- 2) CSV ---------- */
app.post('/api/saveCsv', (req, res) => {
  try {
    const { tag, csvData, filename } = req.body;
    if (!tag || !csvData || !filename)
      return res.status(400).json({ ok:false, error:'Eksik parametre' });

    const dir = path.join(__dirname, '135_Output', tag);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, filename), csvData, 'utf8');

    console.log('✔ CSV:', path.join(dir, filename));
    res.json({ ok:true });
  } catch (err) {
    console.error('saveCsv:', err);
    res.status(500).json({ ok:false, error:err.message });
  }
});

/* ---------- 3) JSON ---------- */
app.post('/api/saveJson', (req, res) => {
  try {
    const { tag, filename, jsonData } = req.body;
    if (!tag || !filename || !jsonData)
      return res.status(400).json({ ok:false, error:'Eksik parametre' });

    // Aynı klasör: 135_Output/<TAG>/
    const dir = path.join(__dirname, '135_Output', tag);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, filename), jsonData, 'utf8');

    console.log('✔ JSON:', path.join(dir, filename));
    res.json({ ok:true });
  } catch (err) {
    console.error('saveJson:', err);
    res.status(500).json({ ok:false, error:err.message });
  }
});

/* ---------- Sunucuyu başlat ---------- */
app.listen(PORT, () =>
  console.log(`Server http://localhost:${PORT} üzerinde çalışıyor`)
);
