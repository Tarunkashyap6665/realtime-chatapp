export interface User {
  _id?: string
  email: string
  name: string
  createdAt: Date
  lastActive: Date
}

export interface Message {
  _id?: string
  content: string
  senderId: string
  senderName: string
  chatId: string
  timestamp: Date
  type: "text" | "system"
}

export interface Chat {
  _id?: string
  name: string
  type: "personal" | "group"
  participants: string[]
  createdAt: Date
  lastMessage?: {
    content: string
    timestamp: Date
    senderName: string
  }
}

export interface OTPEntry {
  email: string
  otp: string
  expiresAt: Date
  attempts: number
}
