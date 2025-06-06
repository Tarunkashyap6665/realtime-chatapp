import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { deleteMultimedia } from "@/lib/actions/storage.actions";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
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

    const { messageId } = await params;
    const db = await getDatabase();
    const messagesCollection = db.collection("messages");

    // Check if user owns the message
    const message = await messagesCollection.findOne({
      _id: new ObjectId(messageId),
      senderId: decoded.userId,
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message not found or access denied" },
        { status: 404 }
      );
    }

    if (message.type != "text") {
      await deleteMultimedia(message.fileId);
    }

    // Update message content to indicate deletion
    await messagesCollection.updateOne(
      { _id: new ObjectId(messageId) },
      {
        $set: {
          content: "This message was deleted",
          type: "system",
        },
      }
    );

    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
