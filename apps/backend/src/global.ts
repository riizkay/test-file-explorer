//digunakan untuk global variable server side
import { Sequelize } from "sequelize";
import { RedisClientType, SetOptions } from "redis";
export type AppServerData = {
  DBCon: Record<string, Sequelize>;
  redis: RedisClientType;
};
export default (): AppServerData => {
  if (!(global as any).AppServerData) {
    (global as any).AppServerData = {
      DBCon: {},
      redis: null,
    };
  }
  return (global as any).AppServerData;
};
