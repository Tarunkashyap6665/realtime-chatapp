"use client";

import React from "react";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "@/lib/models";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, MessageSquare, Clock } from "lucide-react";
import MediaMessage from "./media-message";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onDeleteMessage: (messageId: string) => void;
}

export default function MessageList({
  messages,
  currentUserId,
  onDeleteMessage,
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

  const handleDeleteMessage = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    if (confirm("Delete this message? This action cannot be undone.")) {
      onDeleteMessage(messageId);
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  const deletedMessageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  // Check if we need to show a divider between persistent and temporary messages
  const needsDivider =
    messages.some((m) => m.isTemporary) && messages.some((m) => !m.isTemporary);

  // Find the index where temporary messages start
  const findTemporaryDividerIndex = () => {
    // Find the first temporary message
    const firstTempIndex = messages.findIndex((m) => m.isTemporary);
    if (firstTempIndex === -1) return -1;

    // If it's the first message, no divider needed at the beginning
    if (firstTempIndex === 0) return -1;

    // Return the index before the first temporary message
    return firstTempIndex - 1;
  };

  const temporaryDividerIndex = findTemporaryDividerIndex();

  return (
    <div className="p-4 space-y-4">
      {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
        <div key={dateKey}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {formatDate(new Date(dateKey))}
            </span>
          </motion.div>

          <AnimatePresence>
            {dateMessages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUserId;
              const showSender =
                index === 0 ||
                dateMessages[index - 1].senderId !== message.senderId;
              const isDeleted =
                message.type === "system" &&
                message.content === "This message was deleted";
              const isTemporary = message.isTemporary;

              // Check if we need to show the temporary messages divider before this message
              const showTemporaryDivider =
                needsDivider &&
                index > 0 &&
                !dateMessages[index - 1].isTemporary &&
                message.isTemporary;

              return (
                <React.Fragment key={message._id || `temp-${index}`}>
                  {showTemporaryDivider && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center my-4"
                    >
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-600 border-orange-200 flex items-center gap-1 px-3 py-1"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Temporary Messages</span>
                      </Badge>
                    </motion.div>
                  )}

                  <motion.div
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    } mb-2`}
                  >
                    <div
                      className={`max-w-sm lg:max-w-md ${
                        isOwnMessage ? "order-2" : "order-1"
                      }`}
                    >
                      {showSender && !isOwnMessage && !isDeleted && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-gray-600 mb-1 px-3"
                        >
                          {message.senderName}
                        </motion.p>
                      )}

                      {isDeleted ? (
                        <motion.div
                          variants={deletedMessageVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex items-center space-x-2 p-3 rounded-lg bg-gray-100 border border-gray-200"
                        >
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 italic">
                            This message was deleted
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="group relative"
                        >
                          <Card
                            className={`p-3  ${
                              isOwnMessage
                                ? isTemporary
                                  ? "bg-orange-500 text-white border-orange-500"
                                  : "bg-blue-600 text-white border-blue-600"
                                : isTemporary
                                ? "bg-orange-50 border-orange-200 text-gray-800"
                                : "bg-white border-gray-200"
                            } `}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {message.type !== "text" ? (
                                  <MediaMessage
                                    message={message}
                                    isOwnMessage={isOwnMessage}
                                  />
                                ) : (
                                  <p className="text-sm break-words">
                                    {message.content}
                                  </p>
                                )}
                                <div className="flex items-center mt-1 space-x-1">
                                  <p
                                    className={`text-xs ${
                                      isOwnMessage
                                        ? isTemporary
                                          ? "text-orange-100"
                                          : "text-blue-100"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {formatTime(message.timestamp)}
                                  </p>

                                  {isTemporary && (
                                    <Badge
                                      variant="outline"
                                      className={`text-xs py-0 px-1 h-4 ${
                                        isOwnMessage
                                          ? "border-orange-300 text-orange-100"
                                          : "border-orange-300 text-orange-600 bg-orange-50"
                                      }`}
                                    >
                                      <Clock className="w-2 h-2 mr-1" />
                                      temp
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {isOwnMessage && !isTemporary && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ml-2 text-blue-100 hover:bg-transparent hover:text-white"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) =>
                                        handleDeleteMessage(e, message._id!)
                                      }
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Message
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </AnimatePresence>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
