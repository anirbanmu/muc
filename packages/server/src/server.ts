import express from 'express';
import path from 'path';
import { sharedFunction } from '@muc/common';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const clientDistPath = path.resolve(import.meta.dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('/api/message', (req, res) => {
  const message = sharedFunction();
  res.json({ message });
});

app.get('', (req, res) => {
  res.sendFile(path.resolve(clientDistPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${port}`);
  console.log(`Serving client assets from: ${clientDistPath}`);
});
