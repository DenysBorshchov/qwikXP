const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = 'qwikxp_secret_key_2024';

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // userId -> WebSocket
    this.userChats = new Map(); // userId -> Set of chatIds
    
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('🔌 Новое WebSocket соединение');
      
      // Аутентификация через query параметр token
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Токен не предоставлен');
        return;
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        
        // Сохраняем соединение
        this.clients.set(userId, ws);
        
        // Загружаем чаты пользователя
        this.loadUserChats(userId);
        
        console.log(`✅ Пользователь ${decoded.username} подключен (ID: ${userId})`);
        
        // Отправляем подтверждение подключения
        ws.send(JSON.stringify({
          type: 'connection_established',
          userId: userId,
          timestamp: new Date().toISOString()
        }));

        // Обработка сообщений
        ws.on('message', async (data) => {
          try {
            const message = JSON.parse(data.toString());
            await this.handleMessage(userId, message);
          } catch (error) {
            console.error('Ошибка обработки сообщения:', error);
            ws.send(JSON.stringify({
              type: 'error',
              error: 'Ошибка обработки сообщения',
              timestamp: new Date().toISOString()
            }));
          }
        });

        // Обработка отключения
        ws.on('close', () => {
          console.log(`🔌 Пользователь ${decoded.username} отключен (ID: ${userId})`);
          this.clients.delete(userId);
          this.userChats.delete(userId);
        });

        ws.on('error', (error) => {
          console.error(`WebSocket ошибка для пользователя ${userId}:`, error);
          this.clients.delete(userId);
          this.userChats.delete(userId);
        });

      } catch (error) {
        console.error('Ошибка аутентификации WebSocket:', error);
        ws.close(1008, 'Недействительный токен');
      }
    });
  }

  async loadUserChats(userId) {
    try {
      const chats = await prisma.chat.findMany({
        where: {
          members: {
            some: { userId: userId }
          }
        },
        select: { id: true }
      });
      
      const chatIds = new Set(chats.map(chat => chat.id));
      this.userChats.set(userId, chatIds);
      
      console.log(`📱 Загружено ${chatIds.size} чатов для пользователя ${userId}`);
    } catch (error) {
      console.error('Ошибка загрузки чатов пользователя:', error);
    }
  }

  async handleMessage(userId, message) {
    const { type, data } = message;
    
    switch (type) {
      case 'typing_start':
        await this.handleTypingStart(userId, data);
        break;
        
      case 'typing_stop':
        await this.handleTypingStop(userId, data);
        break;
        
      case 'message_read':
        await this.handleMessageRead(userId, data);
        break;
        
      case 'user_status':
        await this.handleUserStatus(userId, data);
        break;
        
      default:
        console.log(`Неизвестный тип сообщения: ${type}`);
    }
  }

  async handleTypingStart(userId, data) {
    const { chatId } = data;
    
    // Проверяем, что пользователь является участником чата
    const chatMember = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId: chatId,
          userId: userId
        }
      }
    });

    if (!chatMember) {
      return;
    }

    // Отправляем уведомление о печати всем участникам чата
    await this.broadcastToChat(chatId, {
      type: 'typing_start',
      userId: userId,
      chatId: chatId,
      timestamp: new Date().toISOString()
    });
  }

  async handleTypingStop(userId, data) {
    const { chatId } = data;
    
    // Отправляем уведомление об остановке печати
    await this.broadcastToChat(chatId, {
      type: 'typing_stop',
      userId: userId,
      chatId: chatId,
      timestamp: new Date().toISOString()
    });
  }

  async handleMessageRead(userId, data) {
    const { messageId, chatId } = data;
    
    try {
      // Обновляем статус сообщения
      await prisma.messageReceipt.upsert({
        where: {
          messageId_userId: {
            messageId: messageId,
            userId: userId
          }
        },
        update: {
          status: 'READ',
          updatedAt: new Date()
        },
        create: {
          messageId: messageId,
          userId: userId,
          status: 'READ'
        }
      });

      // Отправляем уведомление о прочтении
      await this.broadcastToChat(chatId, {
        type: 'message_read',
        messageId: messageId,
        userId: userId,
        chatId: chatId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Ошибка обновления статуса сообщения:', error);
    }
  }

  async handleUserStatus(userId, data) {
    const { status } = data; // online, offline, away
    
    try {
      // Обновляем статус пользователя
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt: new Date() }
      });

      // Отправляем статус всем пользователям, с которыми есть общие чаты
      const userChats = this.userChats.get(userId) || new Set();
      
      for (const chatId of userChats) {
        await this.broadcastToChat(chatId, {
          type: 'user_status',
          userId: userId,
          status: status,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Ошибка обновления статуса пользователя:', error);
    }
  }

  async broadcastToChat(chatId, message) {
    try {
      // Получаем всех участников чата
      const chatMembers = await prisma.chatMember.findMany({
        where: { chatId: chatId },
        select: { userId: true }
      });

      // Отправляем сообщение всем участникам
      for (const member of chatMembers) {
        const client = this.clients.get(member.userId);
        if (client && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      }

    } catch (error) {
      console.error('Ошибка отправки сообщения в чат:', error);
    }
  }

  // Метод для отправки нового сообщения всем участникам чата
  async broadcastNewMessage(chatId, messageData) {
    await this.broadcastToChat(chatId, {
      type: 'new_message',
      data: messageData,
      timestamp: new Date().toISOString()
    });
  }

  // Метод для отправки уведомления о новом чате
  async broadcastNewChat(chatId, chatData) {
    await this.broadcastToChat(chatId, {
      type: 'new_chat',
      data: chatData,
      timestamp: new Date().toISOString()
    });
  }

  // Метод для отправки уведомления о добавлении пользователя в чат
  async broadcastUserAddedToChat(chatId, userId, addedBy) {
    await this.broadcastToChat(chatId, {
      type: 'user_added',
      chatId: chatId,
      userId: userId,
      addedBy: addedBy,
      timestamp: new Date().toISOString()
    });
  }

  // Получение статистики подключений
  getStats() {
    return {
      totalConnections: this.clients.size,
      connectedUsers: Array.from(this.clients.keys()),
      totalChats: this.userChats.size
    };
  }
}

module.exports = WebSocketService;
