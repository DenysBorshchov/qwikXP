const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const WebSocketService = require('./websocket-service');

const app = express();
const server = http.createServer(app);
const PORT = 3000; // Порт для локальной разработки
const BASE_URL = 'http://qwicxp.com'; // Основной URL для продакшена
const prisma = new PrismaClient();

// Инициализация WebSocket сервиса
const wsService = new WebSocketService(server);

// Секретный ключ для JWT (в продакшене должен быть в .env)
const JWT_SECRET = 'qwikxp_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());

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
    message: 'QwikXP Messenger API v4.0',
    status: 'Running',
    features: ['Database', 'JWT Auth', 'User Management', 'Chats & Messages', 'Real-time WebSocket'],
    websocket: 'ws://qwicxp.com?token=YOUR_JWT_TOKEN',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    version: '4.0.0',
    database: 'SQLite (Prisma)',
    websocket: 'Active',
    connections: wsService.getStats(),
    timestamp: new Date().toISOString(),
    service: 'QwikXP Messenger Backend'
  });
});

// WebSocket статистика
app.get('/api/websocket/stats', authenticateToken, (req, res) => {
  res.json({
    success: true,
    stats: wsService.getStats()
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
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Пользователь с таким username или email уже существует'
      });
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 12);

    // Создание нового пользователя в базе данных
    const newUser = await prisma.user.create({
      data: {
        username,
        email: email || null,
        passwordHash,
        displayName: displayName || username
      }
    });

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

    // Поиск пользователя в базе данных
    const user = await prisma.user.findUnique({
      where: { username: username }
    });

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

    // Обновление времени последнего входа
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() }
    });

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
        createdAt: user.createdAt,
        lastSeenAt: user.lastSeenAt
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
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        lastSeenAt: true
      }
    });

    res.json({
      success: true,
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении пользователей'
    });
  }
});

app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        lastSeenAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении профиля'
    });
  }
});

// Чаты
app.post('/api/chats', authenticateToken, async (req, res) => {
  try {
    const { isGroup, title, memberIds } = req.body;

    if (!memberIds || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо указать участников чата'
      });
    }

    // Создание чата
    const chat = await prisma.chat.create({
      data: {
        isGroup: isGroup || false,
        title: title || null,
        ownerId: isGroup ? req.user.userId : null,
        members: {
          create: [
            // Добавляем создателя чата
            {
              userId: req.user.userId,
              role: isGroup ? 'owner' : 'member'
            },
            // Добавляем других участников
            ...memberIds.map(userId => ({
              userId,
              role: 'member'
            }))
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    // Отправляем WebSocket уведомление о новом чате
    await wsService.broadcastNewChat(chat.id, chat);

    res.status(201).json({
      success: true,
      message: 'Чат создан',
      chat
    });

  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при создании чата'
    });
  }
});

app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: req.user.userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true
              }
            }
          }
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении чатов'
    });
  }
});

// Сообщения
app.post('/api/chats/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'TEXT', mediaUrl, mediaMeta } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Содержание сообщения обязательно'
      });
    }

    // Проверяем, что пользователь является участником чата
    const chatMember = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: req.user.userId
        }
      }
    });

    if (!chatMember) {
      return res.status(403).json({
        success: false,
        error: 'Доступ к чату запрещен'
      });
    }

    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: req.user.userId,
        type,
        content,
        mediaUrl,
        mediaMeta
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Обновляем время последнего сообщения в чате
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    // Отправляем WebSocket уведомление о новом сообщении
    await wsService.broadcastNewMessage(chatId, message);

    res.status(201).json({
      success: true,
      message: 'Сообщение отправлено',
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при отправке сообщения'
    });
  }
});

app.get('/api/chats/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Проверяем, что пользователь является участником чата
    const chatMember = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: req.user.userId
        }
      }
    });

    if (!chatMember) {
      return res.status(403).json({
        success: false,
        error: 'Доступ к чату запрещен'
      });
    }

    // Получаем сообщения
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        deletedAt: null
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      messages: messages.reverse(),
      total: messages.length
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении сообщений'
    });
  }
});

// WebSocket эндпоинт для получения токена подключения
app.get('/api/websocket/token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    websocketUrl: `ws://qwicxp.com?token=${req.headers.authorization.split(' ')[1]}`,
    message: 'Используйте этот URL для WebSocket подключения'
  });
});

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({
    message: 'QwikXP Messenger API v4.0 работает!',
    features: ['Database', 'JWT Auth', 'User Management', 'Chats & Messages', 'Real-time WebSocket'],
    websocket: 'ws://qwicxp.com?token=YOUR_JWT_TOKEN',
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
      'GET /api/users/profile (protected)',
      'POST /api/chats (protected)',
      'GET /api/chats (protected)',
      'POST /api/chats/:chatId/messages (protected)',
      'GET /api/chats/:chatId/messages (protected)',
      'GET /api/websocket/token (protected)',
      'GET /api/websocket/stats (protected)',
      'WebSocket: ws://qwicxp.com?token=YOUR_JWT_TOKEN'
    ]
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Закрытие соединения с базой данных...');
  await prisma.$disconnect();
  console.log('✅ Соединение с базой данных закрыто');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Получен сигнал SIGTERM, закрытие соединения с базой данных...');
  await prisma.$disconnect();
  console.log('✅ Соединение с базой данных закрыто');
  process.exit(0);
});

// Предотвращаем неожиданное завершение
process.on('uncaughtException', (error) => {
  console.error('❌ Неожиданная ошибка:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанное отклонение промиса:', reason);
  process.exit(1);
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 QwikXP Messenger API v4.0');
  console.log(`📍 Running on port ${PORT}`);
  console.log(`🗄️ Database: SQLite (Prisma)`);
  console.log(`🔌 WebSocket: Active`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`🔐 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔑 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Users: GET http://localhost:${PORT}/api/users (protected)`);
  console.log(`💬 Chats: POST/GET http://localhost:${PORT}/api/chats (protected)`);
  console.log(`📝 Messages: POST/GET http://localhost:${PORT}/api/chats/:chatId/messages (protected)`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}?token=YOUR_JWT_TOKEN`);
  console.log('✅ Server is ready with Database, JWT Auth & Real-time WebSocket!');
  console.log(`🌐 Production URL: ${BASE_URL}`);
  console.log(`🔌 Production WebSocket: ws://qwicxp.com?token=YOUR_JWT_TOKEN`);
});
