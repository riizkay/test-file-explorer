import file_index, { FileIndex } from "@/rest/model/storage/file_index";
export type { FileIndex } from "@/rest/model/storage/file_index";
import Pagination, { PaginationInterface } from "@/common/pagination";
import core from "@/common/core";
import { Sequelize, Transaction } from "sequelize";
import { FSType } from "@shared/types";

export class FileSystemRepository {
  static list(
    parentId: number,
    type: FSType | FSType[],
    recursive: boolean,
    page: number,
    limit: number,
    search?: string
  ): PaginationInterface<FileIndex> {
    var query: any = {
      where: {
        deleted: 0,
      },
    };
    if (recursive) {
      query.where.parent_traversal = { [Sequelize.Op.like]: `%|${parentId}|%` };
    } else {
      query.where.parent_id = parentId;
    }
    if (search) {
      query.where.name = { [Sequelize.Op.like]: `%${search}%` };
    }

    if (type) {
      if (Array.isArray(type)) query.where.type = { [Sequelize.Op.in]: type };
      else query.where.type = type;
    }

    return Pagination.sequelize<FileIndex>(file_index, limit, page, query);
  }

  static async getFolderByName(parentId: number | null, name: string) {
    var query: any = { where: { parent_id: parentId, type: FSType.FOLDER, deleted: 0 } };
    query.where.name = name;
    return await file_index.findOne(query);
  }
  static async countFolders(parentId: number) {
    var query: any = { where: { parent_id: parentId, type: FSType.FOLDER, deleted: 0 } };
    return await file_index.count(query);
  }
  static async findById(fsID: number): Promise<FileIndex | null> {
    return await file_index.findByPk(fsID);
  }
  static async upsert(record: FileIndex, transaction?: Transaction) {
    await file_index.upsert(record, { transaction });
  }
  static async delete(fsID: number, transaction?: Transaction) {
    await file_index.destroy({ where: { id: fsID }, transaction });
  }
  static async update(fsID: number, record: FileIndex, transaction?: Transaction) {
    var updateRecord: any = { ...record };
    await file_index.update(updateRecord, { where: { id: fsID }, transaction });
  }
  static async checkItemExists(parentId: number | null, name: string) {
    var query: any = { where: { parent_id: parentId, name: name, deleted: 0 } };
    query.where.name = name;
    return await file_index.count(query);
  }
}
