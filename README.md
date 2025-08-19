# Nova Messenger API

Простой и рабочий API для Nova Messenger.

## 🚀 Быстрый запуск

```bash
# Установка зависимостей
npm install

# Запуск сервера
npm start
```

## 📍 Доступные эндпоинты

### GET /
- **Описание**: Главная страница API
- **URL**: `http://localhost:3000/`
- **Ответ**: Информация о сервере

### GET /health
- **Описание**: Проверка состояния сервера
- **URL**: `http://localhost:3000/health`
- **Ответ**: Статус сервера

### GET /api/test
- **Описание**: Тестовый эндпоинт
- **URL**: `http://localhost:3000/api/test`
- **Ответ**: Подтверждение работы API

### GET /api/users
- **Описание**: Список пользователей (демо)
- **URL**: `http://localhost:3000/api/users`
- **Ответ**: Массив пользователей

### POST /api/auth/login
- **Описание**: Аутентификация (демо)
- **URL**: `http://localhost:3000/api/auth/login`
- **Body**: `{"username": "admin", "password": "password"}`
- **Ответ**: Токен и данные пользователя

## 🧪 Тестирование

### 1. Запустите сервер
```bash
npm start
```

### 2. Откройте браузер
- **Health Check**: http://localhost:3000/health
- **Test API**: http://localhost:3000/api/test
- **Users**: http://localhost:3000/api/users

### 3. Тестируйте POST запросы
Используйте Postman или curl:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

## ✅ Демо данные

**Логин для тестирования:**
- Username: `admin`
- Password: `password`

## 🔧 Технологии

- **Node.js** - Runtime
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing

## 📁 Структура проекта

```
nova_api/
├── index.js          # Основной файл сервера
├── package.json      # Зависимости и скрипты
└── README.md         # Документация
```
