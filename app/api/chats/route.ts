import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { getDatabase } from "@/lib/mongodb"
import type { Chat, User } from "@/lib/models"
import { ObjectId } from "mongodb"

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

    // Get chats with participant details
    const chats = await chatsCollection
      .aggregate([
        { $match: { participants: decoded.userId } },
        {
          $lookup: {
            from: "users",
            let: { participantIds: { $map: { input: "$participants", as: "p", in: { $toObjectId: "$$p" } } } },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$participantIds"] } } },
              { $project: { _id: 1, name: 1, email: 1, isOnline: { $ifNull: ["$isOnline", false] }, lastActive: 1 } },
            ],
            as: "participantDetails",
          },
        },
        { $sort: { "lastMessage.timestamp": -1, createdAt: -1 } },
      ])
      .toArray()

    // Filter out current user from participant details for personal chats
    const processedChats = chats.map((chat) => ({
      ...chat,
      participantDetails:
        chat.type === "personal"
          ? chat.participantDetails?.filter((p: any) => p._id.toString() !== decoded.userId)
          : chat.participantDetails,
    }))

    return NextResponse.json({ chats: processedChats })
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

    if (!name || !type || !Array.isArray(participants)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (type === "personal" && participants.length !== 1) {
      return NextResponse.json({ error: "Personal chat must have exactly one participant" }, { status: 400 })
    }

    if (type === "group" && participants.length < 1) {
      return NextResponse.json({ error: "Group chat must have at least one participant" }, { status: 400 })
    }

    const db = await getDatabase()
    const chatsCollection = db.collection<Chat>("chats")
    const usersCollection = db.collection<User>("users")

    // For group chats, check if a group with the same name already exists for this user
    if (type === "group") {
      const existingGroupChat = await chatsCollection.findOne({
        type: "group",
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") }, // Case-insensitive exact match
        participants: decoded.userId,
      })

      if (existingGroupChat) {
        return NextResponse.json(
          {
            error: "A group chat with this name already exists",
            existingChatId: existingGroupChat._id,
          },
          { status: 409 },
        )
      }
    }

    // Validate participants exist
    const participantObjectIds = participants.map((id: string) => new ObjectId(id))
    const validParticipants = await usersCollection.find({ _id: { $in: participantObjectIds } }).toArray()

    if (validParticipants.length !== participants.length) {
      return NextResponse.json({ error: "One or more participants not found" }, { status: 400 })
    }

    // For personal chats, check if a chat already exists between these users
    if (type === "personal") {
      const allParticipants = [decoded.userId, ...participants].sort()

      const existingChat = await chatsCollection.findOne({
        type: "personal",
        participants: { $all: allParticipants, $size: allParticipants.length },
      })

      if (existingChat) {
        // Return the existing chat with participant details
        const chatWithDetails = await chatsCollection
          .aggregate([
            { $match: { _id: existingChat._id } },
            {
              $lookup: {
                from: "users",
                let: { participantIds: { $map: { input: "$participants", as: "p", in: { $toObjectId: "$$p" } } } },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$participantIds"] } } },
                  {
                    $project: { _id: 1, name: 1, email: 1, isOnline: { $ifNull: ["$isOnline", false] }, lastActive: 1 },
                  },
                ],
                as: "participantDetails",
              },
            },
          ])
          .toArray()

        const processedChat = {
          ...chatWithDetails[0],
          participantDetails: chatWithDetails[0].participantDetails?.filter(
            (p: any) => p._id.toString() !== decoded.userId,
          ),
        }

        return NextResponse.json({
          chat: processedChat,
          isExisting: true,
          message: "Opened existing chat",
        })
      }
    }

    // Create new chat
    const allParticipants = [decoded.userId, ...participants]

    const newChat: Chat = {
      name: name.trim(),
      type: type as "personal" | "group",
      participants: allParticipants,
      createdAt: new Date(),
      createdBy: decoded.userId, // Track who created the group
    }

    const result = await chatsCollection.insertOne(newChat)

    // Get the created chat with participant details
    const chatWithDetails = await chatsCollection
      .aggregate([
        { $match: { _id: result.insertedId } },
        {
          $lookup: {
            from: "users",
            let: { participantIds: { $map: { input: "$participants", as: "p", in: { $toObjectId: "$$p" } } } },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$participantIds"] } } },
              { $project: { _id: 1, name: 1, email: 1, isOnline: { $ifNull: ["$isOnline", false] }, lastActive: 1 } },
            ],
            as: "participantDetails",
          },
        },
      ])
      .toArray()

    const processedChat = {
      ...chatWithDetails[0],
      _id: result.insertedId.toString(),
      participantDetails:
        type === "personal"
          ? chatWithDetails[0].participantDetails?.filter((p: any) => p._id.toString() !== decoded.userId)
          : chatWithDetails[0].participantDetails,
    }

    return NextResponse.json({
      chat: processedChat,
      isExisting: false,
      message: "Chat created successfully",
    })
  } catch (error) {
    console.error("Create chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
