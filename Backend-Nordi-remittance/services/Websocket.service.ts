import { Server as HttpServer } from "http";
import { Socket, Server as SocketIOServer } from "socket.io";

// interface SocketEvents {
//   connection: (socket: Socket) => void;
//   disconnect: (reason: string) => void;
//   error: (error: Error) => void;
//   [key: string]: (...args: any[]) => void;
// }

class SocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Socket> = new Map();

  constructor(httpServer: HttpServer, corsOrigin: string | string[] = "*") {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ["websocket", "polling"],
    });

    this.setupConnection();
  }

  private setupConnection(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`✅ Connected: ${socket.id}`);
      this.connectedUsers.set(socket.id, socket);

      socket.on("disconnect", (reason: string) => {
        console.log(`❌ Disconnected: ${socket.id} - ${reason}`);
        this.connectedUsers.delete(socket.id);
      });

      socket.on("error", (error: Error) => {
        console.error(`🔥 Socket error ${socket.id}:`, error);
      });

      this.registerEvents(socket);
    });
  }

  private registerEvents(socket: Socket): void {
    socket.on("join_room", (room: string) => {
      socket.join(room);
      socket.emit("joined_room", { room, socketId: socket.id });
    });

    socket.on("leave_room", (room: string) => {
      socket.leave(room);
      socket.emit("left_room", { room, socketId: socket.id });
    });

    socket.on("send_message", (data: { room?: string; message: any }) => {
      const payload = {
        ...data,
        socketId: socket.id,
        timestamp: Date.now(),
      };

      if (data.room) {
        this.io.to(data.room).emit("new_message", payload);
      } else {
        this.io.emit("new_message", payload);
      }
    });
  }

  // Public API methods
  public emitToSocket(socketId: string, event: string, data: any): boolean {
    const socket = this.connectedUsers.get(socketId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }

  public emitToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }

  public broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  public getConnectedCount(): number {
    return this.connectedUsers.size;
  }

  public isConnected(socketId: string): boolean {
    return this.connectedUsers.has(socketId);
  }

  public disconnectSocket(socketId: string): void {
    const socket = this.connectedUsers.get(socketId);
    if (socket) {
      socket.disconnect(true);
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  // Emit to user by userId (user joins a room with their userId)
  public emitToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Register custom events
  public onEvent(event: string, handler: (socket: Socket, ...args: any[]) => void): void {
    this.io.on("connection", (socket: Socket) => {
      socket.on(event, (...args: any[]) => handler(socket, ...args));
    });
  }
}

let socketManagerInstance: SocketManager | undefined;

export const createSocketManager = (httpServer: HttpServer, corsOrigin?: string | string[]): SocketManager => {
  socketManagerInstance = new SocketManager(httpServer, corsOrigin);
  return socketManagerInstance;
};

export const getSocketManager = (): SocketManager | undefined => socketManagerInstance;

// Initialize WebSocket with authentication and user room joining
export const initializeWebSocket = (httpServer: HttpServer, corsOrigin?: string | string[]): SocketManager => {
  const manager = createSocketManager(httpServer, corsOrigin);
  
  const io = manager.getIO();
  
  // Add authentication middleware
  io.use((socket, next) => {
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
    if (userId) {
      (socket as any).userId = userId;
    }
    next();
  });
  
  // Handle user room joining on connection
  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId;
    
    if (userId) {
      // Join user's personal room
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
      
      socket.on("disconnect", () => {
        socket.leave(`user:${userId}`);
      });
    }
    
    // Handle manual room joining (for authenticated users)
    socket.on("authenticate", (data: { userId: string }) => {
      if (data.userId) {
        (socket as any).userId = data.userId;
        socket.join(`user:${data.userId}`);
        socket.emit("authenticated", { success: true });
      }
    });
  });
  
  return manager;
};

// Helper function to emit to a specific user
export const emitToUser = (userId: string, event: string, data: any): void => {
  const manager = getSocketManager();
  if (manager) {
    manager.emitToUser(userId, event, data);
  }
};

// Helper function to broadcast to all connected clients
export const broadcast = (event: string, data: any): void => {
  const manager = getSocketManager();
  if (manager) {
    manager.broadcast(event, data);
  }
};

// Helper function to emit to a room
export const emitToRoom = (room: string, event: string, data: any): void => {
  const manager = getSocketManager();
  if (manager) {
    manager.emitToRoom(room, event, data);
  }
};

export { SocketManager };

