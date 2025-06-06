"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import FileUpload from "./file-upload";
import AudioRecorder from "./audio-recorder";

interface MessageInputProps {
  onSendMessage: (content: string, mediaData?: any) => void;
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
  const [isSending, setIsSending] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() && !disabled && !isSending) {
      setIsSending(true);
      onSendMessage(message.trim());
      setMessage("");
      setIsTyping(false);
      onTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (file: File, mediaData: any, caption?: string) => {
    // Send the media message with caption
    onSendMessage(caption || "", mediaData);

    // Clear any typing indicators
    setIsTyping(false);
    onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleSendAudio = async (audioBlob: Blob, duration: number) => {
    try {
      setIsSending(true);

      // Create a File object from the blob
      const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
        type: audioBlob.type,
      });

      // Upload the audio file
      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }

      const uploadResult = await response.json();

      // Create media data for audio
      const mediaData = {
        type: "audio",
        url: uploadResult.url,
        name: audioFile.name,
        size: audioFile.size,
        duration: duration,
        fileId: uploadResult.fileId,
      };

      // Send the audio message
      onSendMessage("", mediaData);
    } catch (error) {
      console.error("Failed to send audio:", error);
      alert("Failed to send audio message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Determine which icon to show
  const hasText = message.trim().length > 0;
  const showSendButton = hasText || isSending;

  return (
    <div className="border-t bg-gradient-to-bl from-blue-50 to-indigo-100 p-4 shadow-lg">
      <form onSubmit={handleSubmit} className="flex space-x-2 items-end">
        <FileUpload
          onFileSelect={handleFileSelect}
          disabled={disabled || isSending}
        />

        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Connecting..." : "Type a message..."}
            disabled={disabled || isSending}
            className="pr-12 rounded-full bg-blue-200 shadow-inner"
          />
        </div>

        {/* Dynamic Send/Microphone Button */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {showSendButton ? (
              <motion.div
                key="send"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="submit"
                  disabled={!message.trim() || disabled || isSending}
                  size="icon"
                  className={`${
                    disabled || isSending ? "opacity-50" : ""
                  } bg-blue-600 hover:bg-blue-700 rounded-full`}
                >
                  {isSending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="microphone"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -180 }}
                transition={{ duration: 0.2 }}
              >
                <AudioRecorder
                  onSendAudio={handleSendAudio}
                  disabled={disabled || isSending}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
