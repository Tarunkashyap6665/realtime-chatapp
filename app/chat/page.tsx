import ChatUI from "@/components/chat/chat-ui";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat - ChatApp",
  description:
    "Access your secure chat interface. Send messages, create group chats, and communicate in real-time with your team.",
  keywords:
    "chat interface, real-time messaging, secure chat, team communication",
  openGraph: {
    title: "Chat - ChatApp",
    description:
      "Access your secure chat interface. Send messages, create group chats, and communicate in real-time with your team.",
    type: "website",
    siteName: "ChatApp",
  },
  robots: {
    index: false,
    follow: false,
  },
};

import React from "react";

const ChatPage = () => {
  return <ChatUI />;
};

export default ChatPage;
