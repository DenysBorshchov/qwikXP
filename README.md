# QwikXP Messenger API v4.0

Современный и безопасный backend для мессенджера QwikXP с базой данных SQLite, JWT аутентификацией и WebSocket для чатов в реальном времени.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Создание базы данных
npx prisma migrate dev

# Запуск сервера
npm start
```

       Сервер запустится на `http://localhost:3000` (локально) или `http://qwicxp.com` (продакшен)

## ✨ Функции v4.0

- **🗄️ SQLite База данных** - Prisma ORM для надежного хранения
- **🔐 JWT Аутентификация** - безопасные токены доступа
- **🔒 Хеширование паролей** - bcrypt для защиты
- **👥 Управление пользователями** - регистрация, вход, профили
- **💬 Чаты и сообщения** - создание чатов, отправка сообщений
- **🔌 WebSocket в реальном времени** - мгновенные уведомления
- **⌨️ Индикаторы печати** - "пользователь печатает..."
- **📱 Статусы пользователей** - онлайн/оффлайн
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

## 🔌 WebSocket в реальном времени

       ### Подключение:
       ```
       ws://qwicxp.com?token=YOUR_JWT_TOKEN
       ```

### Типы сообщений:

#### От клиента к серверу:
- `typing_start` - начало печати
- `typing_stop` - остановка печати
- `message_read` - сообщение прочитано
- `user_status` - обновление статуса

#### От сервера к клиенту:
- `connection_established` - подтверждение подключения
- `new_message` - новое сообщение в чате
- `typing_start` - пользователь начал печатать
- `typing_stop` - пользователь остановил печатать
- `message_read` - сообщение прочитано
- `user_status` - изменение статуса пользователя
- `new_chat` - создан новый чат
- `user_added` - пользователь добавлен в чат

### Тестирование WebSocket:
Откройте `websocket-test.html` в браузере для тестирования WebSocket функций.

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
- `GET /api/websocket/token` - получение WebSocket URL
- `GET /api/websocket/stats` - статистика WebSocket подключений

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

## 🔌 WebSocket API

### Получение WebSocket URL
```bash
GET /api/websocket/token
Authorization: Bearer YOUR_JWT_TOKEN
```

### Статистика подключений
```bash
GET /api/websocket/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Тестирование

### 1. Проверка здоровья сервера
```bash
       curl http://qwicxp.com/health
```

### 2. Тест API
```bash
       curl http://qwicxp.com/api/test
```

### 3. Регистрация пользователя
```bash
       curl -X POST http://qwicxp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass","displayName":"Тест"}'
```

### 4. Вход в систему
```bash
       curl -X POST http://qwicxp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### 5. Создание чата
```bash
       curl -X POST http://qwicxp.com/api/chats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isGroup":false,"memberIds":["other_user_id"]}'
```

### 6. WebSocket тестирование
Откройте `websocket-test.html` в браузере и следуйте инструкциям.

## 📁 Структура проекта

```
nova_api/
├── index.js              # Основной сервер
├── websocket-service.js  # WebSocket сервис
├── websocket-test.html   # Тест WebSocket
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
- **WebSocket (ws)** - соединения в реальном времени
- **JWT** - JSON Web Tokens для аутентификации
- **bcryptjs** - хеширование паролей
- **CORS** - кросс-доменные запросы

## 🚀 Следующие шаги

- [x] База данных (SQLite + Prisma) ✅
- [x] WebSocket для чатов в реальном времени ✅
- [ ] Загрузка файлов и медиа
- [ ] Push уведомления (FCM)
- [ ] E2EE шифрование
- [ ] Групповые чаты и роли

## 📝 Лицензия

MIT License
