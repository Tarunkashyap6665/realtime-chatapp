import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models"
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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ users: [] })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    const users = await usersCollection
      .find({
        $and: [
          { _id: { $ne: new ObjectId(decoded.userId) } },
          {
            $or: [{ name: { $regex: query, $options: "i" } }, { email: { $regex: query, $options: "i" } }],
          },
        ],
      })
      .limit(10)
      .toArray()

    return NextResponse.json({
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
      })),
    })
  } catch (error) {
    console.error("Search users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
