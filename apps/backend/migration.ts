import { Elysia } from "elysia";
import { glob } from "glob";
import { Sequelize } from "sequelize";
import { DatabaseConfig } from "./config";
import Global from "./src/global";
import { join } from "path";
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
const migration = async () => {
  const files = glob.sync(join(__dirname, "./src/rest/model/**/*.ts"));
  await Promise.all(
    files.map(async (file) => {
      if (file.includes("base.ts")) return;
      const modelFile = await import("./" + file);
      const model = modelFile.default;
      console.log(file, model);
      var createdRows: any = 0;
      await model.sync({ alter: true });
      if (modelFile.DefaultRecord !== undefined) {
        const DefaultRecord = modelFile.DefaultRecord;
        createdRows = await model.bulkCreate(DefaultRecord, {
          ignoreDuplicates: true,
        });
        createdRows = createdRows.length;
      }
      console.log(`Synchronize ${model.getTableName()} done, ${createdRows} records Synchronized`);
    })
  );
  console.log("Migration success");
};

await init_database();
await migration();
