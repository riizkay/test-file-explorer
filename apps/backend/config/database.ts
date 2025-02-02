export const default_user = "modules/model/users/users.ts";
export default {
  infokes_test: {
    engine: "mysql",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    name: process.env.DB_NAME,
  },
};
