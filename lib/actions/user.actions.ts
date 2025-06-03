"use server";

import { User } from "../models";
import { getDatabase } from "../mongodb";

export async function isUserExits(email: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const user = db.collection<User>("users");
    const data = await user.findOne({ email });
    if (!data) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
}
