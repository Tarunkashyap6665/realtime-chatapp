// server.js
require("dotenv").config({ path: ".env.local" });
const http = require("http");
const next = require("next");
const { Server: SocketIOServer } = require("socket.io");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global;

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

async function getDatabase() {
  const client = await clientPromise;
  return client.db("chatapp");
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
let io;

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = verifyToken(token);

      if (!decoded) return next(new Error("Authentication error"));

      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  const userPresence = new Map();

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.userId);

    try {
      const db = await getDatabase();
      const usersCollection = db.collection("users");

      await usersCollection.updateOne(
        { _id: new ObjectId(socket.userId) },
        {
          $set: {
            isOnline: true,
            lastActive: new Date(),
          },
        }
      );

      userPresence.set(socket.userId, { isOnline: true, lastSeen: new Date() });

      socket.broadcast.emit("presence-update", {
        userId: socket.userId,
        isOnline: true,
        lastSeen: new Date(),
      });
    } catch (error) {
      console.error("Error updating user presence:", error);
    }

    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    socket.on("leave-chat", (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    socket.on("send-message", async (data) => {
      try {
        if (!data.chatId || !data.senderName) {
          socket.emit("error", { message: "Missing required message data" });
          return;
        }

        const db = await getDatabase();

        const chatsCollection = db.collection("chats");

        const chat = await chatsCollection.findOne({
          _id: new ObjectId(data.chatId),
          participants: socket.userId,
        });

        if (!chat) {
          socket.emit("error", { message: "Chat not found or access denied" });
          return;
        }

        const message = {
          content: data.content || "",
          senderId: socket.userId,
          senderName: data.senderName,
          chatId: data.chatId,
          timestamp: new Date(),
          type: data.type || "text",
        };

        if (data.mediaUrl) {
          message.mediaUrl = data.mediaUrl;
          message.mediaName = data.mediaName;
          message.mediaSize = data.mediaSize;
          message.mediaDuration = data.mediaDuration;
          message.thumbnailUrl = data.thumbnailUrl;
        }

        let savedMessage = message;

        // Only save to database if persistent storage is enabled
        if (data.isPersistent !== false) {
          const messagesCollection = db.collection("messages");

          const result = await messagesCollection.insertOne(message);
          savedMessage = { ...message, _id: result.insertedId.toString() };

          const lastMessageContent =
            data.type && data.type !== "text"
              ? `${
                  data.type === "image"
                    ? "📷"
                    : data.type === "video"
                    ? "🎥"
                    : data.type === "audio"
                    ? "🎵"
                    : "📎"
                } ${data.mediaName || `${data.type} file`}`
              : data.content;

          await chatsCollection.updateOne(
            { _id: new ObjectId(data.chatId) },
            {
              $set: {
                lastMessage: {
                  content: lastMessageContent,
                  timestamp: new Date(),
                  senderName: data.senderName,
                  type: data.type || "text",
                },
              },
            }
          );
        } else {
          // For temporary messages, generate a temporary ID and mark as temporary
          savedMessage = {
            ...message,
            _id: `temp_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            isTemporary: true,
          };
        }
        io.to(data.chatId).emit("new-message", savedMessage);
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", (data) => {
      if (data.chatId) {
        socket.to(data.chatId).emit("user-typing", {
          userId: socket.userId,
          isTyping: data.isTyping,
          name: data.name,
        });
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.userId);
      try {
        const db = await getDatabase();
        const usersCollection = db.collection("users");

        await usersCollection.updateOne(
          { _id: new ObjectId(socket.userId) },
          {
            $set: {
              isOnline: false,
              lastActive: new Date(),
            },
          }
        );

        userPresence.set(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        socket.broadcast.emit("presence-update", {
          userId: socket.userId,
          isOnline: false,
          lastSeen: new Date(),
        });
      } catch (error) {
        console.error("Error updating user presence on disconnect:", error);
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
