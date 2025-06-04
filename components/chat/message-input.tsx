"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onTyping,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      setIsTyping(false);
      onTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t bg-gradient-to-bl from-blue-50 to-indigo-100 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={
            disabled
              ? "Select a chat to start messaging..."
              : "Type a message..."
          }
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
