const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nova Messenger API', 
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Nova Messenger Backend'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Nova Messenger API is working!',
    endpoint: '/api/test',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, username: 'demo_user', email: 'demo@nova.com' },
      { id: 2, username: 'test_user', email: 'test@nova.com' }
    ],
    total: 2
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'password') {
    res.json({
      success: true,
      token: 'demo_token_12345',
      user: { username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Error handling
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    available: ['/', '/health', '/api/test', '/api/users', '/api/auth/login']
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Nova Messenger API Server');
  console.log(`📍 Running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log('✅ Server is ready!');
});
