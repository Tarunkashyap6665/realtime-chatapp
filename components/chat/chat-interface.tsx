"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import ChatList from "@/components/chat/chat-list";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import CreateChatDialog from "@/components/chat/create-chat-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, MessageCircle, Users } from "lucide-react";
import type { Chat, Message } from "@/lib/models";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
}

type UserIdToUsernameMap = {
  [id: string]: string;
};

export default function ChatApp({
  user,
  token,
}: {
  user: User;
  token: string;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [typingUserName, setTypingUserName] = useState<UserIdToUsernameMap>({});

  const [showCreateChat, setShowCreateChat] = useState(false);
  const router = useRouter();

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (user && token) {
      initializeSocket();
      loadChats();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, token]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId && token) {
      loadMessages(selectedChatId);
      if (socket) {
        socket.emit("join-chat", selectedChatId);
      }
    }
  }, [selectedChatId, socket]);

  const initializeSocket = () => {
    // Initialize Socket.IO server

    const newSocket = io({
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);

      // Update chat's last message
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === message.chatId
            ? {
                ...chat,
                lastMessage: {
                  content: message.content,
                  timestamp: message.timestamp,
                  senderName: message.senderName,
                },
              }
            : chat
        )
      );
    });

    newSocket.on("user-typing", ({ userId, isTyping, name }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        let new_user: UserIdToUsernameMap = {};
        if (isTyping) {
          newSet.add(userId);
          if (new_user) {
            new_user[userId] = name;
          }
        } else {
          newSet.delete(userId);
          if (typingUserName) {
            delete new_user[userId];
          }
        }
        setTypingUserName(new_user);
        return newSet;
      });
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);
  };

  const loadChats = async () => {
    try {
      const response = await fetch("/api/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    setSocket(null);
    setChats([]);
    setMessages([]);
    setSelectedChatId(null);
    localStorage.removeItem("chatapp_token");
    router.push("/login");
  };

  const handleSendMessage = (content: string) => {
    if (socket && selectedChatId && user) {
      socket.emit("send-message", {
        chatId: selectedChatId,
        content,
        senderName: user.name,
      });
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socket && selectedChatId) {
      socket.emit("typing", {
        chatId: selectedChatId,
        isTyping,
        name: user?.name,
      });
    }
  };

  const handleCreateChat = async (
    name: string,
    type: "personal" | "group",
    participants: string[]
  ) => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, type, participants }),
      });

      if (response.ok) {
        const data = await response.json();
        setChats((prev) => [data.chat, ...prev]);
        setSelectedChatId(data.chat._id);
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const selectedChat = chats.find((chat) => chat._id === selectedChatId);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">
                    ChatApp
                  </span>
                  <p className="text-sm text-gray-600">{user.name}</p>
                </div>
              </motion.div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-hidden">
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            onCreateChat={() => setShowCreateChat(true)}
            token={token}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-3">
                {selectedChat.type === "group" ? (
                  <Users className="w-6 h-6 text-gray-500" />
                ) : (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {selectedChat.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="font-semibold">{selectedChat.name}</h2>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        selectedChat.type === "group" ? "default" : "secondary"
                      }
                    >
                      {selectedChat.type}
                    </Badge>
                    {typingUsers.size > 0 && (
                      <span className="text-xs text-gray-500">
                        {typingUsers.size === 1
                          ? `${(() => {
                              const typingUserId = typingUsers
                                .values()
                                .next().value;
                              return typingUserId &&
                                typingUserName &&
                                typingUserName[typingUserId]
                                ? typingUserName[typingUserId]
                                : "Someone";
                            })()} is typing...`
                          : `${typingUsers.size} people are typing...`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <MessageList messages={messages} currentUserId={user.id} />

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <CardTitle className="text-gray-600">
                  Select a chat to start messaging
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  className="bg-green-600"
                  onClick={() => setShowCreateChat(true)}
                >
                  Start New Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Chat Dialog */}
      <CreateChatDialog
        open={showCreateChat}
        onClose={() => setShowCreateChat(false)}
        onCreateChat={handleCreateChat}
        token={token}
        currentUserId={user.id}
      />
    </div>
  );
}
