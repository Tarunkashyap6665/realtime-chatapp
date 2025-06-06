const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 3001;

let db;

async function connectToDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db("chatapp");
  return db;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

async function startServer() {
  await connectToDatabase();

  const httpServer = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Socket.IO server is running");
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket.IO middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = verifyToken(token);

      if (!decoded) {
        return next(new Error("Authentication error"));
      }

      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    socket.on("leave-chat", (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    socket.on("send-message", async (data) => {
      console.log("Send message:", data);
      try {
        const messagesCollection = db.collection("messages");
        const chatsCollection = db.collection("chats");

        const message = {
          content: data.content,
          senderId: socket.userId,
          senderName: data.senderName,
          chatId: data.chatId,
          timestamp: new Date(),
          type: "text",
        };

        const result = await messagesCollection.insertOne(message);
        const savedMessage = { ...message, _id: result.insertedId.toString() };

        // Update chat's last message
        await chatsCollection.updateOne(
          { _id: new ObjectId(data.chatId) },
          {
            $set: {
              lastMessage: {
                content: data.content,
                timestamp: new Date(),
                senderName: data.senderName,
              },
            },
          }
        );

        // Emit to all users in the chat
        io.to(data.chatId).emit("new-message", savedMessage);
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", (data) => {
      socket.to(data.chatId).emit("user-typing", {
        userId: socket.userId,
        isTyping: data.isTyping,
        name: data.name,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Server running at port ${port}`);
  });
}

startServer().catch(console.error);
