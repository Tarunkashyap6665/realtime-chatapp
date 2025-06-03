import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(
  email: string,
  otp: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `💬ChatApp <${process.env.EMAIL_USER}>`,
      to: `${email}`,
      subject: "Your Chat App Login Code",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 32px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="background-color: #2563eb; width: 64px; height: 64px; border-radius: 16px; margin: 0 auto;">
              <img src=${
                process.env.APP_URL || "http://localhost:3000"
              }/logo.png alt="Chat Icon" style="width: 32px; height: 32px; margin: 16px;" />
            </div>
            <h1 style="color: #1f2937; font-size: 24px; margin: 16px 0 8px;">Welcome to ChatApp</h1>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">Use the code below to log in to your account</p>
          </div>
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
            <div style="font-size: 32px; font-weight: 600; letter-spacing: 4px; color: #2563eb; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0;">This code will expire in 5 minutes</p>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">If you didn't request this code, you can safely ignore this email.</p>
            <p style="color: #6b7280; font-size: 14px; margin: 16px 0 0;">Need help? Contact our support team.</p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 32px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2024 ChatApp. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
