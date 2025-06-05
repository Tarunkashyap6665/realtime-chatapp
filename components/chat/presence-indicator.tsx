"use client";

import { motion } from "framer-motion";

interface PresenceIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  lastSeen?: Date;
}

export default function PresenceIndicator({
  isOnline,
  size = "sm",
  showLabel = false,
  lastSeen,
}: PresenceIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const getLastSeenText = () => {
    if (!lastSeen) return "Last seen unknown";

    const now = new Date();
    const diff = now.getTime() - new Date(lastSeen).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Last seen just now";
    if (minutes < 60) return `Last seen ${minutes}m ago`;
    if (hours < 24) return `Last seen ${hours}h ago`;
    if (days < 7) return `Last seen ${days}d ago`;
    return `Last seen ${new Date(lastSeen).toLocaleDateString()}`;
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} rounded-full ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
          animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
          transition={
            isOnline ? { duration: 2, repeat: Number.POSITIVE_INFINITY } : {}
          }
        />
        {isOnline && (
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500 opacity-30`}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500">
          {isOnline ? "Online" : getLastSeenText()}
        </span>
      )}
    </div>
  );
}
