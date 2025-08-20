const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'QwikXP Test Server',
    status: 'Running',
    url: 'http://qwicxp.com',
    websocket: 'ws://qwicxp.com?token=YOUR_JWT_TOKEN',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌐 Production URL: http://qwicxp.com`);
  console.log(`🔌 Production WebSocket: ws://qwicxp.com?token=YOUR_JWT_TOKEN`);
});

// Простая обработка завершения
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down test server...');
  process.exit(0);
});
