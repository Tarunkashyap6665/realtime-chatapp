import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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

    const { isOnline } = await request.json()
    const db = await getDatabase()
    const usersCollection = db.collection("users")

    // Update user's online status
    await usersCollection.updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          isOnline: isOnline,
          lastActive: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update presence error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
