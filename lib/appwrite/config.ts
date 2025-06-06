export const appwriteConfig = {
  endpointUrl:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT! ||
    "https://cloud.appwrite.io/v1",
  projectId:
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT! || "67c061e100225e80aa0e",
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET! || "67c061e100225e80aa0e",
  secretKey: process.env.APPWRITE_SECERET! || "67c061e100225e80aa0e",
};
