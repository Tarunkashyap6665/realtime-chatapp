"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Users,
  User,
  MoreVertical,
  Trash2,
  ImageIcon,
  Music,
  Video,
  FileText,
} from "lucide-react";
import type { Chat } from "@/lib/models";
import PresenceIndicator from "./presence-indicator";

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  token: string;
}

export default function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  token,
}: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChats, setFilteredChats] = useState(chats);

  useEffect(() => {
    const filtered = chats.filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [chats, searchTerm]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours =
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-3 h-3 text-green-600" />;
      case "audio":
        return <Music className="w-3 h-3 text-blue-600" />;
      case "video":
        return <Video className="w-3 h-3 text-purple-600" />;
      case "file":
        return <FileText className="w-3 h-3 text-orange-600" />;
      default:
        return null;
    }
  };

  const formatLastMessage = (chat: Chat) => {
    if (!chat.lastMessage) return "";

    const { content, senderName, type } = chat.lastMessage;
    const mediaIcon = getMediaIcon(type);

    if (type !== "text" && mediaIcon) {
      return (
        <div className="flex items-center space-x-1">
          {mediaIcon}
          <span className="truncate">{content}</span>
        </div>
      );
    }

    return content;
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (
      confirm(
        "Are you sure you want to delete this chat? This action cannot be undone."
      )
    ) {
      onDeleteChat(chatId);
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      x: -100,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <Card className="h-full bg-transparent rounded-none border-0 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chats</CardTitle>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-600/90"
              onClick={onCreateChat}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          <AnimatePresence>
            {filteredChats.map((chat) => (
              <motion.div
                key={chat._id}
                variants={itemVariants}
                layout
                exit="exit"
                whileHover={{ x: 4 }}
                onClick={() => onSelectChat(chat._id!)}
                className={`group relative p-3 cursor-pointer hover:bg-gray-50 border-l-4 transition-all duration-200 ${
                  selectedChatId === chat._id
                    ? "bg-blue-50 border-l-blue-500"
                    : "border-l-transparent"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {chat.type === "group" ? (
                        <Users className="w-4 h-4 text-gray-500" />
                      ) : (
                        <div className="relative">
                          <User className="w-4 h-4 text-gray-500" />
                          {chat.participantDetails &&
                            chat.participantDetails.length > 0 && (
                              <div className="absolute -bottom-1 -right-1">
                                <PresenceIndicator
                                  isOnline={
                                    chat.participantDetails[0]?.isOnline ||
                                    false
                                  }
                                  size="sm"
                                />
                              </div>
                            )}
                        </div>
                      )}
                      <h3 className="font-medium text-sm truncate">
                        {chat.type === "group"
                          ? chat.name
                          : chat.participantDetails?.[0].name}
                      </h3>
                      <Badge
                        variant={
                          chat.type === "group" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {chat.type}
                      </Badge>
                    </div>
                    {chat.lastMessage && (
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        <span className="font-medium">
                          {chat.lastMessage.senderName}:
                        </span>{" "}
                        <span className="inline-flex items-center">
                          {formatLastMessage(chat)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-400">
                        {formatTime(chat.lastMessage.timestamp)}
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteChat(e, chat._id!)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredChats.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 text-center text-gray-500"
            >
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No chats found</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateChat}
                className="mt-2"
              >
                Start a new chat
              </Button>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
