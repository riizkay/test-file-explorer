import file_index from "@/rest/model/storage/file_index";
import { FileSystemItem, FSType, PaginationResult } from "@shared/types";
import { FileSystemRepository, FileIndex } from "../repository/filesystem.repository";
import Pagination from "@/common/pagination";
import { resolve } from "path";
import core from "@/common/core";
import { Transaction } from "sequelize";
import fs, { writeFileSync } from "fs";
import Global from "@/global";
import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
const uploadDir = resolve("./uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT, // Endpoint dari .env
  region: process.env.S3_REGION, // Region dari .env
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY as string,
    secretAccessKey: process.env.S3_SECRET_KEY as string,
  },
});
const bucketName = process.env.S3_BUCKET as string;
const rootFolder = "infokes"; // "storage"
const deleteBranch = async (prefix: string) => {
  try {
    const keys = [];
    const redisClient = Global().redis;
    // Scan key dengan pola (prefix:*)
    for await (const key of redisClient.scanIterator({
      MATCH: `${prefix}*`, // Pola untuk branch key
      COUNT: 100, // Batch scan (opsional)
    })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      // Hapus semua key yang ditemukan
      await redisClient.del(keys);
    } else {
    }
  } catch (error) {
    console.error("Error deleting keys:", error);
  }
};
export class FileSystemService {
  static async pathTraversal(path: string) {
    var normalizedPath = path.replace(/\/\//g, "/");
    var dirs = normalizedPath.split("/").filter((dir) => dir.length > 0);
    const rootId = 1;
    var parentId = rootId;
    var idTraversal = [parentId];
    for (const dir of dirs) {
      var folder = await FileSystemRepository.getFolderByName(parentId, dir);
      parentId = folder?.id;
      idTraversal.push(parentId);
    }
    return { idTraversal, parentId };
  }
  static async list(
    path: string,
    type: FSType | FSType[],
    recursive: boolean,
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginationResult<FileSystemItem>> {
    const { parentId } = await FileSystemService.pathTraversal(path);
    var key = null;
    if (!search && recursive == false) {
      key = `fs:list:${parentId}:${type.toString()}:${page}:${limit}`;
      var data = await Global().redis.get(key);
      if (data) {
        return JSON.parse(data);
      }
    }

    var pagination = FileSystemRepository.list(parentId, type, recursive, page, limit, search);
    pagination = await pagination
      .editColumn("id", (row: FileIndex) => {
        return core.ENC.encodeID(row.id);
      })
      .addColumn("childrenCount", async (row: FileIndex) => {
        return await FileSystemRepository.countFolders(row.id!);
      })
      .addColumn("path", (row: FileIndex) => {
        return path;
      });
    // if (search) pagination.canSearch("name", search);

    var ret: any = (await pagination.get()) as any;
    if (key) Global().redis.set(key, JSON.stringify(ret), { EX: 3600 });
    return ret;
  }
  static async uploadFile(file: any, path: string, transaction?: Transaction) {
    if (!file) {
      throw new Error("No file received!");
    }
    const buffer = await file.arrayBuffer();
    var fn = `${rootFolder}/${Date.now()}-${file.name}`;
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || "",
      Key: fn,
      Body: buffer,
      ContentType: file.mimetype, // Pastikan content type sesuai
      ACL: "public-read",
    });
    await s3Client.send(uploadCommand);

    var { parentId, idTraversal } = await FileSystemService.pathTraversal(path);
    var parentTraversal: string = "";
    for (const id of idTraversal) {
      //erase redis cache

      deleteBranch(`fs:list:${id}`);
      parentTraversal += `|${id}|`;
    }

    await FileSystemRepository.upsert(
      {
        name: file.name,
        cdn_url: fn,
        parent_id: parentId,
        parent_traversal: parentTraversal,
        file_size: file.size,
        type: FSType.FILE,
      } as any,
      transaction
    );

    return {
      url: fn,
      originalName: file.name,
      type: file.type,
      size: file.size,
    };
  }

  static async delete(fsID: number, transaction?: Transaction) {
    var item = await FileSystemRepository.findById(fsID);

    if (item?.type == FSType.FOLDER) {
      //delete the child first
      await FileSystemRepository.list(fsID, [FSType.FILE, FSType.FOLDER], true, 1, 10).iterate(
        async (row: FileIndex) => {
          if (row.type == FSType.FILE) {
            FileSystemService.delete(row.id!, transaction);
          } else {
            await FileSystemRepository.delete(row.id!);
          }
        }
      );
    } else if (item?.type == FSType.FILE) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET || "",
        Key: item.cdn_url || "",
      });
      await s3Client.send(deleteCommand);
    }
    //erase redis cache
    deleteBranch(`fs:list:${item?.parent_id}`);

    //then delete the parent
    await FileSystemRepository.delete(fsID);
  }
  static async rename(fsID: number, name: string, transaction?: Transaction) {
    var item = await FileSystemRepository.findById(fsID);
    //erase redis cache
    deleteBranch(`fs:list:${item?.parent_id}`);
    await FileSystemRepository.update(fsID, { name } as any, transaction);
  }
  static async createFolder(path: string, name: string, transaction?: Transaction) {
    const { parentId, idTraversal } = await FileSystemService.pathTraversal(path);
    var parentTraversal: string = "";
    for (const id of idTraversal) {
      deleteBranch(`fs:list:${id}`);
      parentTraversal += `|${id}|`;
    }
    //erase redis cache

    var itemExists = await FileSystemRepository.checkItemExists(parentId, name);
    if (itemExists) {
      throw new Error("Folder/File already exists");
    }
    await FileSystemRepository.upsert(
      {
        name: name,
        parent_id: parentId,
        parent_traversal: parentTraversal,
        type: FSType.FOLDER,
      } as any,
      transaction
    );
  }

  //   async createFile(
  //     name: string,
  //     type: "file" | "folder",
  //     parentId: string | null,
  //     size: number = 0
  //   ): Promise<File> {
  //     const file = new File(Date.now().toString(), name, type, parentId, size);
  //     return await this.fileRepository.save(file);
  //   }

  //   async deleteFile(id: string): Promise<void> {
  //     const file = await this.fileRepository.findById(id);
  //     if (!file) {
  //       throw new Error("File not found");
  //     }
  //     await this.fileRepository.delete(id);
  //   }
}
