# QwikXP Messenger API v3.0

Современный и безопасный backend для мессенджера QwikXP с базой данных SQLite и JWT аутентификацией.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Создание базы данных
npx prisma migrate dev

# Запуск сервера
npm start
```

Сервер запустится на `http://localhost:3000`

## ✨ Функции v3.0

- **🗄️ SQLite База данных** - Prisma ORM для надежного хранения
- **🔐 JWT Аутентификация** - безопасные токены доступа
- **🔒 Хеширование паролей** - bcrypt для защиты
- **👥 Управление пользователями** - регистрация, вход, профили
- **💬 Чаты и сообщения** - создание чатов, отправка сообщений
- **🛡️ Защищенные маршруты** - middleware для проверки токенов
- **📱 RESTful API** - современная архитектура

## 🗄️ База данных

### Модели данных:
- **User** - пользователи системы
- **Chat** - чаты (личные и групповые)
- **ChatMember** - участники чатов
- **Message** - сообщения в чатах
- **MessageReceipt** - статусы доставки сообщений
- **Device** - устройства пользователей

### Миграции:
```bash
# Создание миграции
npx prisma migrate dev --name migration_name

# Просмотр базы данных
npx prisma studio
```

## 🔗 Доступные эндпоинты

### Публичные маршруты
- `GET /` - информация об API
- `GET /health` - статус сервера
- `GET /api/test` - тестовый маршрут
- `POST /api/auth/register` - регистрация пользователя
- `POST /api/auth/login` - вход в систему

### Защищенные маршруты (требуют JWT токен)
- `GET /api/users` - список всех пользователей
- `GET /api/users/profile` - профиль текущего пользователя
- `POST /api/chats` - создание нового чата
- `GET /api/chats` - список чатов пользователя
- `POST /api/chats/:chatId/messages` - отправка сообщения
- `GET /api/chats/:chatId/messages` - получение сообщений чата

## 🔐 Аутентификация

### Регистрация
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "Новый пользователь"
}
```

### Вход
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "newuser",
  "password": "securepassword"
}
```

### Использование токена
```bash
GET /api/users
Authorization: Bearer YOUR_JWT_TOKEN
```

## 💬 Чаты и сообщения

### Создание чата
```bash
POST /api/chats
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "isGroup": false,
  "memberIds": ["user_id_1", "user_id_2"]
}
```

### Отправка сообщения
```bash
POST /api/chats/CHAT_ID/messages
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "content": "Привет!",
  "type": "TEXT"
}
```

## 🧪 Тестирование

### 1. Проверка здоровья сервера
```bash
curl http://localhost:3000/health
```

### 2. Тест API
```bash
curl http://localhost:3000/api/test
```

### 3. Регистрация пользователя
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass","displayName":"Тест"}'
```

### 4. Вход в систему
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### 5. Создание чата
```bash
curl -X POST http://localhost:3000/api/chats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isGroup":false,"memberIds":["other_user_id"]}'
```

## 📁 Структура проекта

```
nova_api/
├── index.js              # Основной сервер
├── package.json          # Зависимости
├── README.md             # Документация
├── .gitignore            # Git исключения
├── prisma/
│   ├── schema.prisma     # Схема базы данных
│   └── migrations/       # Миграции БД
└── qwikxp.db            # SQLite база данных
```

## 🔧 Технологии

- **Node.js** - серверная платформа
- **Express.js** - веб-фреймворк
- **Prisma** - ORM для базы данных
- **SQLite** - встроенная база данных
- **JWT** - JSON Web Tokens для аутентификации
- **bcryptjs** - хеширование паролей
- **CORS** - кросс-доменные запросы

## 🚀 Следующие шаги

- [x] База данных (SQLite + Prisma)
- [ ] WebSocket для чатов в реальном времени
- [ ] Загрузка файлов и медиа
- [ ] Push уведомления (FCM)
- [ ] E2EE шифрование
- [ ] Групповые чаты и роли

## 📝 Лицензия

MIT License
