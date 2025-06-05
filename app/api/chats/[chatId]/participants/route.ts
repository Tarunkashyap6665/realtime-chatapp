import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getDatabase } from "@/lib/mongodb";
import type { Chat, User } from "@/lib/models";
import { ObjectId } from "mongodb";

export async function POST(
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
    const { participantIds } = await request.json();

    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: "Participant IDs are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const chatsCollection = db.collection<Chat>("chats");
    const usersCollection = db.collection<User>("users");

    // Check if chat exists and user is a participant
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

    // Only allow adding participants to group chats
    if (chat.type !== "group") {
      return NextResponse.json(
        { error: "Can only add participants to group chats" },
        { status: 400 }
      );
    }

    // Validate that all participant IDs are valid users
    const participantObjectIds = participantIds.map(
      (id: string) => new ObjectId(id)
    );
    const validUsers = await usersCollection
      .find({ _id: { $in: participantObjectIds } })
      .toArray();

    if (validUsers.length !== participantIds.length) {
      return NextResponse.json(
        { error: "One or more users not found" },
        { status: 400 }
      );
    }

    // Filter out users who are already participants
    const newParticipants = participantIds.filter(
      (id: string) => !chat.participants.includes(id)
    );

    if (newParticipants.length === 0) {
      return NextResponse.json(
        { error: "All selected users are already in this group" },
        { status: 400 }
      );
    }

    // Add new participants to the chat
    const updatedParticipants = [...chat.participants, ...newParticipants];

    await chatsCollection.updateOne(
      { _id: new ObjectId(chatId) },
      {
        $set: {
          participants: updatedParticipants,
        },
      }
    );

    // Get updated chat with participant details
    const updatedChat = await chatsCollection
      .aggregate([
        { $match: { _id: new ObjectId(chatId) } },
        {
          $lookup: {
            from: "users",
            let: {
              participantIds: {
                $map: {
                  input: "$participants",
                  as: "p",
                  in: { $toObjectId: "$$p" },
                },
              },
            },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$participantIds"] } } },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  isOnline: { $ifNull: ["$isOnline", false] },
                  lastActive: 1,
                },
              },
            ],
            as: "participantDetails",
          },
        },
      ])
      .toArray();

    // Get details of newly added users for the response
    const addedUsers = validUsers.filter((user) =>
      newParticipants.includes(user._id.toString())
    );

    return NextResponse.json({
      message: "Participants added successfully",
      chat: updatedChat[0],
      addedUsers: addedUsers.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
      })),
    });
  } catch (error) {
    console.error("Add participants error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const chatsCollection = db.collection<Chat>("chats");

    // Check if chat exists and user is a participant
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

    // Only allow removing participants from group chats
    if (chat.type !== "group") {
      return NextResponse.json(
        { error: "Can only remove participants from group chats" },
        { status: 400 }
      );
    }

    // Check if the participant to remove is actually in the chat
    if (!chat.participants.includes(participantId)) {
      return NextResponse.json(
        { error: "User is not a participant in this chat" },
        { status: 400 }
      );
    }

    // Don't allow removing the last participant
    if (chat.participants.length <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last participant from a group" },
        { status: 400 }
      );
    }

    // Remove participant from the chat
    const updatedParticipants = chat.participants.filter(
      (id) => id !== participantId
    );

    await chatsCollection.updateOne(
      { _id: new ObjectId(chatId) },
      {
        $set: {
          participants: updatedParticipants,
        },
      }
    );

    return NextResponse.json({
      message: "Participant removed successfully",
      removedParticipantId: participantId,
    });
  } catch (error) {
    console.error("Remove participant error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
