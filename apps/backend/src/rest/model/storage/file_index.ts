import { FSType } from "@shared/types";
import base from "../base";
import Sequelize, { Model } from "sequelize";
export type FileIndex = typeof Model & {
  id?: number;
  name: string;
  parent_id: number | null;
  cdn_url?: string | null;
  file_size?: number;
  parent_traversal: string;
  type: FSType;
  deleted?: number;
};
var model = base({
  connection: "infokes_test",
  model: "file_index",
  attributes: {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(260),
      allowNull: false,
      collate: "utf8mb4_general_ci",
    },
    parent_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
    cdn_url: {
      type: Sequelize.STRING(260),
      allowNull: true,
    },
    type: {
      type: Sequelize.TINYINT,
      allowNull: false,
      references: {
        model: "index_type",
        key: "id",
      },
    },
    file_size: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
    parent_traversal: {
      type: Sequelize.STRING(400),
      allowNull: true,
      collate: "utf8mb4_general_ci",
    },
    deleted: {
      type: Sequelize.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
  },
  options: {
    timestamps: true,
    createdAt: "created_at", // Custom name for createdAt
    updatedAt: "updated_at", // Custom name for updatedAt
    indexes: [
      {
        unique: true,
        fields: ["name", "parent_id"],
        name: "unique_name_parent_id",
      },
      {
        fields: ["deleted"],
        name: "deleted_index",
      },
      {
        fields: ["parent_traversal"],
        name: "parent_traversal_index",
      },
    ],
  },
});
export const DefaultRecord = [
  {
    id: 1,
    name: "#Root",
    parent_id: null,
    cdn_url: null,
    type: 2,
  },
];
export default model;
