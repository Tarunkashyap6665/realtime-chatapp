"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ChatApp from "@/components/chat/chat-interface";
interface User {
  id: string;
  email: string;
  name: string;
}
export default function ChatUI() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("chatapp_token");
      if (!savedToken) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: savedToken }),
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setToken(savedToken);
        } else {
          localStorage.removeItem("chatapp_token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("chatapp_token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <MessageCircle className="w-16 h-16 text-blue-600" />
          </motion.div>
          <p className="text-gray-600 text-lg">Loading your chats...</p>
        </motion.div>
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen"
    >
      <ChatApp user={user} token={token} />
    </motion.div>
  );
}
