"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, User } from "lucide-react";
import type { Chat } from "@/lib/models";

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
  token: string;
}

export default function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateChat,
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

  return (
    <Card className="h-full bg-transparent rounded-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chats</CardTitle>
          <Button className="bg-green-600" size="sm" onClick={onCreateChat}>
            <Plus className="w-4 h-4" />
          </Button>
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
        <div className="space-y-1">
          {filteredChats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => onSelectChat(chat._id!)}
              className={`p-3 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
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
                      <User className="w-4 h-4 text-gray-500" />
                    )}
                    <h3 className="font-medium text-sm truncate">
                      {chat.name}
                    </h3>
                    <Badge
                      variant={chat.type === "group" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {chat.type}
                    </Badge>
                  </div>
                  {chat.lastMessage && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      <span className="font-medium">
                        {chat.lastMessage.senderName}:
                      </span>{" "}
                      {chat.lastMessage.content}
                    </p>
                  )}
                </div>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-400 ml-2">
                    {formatTime(chat.lastMessage.timestamp)}
                  </span>
                )}
              </div>
            </div>
          ))}
          {filteredChats.length === 0 && (
            <div className="p-8 text-center text-gray-500">
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
