"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import ChatList from "@/components/chat/chat-list";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import CreateChatDialog from "@/components/chat/create-chat-dialog";
import AddParticipantsDialog from "@/components/chat/add-participants-dialog";
import GroupInfoDialog from "@/components/chat/group-info-dialog";
import StorageToggle from "@/components/chat/storage-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LogOut,
  MessageCircle,
  Users,
  Menu,
  X,
  Info,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Chat, Message } from "@/lib/models";
import { useSocket } from "@/hooks/use-socket";
import { useStorage } from "@/contexts/storage-context";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
interface User {
  id: string;
  email: string;
  name: string;
}

interface ChatInterfaceProps {
  user: User;
  token: string;
}

type UserIdToUsernameMap = {
  [id: string]: string;
};

export default function ChatInterface({ user, token }: ChatInterfaceProps) {
  const router = useRouter();
  const { socket, connected, error: socketError } = useSocket(token);
  const {
    isPersistent,
    temporaryMessages,
    addTemporaryMessage,
    clearTemporaryMessages,
    getTemporaryMessages,
    messageIds,
    addMessageId,
    hasMessageId,
  } = useStorage();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [persistentMessages, setPersistentMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSelectedChatId, setLastSelectedChatId] = useState<string | null>(
    null
  );
  const [typingUserName, setTypingUserName] = useState<UserIdToUsernameMap>({});
  // Load chats when user is authenticated
  useEffect(() => {
    if (user && token) {
      loadChats();
    }
  }, [user, token]);

  // Clear temporary messages when switching chats
  useEffect(() => {
    if (
      lastSelectedChatId &&
      lastSelectedChatId !== selectedChatId &&
      !isPersistent
    ) {
      clearTemporaryMessages(lastSelectedChatId);
    }
    setLastSelectedChatId(selectedChatId);
  }, [
    selectedChatId,
    lastSelectedChatId,
    isPersistent,
    clearTemporaryMessages,
  ]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = (message: Message) => {
      // Check if we already have this message to prevent duplicates
      if (message._id && hasMessageId(message._id)) {
        return;
      }

      // Add message ID to our tracking set
      if (message._id) {
        addMessageId(message._id);
      }

      if (message.isTemporary) {
        // Handle temporary message
        addTemporaryMessage(message.chatId, message);
      } else {
        // Handle persistent message
        setPersistentMessages((prev) => [...prev, message]);

        // Update chat's last message only for persistent messages
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === message.chatId
              ? {
                  ...chat,
                  lastMessage: {
                    content: message.content,
                    timestamp: message.timestamp,
                    senderName: message.senderName,
                    type: message.type,
                  },
                }
              : chat
          )
        );
      }
    };

    const handleUserTyping = ({
      userId,
      isTyping,
      name,
    }: {
      userId: string;
      isTyping: boolean;
      name: string;
    }) => {
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
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setPersistentMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                content: "This message was deleted",
                type: "system" as const,
              }
            : msg
        )
      );
    };

    const handleChatDeleted = ({ chatId }: { chatId: string }) => {
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        setPersistentMessages([]);
      }
      clearTemporaryMessages(chatId);
    };

    const handleChatUpdated = ({ chat }: { chat: Chat }) => {
      setChats((prev) => prev.map((c) => (c._id === chat._id ? chat : c)));
    };

    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("chat-deleted", handleChatDeleted);
    socket.on("chat-updated", handleChatUpdated);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("chat-deleted", handleChatDeleted);
      socket.off("chat-updated", handleChatUpdated);
    };
  }, [
    socket,
    connected,
    selectedChatId,
    isPersistent,
    addTemporaryMessage,
    clearTemporaryMessages,
    addMessageId,
    hasMessageId,
  ]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId && token) {
      // Always load persistent messages from the database
      loadMessages(selectedChatId);

      if (socket) {
        socket.emit("join-chat", selectedChatId);
      }
    } else {
      // Clear persistent messages when no chat is selected
      setPersistentMessages([]);
    }
  }, [selectedChatId, token, socket]);

  // Combine persistent and temporary messages
  const combinedMessages = useMemo(() => {
    if (!selectedChatId) return [];

    const tempMessages = getTemporaryMessages(selectedChatId);

    // Combine persistent and temporary messages
    const combined = [...persistentMessages, ...tempMessages];

    // Sort by timestamp
    return combined.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [persistentMessages, selectedChatId, getTemporaryMessages]);

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

        // Add all message IDs to our tracking set to prevent duplicates
        data.messages.forEach((msg: Message) => {
          if (msg._id) {
            addMessageId(msg._id);
          }
        });

        setPersistentMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    clearTemporaryMessages();
    localStorage.removeItem("chatapp_token");
    router.push("/");
  };

  const handleSendMessage = useCallback(
    (content: string, mediaData?: any) => {
      if (socket && selectedChatId && user && connected) {
        const messageData: any = {
          chatId: selectedChatId,
          content,
          senderName: user.name,
          isPersistent: isPersistent,
        };

        // Add media data if present
        if (mediaData) {
          messageData.type = mediaData.type;
          messageData.mediaUrl = mediaData.url;
          messageData.mediaName = mediaData.name;
          messageData.mediaSize = mediaData.size;
          messageData.fileId = mediaData.fileId;
          if (mediaData.duration)
            messageData.mediaDuration = mediaData.duration;
          if (mediaData.thumbnail)
            messageData.thumbnailUrl = mediaData.thumbnail;
        }

        socket.emit("send-message", messageData);
      } else {
        setError("Cannot send message. Please check your connection.");
      }
    },
    [socket, selectedChatId, user, connected, isPersistent, setError]
  );

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (socket && selectedChatId) {
        socket.emit("typing", {
          chatId: selectedChatId,
          isTyping,
          name: user.name,
        });
      }
    },
    [socket, selectedChatId]
  );

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

      const data = await response.json();

      if (response.status === 409) {
        // Handle duplicate group name error
        throw new Error(data.error);
      }

      if (response.ok) {
        if (data.isExisting) {
          // Chat already exists, just select it
          const existingChatIndex = chats.findIndex(
            (chat) => chat._id === data.chat._id
          );
          if (existingChatIndex === -1) {
            // Add to chats list if not already there
            setChats((prev) => [data.chat, ...prev]);
          }
          setSelectedChatId(data.chat._id);
          setError(null);
        } else {
          // New chat created
          setChats((prev) => [data.chat, ...prev]);
          setSelectedChatId(data.chat._id);
        }
      } else {
        throw new Error(data.error || "Failed to create chat");
      }
    } catch (error: any) {
      console.error("Failed to create chat:", error);
      throw error; // Re-throw to be handled by the dialog
    }
  };

  const handleAddParticipants = async (participantIds: string[]) => {
    if (!selectedChatId) return;

    try {
      const response = await fetch(
        `/api/chats/${selectedChatId}/participants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ participantIds }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update the chat in our local state
        setChats((prev) =>
          prev.map((chat) => (chat._id === selectedChatId ? data.chat : chat))
        );

        // Emit to other users
        if (socket) {
          socket.emit("chat-updated", { chat: data.chat });
        }
      } else {
        throw new Error(data.error || "Failed to add participants");
      }
    } catch (error: any) {
      console.error("Failed to add participants:", error);
      throw error;
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!selectedChatId) return;

    try {
      const response = await fetch(
        `/api/chats/${selectedChatId}/participants`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ participantId }),
        }
      );

      if (response.ok) {
        // Reload chats to get updated participant list
        loadChats();

        // Emit to other users
        if (socket) {
          socket.emit("participant-removed", {
            chatId: selectedChatId,
            participantId,
          });
        }
      } else {
        const data = await response.json();
        setError(data.error || "Failed to remove participant");
      }
    } catch (error) {
      console.error("Failed to remove participant:", error);
      setError("Failed to remove participant");
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (selectedChatId === chatId) {
          setSelectedChatId(null);
          setPersistentMessages([]);
        }
        clearTemporaryMessages(chatId);

        // Emit to other users
        if (socket) {
          socket.emit("delete-chat", { chatId });
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    // Don't allow deletion of temporary messages
    if (messageId.startsWith("temp_")) {
      setError("Cannot delete temporary messages");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPersistentMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  content: "This message was deleted",
                  type: "system" as const,
                }
              : msg
          )
        );

        // Emit to other users
        if (socket && selectedChatId) {
          socket.emit("delete-message", { messageId, chatId: selectedChatId });
        }
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const selectedChat = chats.find((chat) => chat._id === selectedChatId);

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  // Add presence tracking in the socket connection effect
  useEffect(() => {
    if (!socket || !connected) return;

    // Emit user online status
    socket.emit("user-online", { userId: user.id });

    // Listen for presence updates
    const handlePresenceUpdate = ({
      userId,
      isOnline,
      lastSeen,
    }: {
      userId: string;
      isOnline: boolean;
      lastSeen: Date;
    }) => {
      setChats((prev) =>
        prev.map((chat) => ({
          ...chat,
          participantDetails: chat.participantDetails?.map((participant) =>
            participant._id === userId
              ? { ...participant, isOnline, lastActive: lastSeen }
              : participant
          ),
        }))
      );
    };

    socket.on("presence-update", handlePresenceUpdate);

    // Cleanup
    return () => {
      socket.off("presence-update", handlePresenceUpdate);
      socket.emit("user-offline", { userId: user.id });
    };
  }, [socket, connected, user.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-screen flex bg-gray-50 relative"
    >
      <SidebarProvider>
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="p-4 border-b bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}

            <div className="flex items-center justify-between mb-3">
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
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Storage Toggle */}
            <StorageToggle />
          </SidebarHeader>
          <SidebarContent className="scrollbar-hide bg-gradient-to-tr from-blue-50 to-indigo-100 shadow-lg">
            {/* Chat List */}
            <ChatList
              chats={chats}
              selectedChatId={selectedChatId}
              onSelectChat={(chatId) => {
                setSelectedChatId(chatId);
              }}
              onCreateChat={() => setShowCreateChat(true)}
              onDeleteChat={handleDeleteChat}
              token={token}
            />
          </SidebarContent>
        </Sidebar>

        {/* Main Chat Area */}
        <SidebarInset>
          {/* <div className="flex-1 flex flex-col"> */}
          <div className="flex-1 flex flex-col h-full relative">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 border-b bg-gradient-to-bl from-blue-50 to-indigo-100 sticky top-0 z-10 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {/* Group Actions */}
                      {selectedChat.type === "group" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="mt-1.5">
                            <DropdownMenuItem
                              onClick={() => setShowGroupInfo(true)}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Group Info
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setShowAddParticipants(true)}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Add Participants
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
                          <h2 className="font-semibold">
                            {selectedChat.type === "group"
                              ? selectedChat.name
                              : selectedChat.participantDetails?.[0].name}
                          </h2>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                selectedChat.type === "group"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {selectedChat.type}
                            </Badge>
                            {!isPersistent && (
                              <Badge
                                variant="outline"
                                className="text-orange-600 border-orange-600"
                              >
                                Temporary
                              </Badge>
                            )}
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

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400 hidden md:block">
                        {socketError
                          ? `Error: ${socketError}`
                          : connected
                          ? "Connected"
                          : "Connecting..."}
                      </span>
                    </div>
                    <SidebarTrigger className="md:hidden" />
                  </div>
                </motion.div>
                {/* Storage Mode Alert */}
                {!isPersistent && (
                  <Alert className="border-orange-200 rounded-none bg-orange-50 mx-auto ">
                    <Info className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      Temporary mode: New messages will not be saved and will be
                      cleared when you switch chats.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto scrollbar-hide bg-gradient-to-t from-blue-100 to-indigo-200 shadow-inner">
                  <MessageList
                    messages={combinedMessages}
                    currentUserId={user.id}
                    onDeleteMessage={handleDeleteMessage}
                  />
                </div>
                {/* Message Input */}
                <div className="sticky bottom-0 z-10 ">
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    onTyping={handleTyping}
                    disabled={!connected || !!socketError}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border-b bg-gradient-to-br from-blue-50 to-indigo-100 md:hidden">
                  <div className="flex items-center space-x-3  justify-between">
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
                    <SidebarTrigger className="mr-2 md:hidden" />
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 bg-gradient-to-br from-blue-100 to-indigo-200">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="max-w-96 bg-gradient-to-br from-blue-50 to-indigo-100">
                      <CardHeader className="text-center">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="size-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto"
                        >
                          <MessageCircle className="w-12 h-12 text-white" />
                        </motion.div>
                        <CardTitle className="text-gray-600">
                          Select a chat to start messaging
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center space-y-3">
                        <Button
                          className="bg-green-600 hover:bg-green-600/90"
                          onClick={() => setShowCreateChat(true)}
                        >
                          Start New Chat
                        </Button>
                        {!isPersistent && (
                          <p className="text-xs text-orange-600">
                            Currently in temporary mode - new messages won't be
                            saved
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </SidebarInset>
        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 z-50"
            >
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Chat Dialog */}
        <CreateChatDialog
          open={showCreateChat}
          onClose={() => setShowCreateChat(false)}
          onCreateChat={handleCreateChat}
          token={token}
        />

        {/* Add Participants Dialog */}
        {selectedChat && selectedChat.type === "group" && (
          <AddParticipantsDialog
            open={showAddParticipants}
            onClose={() => setShowAddParticipants(false)}
            onAddParticipants={handleAddParticipants}
            token={token}
            existingParticipants={selectedChat.participants}
            chatName={selectedChat.name}
          />
        )}

        {/* Group Info Dialog */}
        {selectedChat && selectedChat.type === "group" && (
          <GroupInfoDialog
            open={showGroupInfo}
            onClose={() => setShowGroupInfo(false)}
            chat={selectedChat}
            currentUserId={user.id}
            onAddParticipants={() => {
              setShowGroupInfo(false);
              setShowAddParticipants(true);
            }}
            onRemoveParticipant={handleRemoveParticipant}
          />
        )}
      </SidebarProvider>
    </motion.div>
  );
}
