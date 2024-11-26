import { Storage } from "@google-cloud/storage";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = new Storage({
  keyFilename: path.join(__dirname, "project-isyara.json"),
  projectId: "project-isyara",
});

const bucket = storage.bucket("isyara-bucket");

export const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const uniqueName = `user-profile/${Date.now()}-${file.originalname}`;
    const blob = bucket.file(uniqueName).createWriteStream({
      resumable: false,
      metadata: { contentType: file.mimetype },
    });
    blob.on("finish", () => {
      const publicUrl = `https://storage.cloud.google.com/isyara-bucket/${uniqueName}`;
      resolve(publicUrl);
    });
    blob.on("error", reject);
    blob.end(file.buffer);
  });
};
