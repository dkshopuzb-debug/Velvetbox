const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let storeData = null;

app.get('/store', (req, res) => {
  res.json({ data: storeData });
});

app.post('/store', (req, res) => {
  storeData = req.body.data;
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('VelvetBox backend running on port', PORT));
