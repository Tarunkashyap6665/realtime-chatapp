import type { OTPEntry } from "./models";
import { encrypt } from "./utils";
import { cookies } from "next/headers";

const otpMap = new Map<string, OTPEntry>();

export async function setOTP(
  email: string,
  otp: string,
  expirationMinutes = 5
): Promise<void> {
  const encryptedOtp = encrypt(otp); // Optionally store encryptedOtp if needed

  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  otpMap.set(email, {
    email,
    otp, // Store plaintext or encrypted version
    expiresAt,
    attempts: 0,
  });
  const json = JSON.stringify(Array.from(otpMap.entries())[0]);
  (await cookies()).set("temp", JSON.stringify(json), {
    maxAge: expirationMinutes * 60, // Set cookie expiration
  });
}

export async function getOTP(email: string): Promise<OTPEntry | null> {
  const data = JSON.parse((await cookies()).get("temp")?.value || "");
  const parsedData = JSON.parse(data);

  if (parsedData.length === 0) return null;
  otpMap.set(parsedData[0], parsedData[1]);
  const entry = otpMap.get(email);
  if (!entry) return null;

  if (entry.expiresAt < new Date()) {
    otpMap.delete(email);
    return null;
  }

  return entry;
}

export async function incrementOTPAttempts(email: string): Promise<void> {
  const data = JSON.parse((await cookies()).get("temp")?.value || "");
  const parsedData = JSON.parse(data);

  if (parsedData.length === 0) return;
  otpMap.set(parsedData[0], parsedData[1]);
  const entry = otpMap.get(email);

  if (entry) {
    entry.attempts += 1;
    otpMap.set(email, entry);
    const json = JSON.stringify(Array.from(otpMap.entries())[0]);
    (await cookies()).set("temp", JSON.stringify(json));
  }
}

export async function deleteOTP(email: string): Promise<void> {
  otpMap.delete(email);
  (await cookies()).delete("temp");
}

export async function cleanupExpiredOTPs(): Promise<void> {
  const now = new Date();
  for (const [email, entry] of otpMap.entries()) {
    if (entry.expiresAt < now) {
      otpMap.delete(email);
      (await cookies()).delete("temp");
    }
  }
}

// Optional: Run cleanup every minute on server start
if (typeof window === "undefined") {
  setInterval(() => {
    cleanupExpiredOTPs();
  }, 60000);
}
