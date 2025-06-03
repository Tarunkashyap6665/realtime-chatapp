import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { getDatabase } from "@/lib/mongodb"
import type { Chat } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDatabase()
    const chatsCollection = db.collection<Chat>("chats")

    const chats = await chatsCollection
      .find({ participants: decoded.userId })
      .sort({ "lastMessage.timestamp": -1 })
      .toArray()

    return NextResponse.json({ chats })
  } catch (error) {
    console.error("Get chats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { name, type, participants } = await request.json()

    if (!name || !type || !participants) {
      return NextResponse.json({ error: "Name, type, and participants are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const chatsCollection = db.collection<Chat>("chats")

    const newChat: Chat = {
      name,
      type,
      participants: [decoded.userId, ...participants],
      createdAt: new Date(),
    }

    const result = await chatsCollection.insertOne(newChat)
    const chat = { ...newChat, _id: result.insertedId.toString() }

    return NextResponse.json({ chat })
  } catch (error) {
    console.error("Create chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
