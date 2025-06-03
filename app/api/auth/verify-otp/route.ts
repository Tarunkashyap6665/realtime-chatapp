import { type NextRequest, NextResponse } from "next/server";
import { getOTP, deleteOTP, incrementOTPAttempts } from "@/lib/otp-storage";
import { generateToken } from "@/lib/jwt";
import { getDatabase } from "@/lib/mongodb";
import type { User } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, name } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Verify OTP
    const storedOTP = await getOTP(email);

    if (!storedOTP) {
      return NextResponse.json(
        { error: "OTP expired or not found" },
        { status: 400 }
      );
    }

    if (storedOTP.attempts >= 3) {
      await deleteOTP(email);
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (storedOTP.otp !== otp) {
      await incrementOTPAttempts(email);
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // OTP verified, remove from storage
    await deleteOTP(email);

    // Get or create user in database
    const db = await getDatabase();
    const usersCollection = db.collection<User>("users");

    let user = await usersCollection.findOne({ email });

    if (!user) {
      if (!name) {
        return NextResponse.json(
          { error: "Name is required for new users" },
          { status: 400 }
        );
      }

      const newUser: User = {
        email,
        name,
        createdAt: new Date(),
        lastActive: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId.toString() };
    } else {
      // Update last active
      await usersCollection.updateOne(
        { email },
        { $set: { lastActive: new Date() } }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
    });

    return NextResponse.json({
      message: "Authentication successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
