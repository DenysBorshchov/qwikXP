# Nova Messenger API v2.0

Современный и безопасный backend для мессенджера Nova с JWT аутентификацией.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск сервера
npm start
```

Сервер запустится на `http://localhost:3000`

## ✨ Новые функции v2.0

- **🔐 JWT Аутентификация** - безопасные токены доступа
- **🔒 Хеширование паролей** - bcrypt для защиты
- **👥 Управление пользователями** - регистрация, вход, профили
- **🛡️ Защищенные маршруты** - middleware для проверки токенов
- **📱 RESTful API** - современная архитектура

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

### 5. Доступ к защищенному маршруту
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users
```

## 📁 Структура проекта

```
nova_api/
├── index.js          # Основной сервер
├── package.json      # Зависимости
├── README.md         # Документация
└── .gitignore        # Git исключения
```

## 🔧 Технологии

- **Node.js** - серверная платформа
- **Express.js** - веб-фреймворк
- **JWT** - JSON Web Tokens для аутентификации
- **bcryptjs** - хеширование паролей
- **CORS** - кросс-доменные запросы

## 🚀 Следующие шаги

- [ ] База данных (SQLite/PostgreSQL)
- [ ] WebSocket для чатов
- [ ] Загрузка файлов
- [ ] Push уведомления
- [ ] E2EE шифрование

## 📝 Лицензия

MIT License
