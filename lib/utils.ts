import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";
import { appwriteConfig } from "./appwrite/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY =
  process.env.ENCRYPTION_SECRET || "12345678901234567890123456789012"; // 32 bytes key
const IV = crypto.randomBytes(16); // Initialization vector

export function encrypt(text: string) {
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), IV);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return IV.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// APPWRITE URL UTILS
// Construct appwrite file URL - https://appwrite.io/docs/apis/rest#images
export const constructFileUrl = (bucketFileId: string) => {
  return `${appwriteConfig.endpointUrl}/storage/buckets/${appwriteConfig.bucketId}/files/${bucketFileId}/view?project=${appwriteConfig.projectId}`;
};

export const constructDownloadUrl = (bucketFileId: string) => {
  return `${appwriteConfig.endpointUrl}/storage/buckets/${appwriteConfig.bucketId}/files/${bucketFileId}/download?project=${appwriteConfig.projectId}`;
};
