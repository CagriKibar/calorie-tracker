const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Setup (SQLite)
const dbPath = path.join(__dirname, 'calorilens.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB Connection Error:', err.message);
  else console.log('Connected to SQLite.');
});

// Create Tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS food_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    calories REAL,
    protein REAL,
    carbs REAL,
    fat REAL,
    date TEXT,
    time TEXT
  )`);
});

// Load Turkish Foods for Fuzzy Search
const turkishFoods = JSON.parse(fs.readFileSync(path.join(__dirname, 'turkish_foods.json'), 'utf8'));
const fuse = new Fuse(turkishFoods, {
  keys: ['name', 'aliases'],
  threshold: 0.4
});

/* ============================================================
   API ENDPOINTS
============================================================ */

// 1. Search Traditional Turkish Foods (Fuzzy Search)
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  if (!query) return res.json(turkishFoods.slice(0, 20));
  
  const results = fuse.search(query);
  res.json(results.map(r => r.item));
});

// 2. Barcode Lookup (Open Food Facts Proxy)
app.get('/api/barcode/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://world.openfoodfacts.org/api/v2/product/${code}.json`)}`;
    const response = await fetch(url);
    const wrapper = await response.json();
    const data = JSON.parse(wrapper.contents);

    if (data.status === 1) {
      const p = data.product;
      res.json({
        success: true,
        product: {
          name: p.product_name || 'Bilinmeyen Ürün',
          brand: p.brands || '',
          calories: p.nutriments['energy-kcal_100g'] || 0,
          protein: p.nutriments.proteins_100g || 0,
          carbs: p.nutriments.carbohydrates_100g || 0,
          fat: p.nutriments.fat_100g || 0,
          image: p.image_url || ''
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// 3. Save Log
app.post('/api/logs', (req, res) => {
  const { name, calories, protein, carbs, fat, date, time } = req.body;
  const sql = `INSERT INTO food_logs (name, calories, protein, carbs, fat, date, time) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, calories, protein, carbs, fat, date, time], function(err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

// 4. Get Daily Logs
app.get('/api/logs/:date', (req, res) => {
  const date = req.params.date;
  db.all(`SELECT * FROM food_logs WHERE date = ?`, [date], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json(rows);
  });
});

// 5. Delete Log
app.delete('/api/logs/:id', (req, res) => {
  db.run(`DELETE FROM food_logs WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
