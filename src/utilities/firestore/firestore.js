import { Firestore } from "@google-cloud/firestore";
import "dotenv/config";

export const firestore = new Firestore({
  projectId: process.env.FIRESTORE_PROJECT_ID,
  keyFilename: process.env.FIRESTORE_KEY_PATH,
});
