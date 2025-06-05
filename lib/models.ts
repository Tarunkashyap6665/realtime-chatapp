export interface User {
  _id?: string;
  email: string;
  name: string;
  createdAt: Date;
  lastActive: Date;
  isOnline?: boolean;
  avatar?: string;
}

export interface Message {
  _id?: string;
  content: string;
  senderId: string;
  senderName: string;
  chatId: string;
  timestamp: Date;
  type: "text" | "system" | "image" | "audio" | "video" | "file";
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  mediaDuration?: number; // for audio/video
  thumbnailUrl?: string; // for video
  isTemporary?: boolean;
}

export interface Chat {
  _id?: string;
  name: string;
  type: "personal" | "group";
  participants: string[];
  participantDetails?: User[];
  createdAt: Date;
  createdBy?: string; // ID of the user who created the chat
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderName: string;
    type: "text" | "image" | "audio" | "video" | "file" | "system";
  };
}

export interface OTPEntry {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}
