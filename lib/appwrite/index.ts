"use server";
import {
  Client,
  Account,
  Databases,
  Avatars,
  Storage,
  Users,
} from "node-appwrite";
import { appwriteConfig } from "./config";

const { endpointUrl, projectId, secretKey } = appwriteConfig;

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(endpointUrl)
    .setProject(projectId)
    .setKey(secretKey);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get avatars() {
      return new Avatars(client);
    },
    get storage() {
      return new Storage(client);
    },
    get user() {
      return new Users(client);
    },
  };
}
