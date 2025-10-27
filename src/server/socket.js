const { Server } = require("socket.io");

const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || "*";

const io = new Server(PORT, {
  cors: { origin: FRONTEND_URL },
});

// Track users in rooms
const rooms = new Map();
const users = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a chat room
  socket.on("join-room", ({ roomId, username }) => {
    try {
      // Leave previous room if any
      if (users.has(socket.id)) {
        const previousRoom = users.get(socket.id).roomId;
        socket.leave(previousRoom);
        
        // Remove from previous room
        if (rooms.has(previousRoom)) {
          rooms.get(previousRoom).delete(socket.id);
          if (rooms.get(previousRoom).size === 0) {
            rooms.delete(previousRoom);
          } else {
            // Notify others in previous room
            socket.to(previousRoom).emit("user-left", {
              userId: socket.id,
              username: users.get(socket.id).username
            });
          }
        }
      }

      // Join new room
      socket.join(roomId);
      
      // Track user
      users.set(socket.id, { roomId, username });
      
      // Track room
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      rooms.get(roomId).set(socket.id, username);
      
      console.log(`${username} joined room ${roomId}`);
      
      // Send room info to the joining user
      const roomUsers = Array.from(rooms.get(roomId).entries()).map(([id, name]) => ({
        id,
        username: name
      }));
      
      socket.emit("room-joined", {
        roomId,
        users: roomUsers,
        message: `Welcome to room ${roomId}!`
      });
      
      // Notify others in the room
      socket.to(roomId).emit("user-joined", {
        userId: socket.id,
        username,
        message: `${username} joined the room`
      });
      
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // Send a message to the room
  socket.on("send-message", ({ roomId, message }) => {
    try {
      const user = users.get(socket.id);
      if (!user || user.roomId !== roomId) {
        socket.emit("error", { message: "You are not in this room" });
        return;
      }

      const messageData = {
        id: Date.now().toString(),
        userId: socket.id,
        username: user.username,
        message,
        timestamp: new Date().toISOString()
      };

      // Send to all users in the room
      io.to(roomId).emit("new-message", messageData);
      
      console.log(`Message in room ${roomId} from ${user.username}: ${message}`);
      
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Get room info
  socket.on("get-room-info", (roomId) => {
    try {
      if (rooms.has(roomId)) {
        const roomUsers = Array.from(rooms.get(roomId).entries()).map(([id, name]) => ({
          id,
          username: name
        }));
        socket.emit("room-info", { roomId, users: roomUsers });
      } else {
        socket.emit("room-info", { roomId, users: [] });
      }
    } catch (error) {
      console.error("Error getting room info:", error);
    }
  });

  // Leave room
  socket.on("leave-room", () => {
    try {
      const user = users.get(socket.id);
      if (user) {
        const roomId = user.roomId;
        socket.leave(roomId);
        
        // Remove from room tracking
        if (rooms.has(roomId)) {
          rooms.get(roomId).delete(socket.id);
          if (rooms.get(roomId).size === 0) {
            rooms.delete(roomId);
          } else {
            // Notify others
            socket.to(roomId).emit("user-left", {
              userId: socket.id,
              username: user.username,
              message: `${user.username} left the room`
            });
          }
        }
        
        // Remove user tracking
        users.delete(socket.id);
        
        console.log(`${user.username} left room ${roomId}`);
        socket.emit("room-left", { message: "You left the room" });
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    try {
      const user = users.get(socket.id);
      if (user) {
        const roomId = user.roomId;
        
        // Remove from room tracking
        if (rooms.has(roomId)) {
          rooms.get(roomId).delete(socket.id);
          if (rooms.get(roomId).size === 0) {
            rooms.delete(roomId);
          } else {
            // Notify others
            socket.to(roomId).emit("user-left", {
              userId: socket.id,
              username: user.username,
              message: `${user.username} disconnected`
            });
          }
        }
        
        // Remove user tracking
        users.delete(socket.id);
        
        console.log(`${user.username} disconnected from room ${roomId}`);
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
});

// Log room status periodically
setInterval(() => {
  console.log("Active rooms:", Array.from(rooms.entries()).map(([roomId, users]) => ({
    roomId,
    userCount: users.size,
    users: Array.from(users.values())
  })));
}, 30000); // Log every 30 seconds

console.log("=================================");
console.log("🚀 Socket.IO Server Running");
console.log(`📍 Port: ${PORT}`);
console.log(`🌐 CORS: ${FRONTEND_URL}`);
console.log("================================="); 