import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const bucketName = process.env.S3_BUCKET as string;
const rootFolder = "web/"; // "storage"
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY as string,
    secretAccessKey: process.env.S3_SECRET_KEY as string,
  },
});

const uploadFolder = async (folderPath: string, bucketName: string, prefix = "") => {
  const files = await fs.readdir(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    if ((await fs.stat(filePath)).isDirectory()) {
      await uploadFolder(filePath, bucketName, `${prefix}${file}/`);
      continue;
    }
    const fileContent = await fs.readFile(filePath);
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${prefix}${file}`,
      Body: fileContent,
      ContentType: getMimeType(file),
      ACL: "public-read",
    });

    await s3.send(command);
    console.log(`✅ Uploaded: ${prefix}${file}`);
  }
};

const getMimeType = (fileName: string) => {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

uploadFolder("./apps/frontend/dist", `${bucketName}`, `${rootFolder}`);
