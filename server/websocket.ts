import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

export function createWebSocketServer(app: any): Server {
  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected clients
  const clients = new Set<WebSocketClient>();

  // Broadcast function
  function broadcast(message: any, excludeClient?: WebSocketClient) {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // WebSocket connection handler
  wss.on('connection', (ws: WebSocketClient) => {
    clients.add(ws);
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join':
            ws.userId = message.userId;
            if (message.userId) {
              await storage.updateUserStatus(message.userId, 'online');
              broadcast({ type: 'user_status', userId: message.userId, status: 'online' }, ws);
            }
            break;
            
          case 'send_message':
            if (message.userId && message.conversationId && message.content) {
              const newMessage = await storage.createMessage({
                userId: message.userId,
                conversationId: message.conversationId,
                content: message.content,
                type: 'text'
              });
              
              const user = await storage.getUser(message.userId);
              broadcast({
                type: 'new_message',
                message: newMessage,
                user: user
              });
            }
            break;
            
          case 'typing':
            broadcast({
              type: 'user_typing',
              userId: message.userId,
              conversationId: message.conversationId,
              isTyping: message.isTyping
            }, ws);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      clients.delete(ws);
      if (ws.userId) {
        await storage.updateUserStatus(ws.userId, 'offline');
        broadcast({ type: 'user_status', userId: ws.userId, status: 'offline' });
      }
    });
  });

  // Heartbeat to keep connections alive
  const interval = setInterval(() => {
    clients.forEach((ws) => {
      if (ws.isAlive === false) {
        clients.delete(ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return httpServer;
}

// Export broadcast function for use in controllers
export function getBroadcastFunction() {
  // This would need to be implemented to share the broadcast function
  // For now, we'll handle broadcasting in the controllers directly
  return null;
}
