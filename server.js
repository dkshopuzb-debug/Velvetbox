const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app = express();

// ─── Middleware ───────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// HTML faylni serve qilish (index.html yoki velvetbox.html)
app.use(express.static(path.join(__dirname)));

// ─── Ma'lumot fayli ───────────────────────────────────
const DATA_FILE = path.join(__dirname, 'store-data.json');

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('readData xato:', e.message);
  }
  return null;
}

function writeData(payload) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload), 'utf8');
    return true;
  } catch (e) {
    console.error('writeData xato:', e.message);
    return false;
  }
}

// ─── API: Ma'lumotni olish ────────────────────────────
// GET /api/store  →  { data: "<json-string>" }
app.get('/api/store', (req, res) => {
  const record = readData();
  if (!record) {
    return res.status(404).json({ error: 'Ma\'lumot topilmadi' });
  }
  res.json(record);
});

// ─── API: Ma'lumotni saqlash ──────────────────────────
// POST /api/store  body: { data: "<json-string>" }
app.post('/api/store', (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: '"data" maydoni bo\'sh' });
  }
  // JSON ekanligini tekshirish
  try { JSON.parse(data); } catch (e) {
    return res.status(400).json({ error: 'data noto\'g\'ri JSON' });
  }
  const ok = writeData({ data });
  if (!ok) {
    return res.status(500).json({ error: 'Faylga yozishda xato' });
  }
  res.json({ ok: true });
});

// ─── Bosh sahifa ──────────────────────────────────────
app.get('/', (req, res) => {
  // index.html yoki velvetbox-v5-4-0.html — qaysi biri bo'lsa
  const candidates = ['index.html', 'velvetbox-v5-4-0.html'];
  for (const name of candidates) {
    const p = path.join(__dirname, name);
    if (fs.existsSync(p)) return res.sendFile(p);
  }
  res.status(404).send('index.html topilmadi');
});

// ─── Server ishga tushish ─────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(✅ VelvetBox server ishga tushdi: http://localhost:${PORT});
});
