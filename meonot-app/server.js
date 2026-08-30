const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// DATA_DIR lets you point storage at a persistent Railway Volume.
// Without one, data still survives restarts but may be lost on redeploy.
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Return the saved data, or null if nothing has been saved yet.
app.get('/api/data', (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return res.json(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to read data file:', e);
      return res.json(null);
    }
  }
  res.json(null);
});

// Save the full system state (overwrites the file each time).
app.post('/api/data', (req, res) => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body));
    res.json({ ok: true });
  } catch (e) {
    console.error('Failed to write data file:', e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Data file: ' + DATA_FILE);
});
