import base from "../base";
import Sequelize from "sequelize";

var model = base({
  connection: "infokes_test",
  model: "index_type",
  attributes: {
    id: {
      type: Sequelize.TINYINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(150),
      allowNull: false,
    },
  },
  options: {
    timestamps: false,
  },
});
export const DefaultRecord = [
  {
    id: 1,
    name: "File",
  },
  {
    id: 2,
    name: "Folder",
  },
];
export default model;
