import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { chatId } = await params;
    const db = await getDatabase();
    const chatsCollection = db.collection("chats");
    const messagesCollection = db.collection("messages");

    // Check if user is a participant in the chat
    const chat = await chatsCollection.findOne({
      _id: new ObjectId(chatId),
      participants: decoded.userId,
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or access denied" },
        { status: 404 }
      );
    }

    // Delete all messages in the chat
    await messagesCollection.deleteMany({ chatId });

    // Delete the chat
    await chatsCollection.deleteOne({ _id: new ObjectId(chatId) });

    return NextResponse.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
