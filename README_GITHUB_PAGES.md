# 🚀 QwikXP Messenger - GitHub Pages

## 📋 Что это?

Это веб-страница для демонстрации API QwikXP Messenger, размещенная на GitHub Pages.

## 🌐 Как разместить на GitHub Pages:

### 1. **Переименуйте файлы:**
- `index.html` → оставьте как есть (главная страница)
- `websocket-test.html` → можно переименовать в `test.html`

### 2. **Настройте GitHub Pages:**
1. Перейдите в ваш репозиторий: `https://github.com/DenysBorshchov/qwikXP`
2. Нажмите **Settings** (Настройки)
3. Прокрутите вниз до **GitHub Pages**
4. В **Source** выберите **Deploy from a branch**
5. В **Branch** выберите **main** или **master**
6. Нажмите **Save**

### 3. **Ваш сайт будет доступен по адресу:**
```
https://denysborshchov.github.io/qwikXP/
```

## 📁 Структура файлов для GitHub Pages:

```
nova_api/
├── index.html              # Главная страница (GitHub Pages)
├── test.html               # Тест WebSocket (переименованный)
├── websocket-service.js    # WebSocket сервис
├── package.json            # Зависимости
├── README.md               # Документация API
├── README_GITHUB_PAGES.md  # Этот файл
└── .gitignore             # Git исключения
```

## 🔧 Важные моменты:

1. **GitHub Pages поддерживает только статические файлы**
2. **Node.js сервер НЕ будет работать на GitHub Pages**
3. **WebSocket тестирование будет работать только локально**
4. **API эндпоинты будут доступны только при локальном запуске сервера**

## 🚀 Для полной функциональности:

1. **Локально**: запустите `node index.js` для работы API
2. **Онлайн**: используйте GitHub Pages для демонстрации
3. **Продакшен**: разверните сервер на хостинге (Heroku, DigitalOcean, AWS)

## 📱 Что покажет GitHub Pages:

- ✅ Красивую главную страницу
- ✅ Описание функций API
- ✅ Список эндпоинтов
- ✅ Ссылки на GitHub
- ❌ Работающий API (только локально)
- ❌ WebSocket (только локально)

## 🔗 Полезные ссылки:

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [QwikXP GitHub Repository](https://github.com/DenysBorshchov/qwikXP)
- [Node.js Deployment Guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
