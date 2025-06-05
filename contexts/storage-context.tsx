"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Message } from "@/lib/models"

interface StorageContextType {
  isPersistent: boolean
  togglePersistence: () => void
  temporaryMessages: Map<string, Message[]>
  addTemporaryMessage: (chatId: string, message: Message) => void
  clearTemporaryMessages: (chatId?: string) => void
  getTemporaryMessages: (chatId: string) => Message[]
  messageIds: Set<string>
  addMessageId: (id: string) => void
  hasMessageId: (id: string) => boolean
  clearMessageIds: (chatId?: string) => void
}

const StorageContext = createContext<StorageContextType | undefined>(undefined)

export function StorageProvider({ children }: { children: ReactNode }) {
  const [isPersistent, setIsPersistent] = useState(true)
  const [temporaryMessages, setTemporaryMessages] = useState<Map<string, Message[]>>(new Map())
  // Track all message IDs to prevent duplicates
  const [messageIds, setMessageIds] = useState<Set<string>>(new Set())

  // Load persistence setting from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chatapp_persistent_storage")
    if (saved !== null) {
      setIsPersistent(JSON.parse(saved))
    }
  }, [])

  // Save persistence setting to localStorage
  useEffect(() => {
    localStorage.setItem("chatapp_persistent_storage", JSON.stringify(isPersistent))
  }, [isPersistent])

  const togglePersistence = () => {
    setIsPersistent((prev) => !prev)
  }

  const addTemporaryMessage = (chatId: string, message: Message) => {
    // Don't add if we already have this message ID
    if (message._id && messageIds.has(message._id)) {
      return
    }

    setTemporaryMessages((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(chatId) || []
      newMap.set(chatId, [...existing, message])
      return newMap
    })

    // Add to message IDs set
    if (message._id) {
      addMessageId(message._id)
    }
  }

  const clearTemporaryMessages = (chatId?: string) => {
    setTemporaryMessages((prev) => {
      const newMap = new Map(prev)
      if (chatId) {
        newMap.delete(chatId)
      } else {
        newMap.clear()
      }
      return newMap
    })

    // Clear message IDs for this chat or all chats
    clearMessageIds(chatId)
  }

  const getTemporaryMessages = (chatId: string) => {
    return temporaryMessages.get(chatId) || []
  }

  const addMessageId = (id: string) => {
    setMessageIds((prev) => new Set(prev).add(id))
  }

  const hasMessageId = (id: string) => {
    return messageIds.has(id)
  }

  const clearMessageIds = (chatId?: string) => {
    if (!chatId) {
      setMessageIds(new Set())
      return
    }

    // If we're clearing a specific chat, we need to remove only those message IDs
    // This is more complex and would require tracking message IDs by chat
    // For now, we'll keep all IDs to prevent duplicates across chats
  }

  return (
    <StorageContext.Provider
      value={{
        isPersistent,
        togglePersistence,
        temporaryMessages,
        addTemporaryMessage,
        clearTemporaryMessages,
        getTemporaryMessages,
        messageIds,
        addMessageId,
        hasMessageId,
        clearMessageIds,
      }}
    >
      {children}
    </StorageContext.Provider>
  )
}

export function useStorage() {
  const context = useContext(StorageContext)
  if (context === undefined) {
    throw new Error("useStorage must be used within a StorageProvider")
  }
  return context
}
