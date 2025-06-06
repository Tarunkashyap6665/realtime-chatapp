"use server";

import { ID } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { constructFileUrl } from "../utils";

export async function saveMultimedia(formData: FormData) {
  const { storage } = await createAdminClient();
  const media = formData.get("file") as File;

  const file = await storage.createFile(
    appwriteConfig.bucketId,
    ID.unique(),
    media
  );

  const fileUrl = constructFileUrl(file.$id);
  const mediaData = {
    url: fileUrl,
    name: file.name,
    fileId: file.$id,
    size: file.sizeOriginal,
    type: file.mimeType,
  };

  return mediaData;
}

export async function deleteMultimedia(fileId: string) {
  const { storage } = await createAdminClient();
  try {
    await storage.deleteFile(appwriteConfig.bucketId, fileId);
  } catch (error) {
    console.error(error);
  }
}
