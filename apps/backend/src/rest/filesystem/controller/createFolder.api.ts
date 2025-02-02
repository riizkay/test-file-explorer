// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Elysia, Context } from "elysia";
import Core, { ResponseOptions } from "@/common/core";
import moment from "moment";
import { FileSystemService } from "../service/filesystem.service";
import Global from "@/global";
import { FileSystemListResponse, RestApiResponse, FSType } from "@shared/types";
import file_index from "@/rest/model/storage/file_index";
const attributes = { transaction: true, auth: false };
export const endpoint = "/api/filesystem/createFolder";
export const methods = ["POST"];
export default async (context: Context): Promise<RestApiResponse<FileSystemListResponse>> => {
  return await Core.apiserve.post({ context, attributes }, async (json, opt: ResponseOptions) => {
    var body: any = context.body;
    var transaction = opt.transactions[file_index.connection];

    await FileSystemService.createFolder(body.path, body.name, transaction);

    // json.data = result;
  });
};
