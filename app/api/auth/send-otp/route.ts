import { type NextRequest, NextResponse } from "next/server";
import { setOTP } from "@/lib/otp-storage";
import { sendOTPEmail } from "@/lib/email";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    //

    // (await cookies()).set("temp", JSON.stringify(this.storage));
    // Store OTP with 5-minute expiration
    await setOTP(email, otp, 5);

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "OTP sent successfully",
      email,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
