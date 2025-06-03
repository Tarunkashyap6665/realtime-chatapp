"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/models";
import { Card } from "@/components/ui/card";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({
  messages,
  currentUserId,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="p-4 space-y-4">
      {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
        <div key={dateKey}>
          <div className="flex justify-center mb-4">
            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {formatDate(new Date(dateKey))}
            </span>
          </div>

          {dateMessages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUserId;
            const showSender =
              index === 0 ||
              dateMessages[index - 1].senderId !== message.senderId;

            return (
              <div
                key={message._id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`max-w-xs lg:max-w-md ${
                    isOwnMessage ? "order-2" : "order-1"
                  }`}
                >
                  {showSender && !isOwnMessage && (
                    <p className="text-xs text-gray-600 mb-1 px-3">
                      {message.senderName}
                    </p>
                  )}
                  <Card
                    className={`p-3 ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
