import { Elysia } from "elysia";
import { glob } from "glob";
import { Sequelize } from "sequelize";
import { DatabaseConfig } from "./config";
import Global from "./src/global";
import { cors } from "@elysiajs/cors";
import { resolve } from "path";
import { createClient } from "redis";
(await import("dotenv")).config();
var AppData = Global();
AppData.DBCon = {};

/**
 * Fungsi ini digunakan untuk membaca konfigurasi dan melakukan koneksi ke server database.
 * Koneksi yang berhasil akan disimpan dalam Global untuk dibaca oleh sistem ORM.
 */
async function init_database() {
  for (const connectionName in DatabaseConfig) {
    var conf = (DatabaseConfig as any)[connectionName];
    var constr = `${conf.engine}://${conf.user}:${conf.password}@${conf.host}:${conf.port}/${conf.name}`;
    try {
      const sequelize = new Sequelize(constr, {
        logging: false,
        define: {
          freezeTableName: true,
        },
        pool: {
          max: 20,
          min: 2,
          acquire: 60000,
          idle: 10000,
        },
        // charset: "utf8mb4",
      });
      await sequelize.authenticate();
      Global().DBCon[connectionName] = sequelize; // Simpan koneksi ke Global
    } catch (error) {
      console.log(`gagal terhubung ke database ${constr}`, error);
    }
  }
}

async function init_routes() {
  const app = new Elysia().use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      // credentials: true,

      allowedHeaders: ["Content-Type", "Authorization", "Accept", "token"],
    })
  );

  const files = glob.sync("./src/rest/**/*.api.ts");
  await Promise.all(
    files.map(async (file) => {
      const api = await import("./" + file);
      if (api.methods.includes("GET")) app.get(api.endpoint, api.default);
      if (api.methods.includes("POST")) app.post(api.endpoint, api.default);
    })
  );

  app.listen(process.env.PORT || 3000);
  console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`);
}

async function init_redis() {
  const redisUrl = `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
  const redis = createClient({
    url: redisUrl,
  });
  await redis.connect();
  console.log("Redis connected");
  Global().redis = redis as any;
}

await init_database();
await init_routes();
await init_redis();
