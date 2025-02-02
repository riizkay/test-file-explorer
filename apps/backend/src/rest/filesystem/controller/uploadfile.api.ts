// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Elysia, Context } from "elysia";
import Core, { ResponseOptions } from "@/common/core";
import moment from "moment";
import { FileSystemService } from "../service/filesystem.service";
import Global from "@/global";

import { FileSystemListResponse, RestApiResponse, FSType } from "@shared/types";
const attributes = { transaction: true, auth: false };
export const endpoint = "/api/filesystem/uploadfile";
export const methods = ["POST"];

export default async (context: Context): Promise<RestApiResponse<any>> => {
  return await Core.apiserve.post({ context, attributes }, async (json, opt: ResponseOptions) => {
    var body: any = context.body;
    const file = (context.body as any).file; // Elysia automatically parses file

    const result = await FileSystemService.uploadFile(file, body.path);
    json.data = result;
    // json.data = result;
  });
};
