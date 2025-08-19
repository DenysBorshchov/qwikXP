const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// Секретный ключ для JWT (в продакшене должен быть в .env)
const JWT_SECRET = 'nova_messenger_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());

// Простое хранилище пользователей (в продакшене - база данных)
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@nova.com',
    passwordHash: bcrypt.hashSync('password', 10),
    displayName: 'Администратор',
    createdAt: new Date()
  }
];

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Nova Messenger API v2.0',
    status: 'Running',
    features: ['Authentication', 'JWT Tokens', 'User Management'],
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    service: 'Nova Messenger Backend'
  });
});

// Аутентификация
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Проверка обязательных полей
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username и password обязательны'
      });
    }

    // Проверка существования пользователя
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Пользователь с таким username или email уже существует'
      });
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 12);

    // Создание нового пользователя
    const newUser = {
      id: users.length + 1,
      username,
      email: email || null,
      passwordHash,
      displayName: displayName || username,
      createdAt: new Date()
    };

    users.push(newUser);

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при регистрации'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username и password обязательны'
      });
    }

    // Поиск пользователя
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Неверные учетные данные'
      });
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Неверные учетные данные'
      });
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Успешный вход',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при входе'
    });
  }
});

// Защищенные маршруты
app.get('/api/users', authenticateToken, (req, res) => {
  const safeUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt
  }));

  res.json({
    success: true,
    users: safeUsers,
    total: safeUsers.length
  });
});

app.get('/api/users/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Пользователь не найден'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt
    }
  });
});

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Nova Messenger API v2.0 работает!',
    features: ['JWT Auth', 'User Management', 'Protected Routes'],
    endpoint: '/api/test',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    available: [
      'GET /',
      'GET /health',
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users (protected)',
      'GET /api/users/profile (protected)'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Nova Messenger API v2.0');
  console.log(`📍 Running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`🔐 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔑 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Users: GET http://localhost:${PORT}/api/users (protected)`);
  console.log('✅ Server is ready with JWT Authentication!');
});
