import Hashids from "hashids";
// import mqttLib from "mqtt";
import fetch from "node-fetch";

import urlJoin from "url-join";
import * as cookie from "cookie";
import https from "https";
import sequelize, { Transaction } from "sequelize";
import { Sequelize, Model } from "sequelize";
import moment, { Moment } from "moment";
import fs from "fs";
import Global from "@/global";
import { Context } from "elysia";
export enum RequestParamType {
  formdata = "formdata",
  urlencoded = "urlencoded",
  jsonraw = "jsonraw",
}
export enum ResponseType {
  json = 1,
  plain_text = 2,
  blob = 3,
  raw_response = 4,
}
export interface HttpRequestServe {
  context: any;
  attributes: RequestOptions;
}
export interface RequestOptions {
  auth: Boolean;
  rolesAllowed?: number[];
  transaction?: Boolean;
}
export type TokenWrapper = {
  fid: string;
  at: Moment;
  id: number;
};
export interface ResponseOptions {
  authUser: any;
  deviceID?: string;
  transactions: Record<string, Transaction>;
  commit: () => Promise<void>;
  startTransaction: () => Promise<void>;
  rollback: () => Promise<void>;
}
export interface ResponseCallback {
  (json: any, opt: ResponseOptions): void;
}
export interface UserReqCarrier {
  genrated_at?: any;
  user_id?: number;
}

function processThrow(ex: any, retJson: any) {
  if (typeof ex === "string" || ex instanceof String) {
    retJson.message = ex;
  } else if (ex instanceof Error) {
    retJson.message = ex.message;
  } else if (ex instanceof Array) {
    retJson.message = ex[0];
    retJson.errorCode = ex[1];
  }
  retJson.success = false;
}

async function process_resp(context: Context, options: RequestOptions, callback: ResponseCallback) {
  var retJson: any = {};
  var optParams: ResponseOptions = {
    authUser: null,
    transactions: {},
    startTransaction: null as any,
    commit: null as any,
    rollback: null as any,
  };
  var trans: Record<string, Transaction> = {};
  var cons = Global().DBCon;
  try {
    optParams.startTransaction = async (): Promise<void> => {
      for (var con in cons) {
        var conn: Sequelize = Global().DBCon[con];

        var tr = await conn.transaction();
        trans[con] = tr;
      }
    };
    optParams.commit = async (): Promise<void> => {
      for (const con in trans) {
        const tr = trans[con];
        await tr.commit();
      }
    };
    optParams.rollback = async (): Promise<void> => {
      for (const con in trans) {
        const tr = trans[con];
        await tr.rollback();
      }
    };
    if (options.transaction == true) {
      await optParams.startTransaction();
    }

    try {
      optParams.transactions = trans;
      await callback(retJson, optParams);
      if (options.transaction == true) {
        optParams.commit();
      }

      retJson.success = true;
      // await NextCors(req, res, {
      //   // Options
      //   methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      //   origin: "*",
      //   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
      // });
      context.set.status = 200;
      return retJson;
    } catch (ex) {
      if (options.transaction == true) {
        optParams.rollback();
      }

      throw ex;
    }
  } catch (ex) {
    processThrow(ex, retJson);
    context.set.status = 200;
    return retJson;
  } finally {
  }
}
function createBody(data: any, paramsData: any) {
  var body = null;
  if (paramsData == 1) {
    body = new FormData();
    for (let key in data) {
      if (data[key] instanceof FileList) {
        for (let i = 0; i < data[key].length; i++) {
          body.append(key, data[key][i]);
        }
        // console.log(data[key]);
      } else {
        if (Array.isArray(data[key])) {
          for (let i = 0; i < data[key].length; i++) body.append(key, data[key][i]);
        } else {
          body.append(key, data[key]);
        }
      }
    }
  } else if (paramsData == 2) {
    // body = JSON.stringify(data);
    var formBody: Array<string> = [];
    for (var property in data) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(data[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }

    body = formBody.join("&");
  } else if (paramsData == 3) {
    body = JSON.stringify(data);
  }
  return body;
}
export const ENC = {
  encodeID: (id: any) => {
    const hashids = new Hashids("!@#%_TABLE)(*%^&_PASSWORD", 10);
    return hashids.encode(id);
  },
  decodeID: (value: string) => {
    try {
      const hashids = new Hashids("!@#%_TABLE)(*%^&_PASSWORD", 10);
      var ret = hashids.decode(value);

      if (Array.isArray(ret)) {
        if (ret.length == 0) throw "invalid id";
        return ret[0];
      }
      if (ret == undefined) throw "invalid id";
      return ret;
    } catch (ex) {
      throw "invalid id";
    }
  },
};

export const ResponseService = {
  post: async function (serve: HttpRequestServe, callback: ResponseCallback) {
    if (serve.attributes.transaction == undefined) serve.attributes.transaction = true;

    if (serve.context.request.method !== "POST") {
      serve.context.status = 405;
      return {
        message: "Only POST requests allowed",
        success: false,
      };
    } else {
      if (serve.attributes.auth == true) {
        //req.headers
      }
      return await process_resp(serve.context, serve.attributes, callback);
    }
  },
  get: async function (serve: HttpRequestServe, callback: ResponseCallback) {
    if (serve.attributes.transaction == undefined) serve.attributes.transaction = true;
    if (serve.context.request.method !== "GET") {
      serve.context.set.status = 405;
      return {
        message: "Only GET requests allowed",
        success: false,
      };
      return;
    } else {
      if (serve.attributes.auth == true) {
        //req.headers
      }
      await process_resp(serve.context, serve.attributes, callback);
    }
  },
};

export const http = {
  post: (
    url: string,
    data: Object,
    contentType: RequestParamType = RequestParamType.jsonraw,
    responseType: ResponseType = ResponseType.json
  ) => {
    return new Promise(async function (resolve, reject) {
      var body: any = null;

      var headers: any = {
        // 'Content-Type': multipart_formdata?'multipart/form-data;':'application/x-www-form-urlencoded',
        // "Accept": "applicaton/json",
      };

      if (contentType == RequestParamType.urlencoded) {
        //urlencoded
        body = createBody(data, 2);
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else if (contentType == RequestParamType.jsonraw) {
        headers["Content-Type"] = "application/json";

        body = createBody(data, 3);
      } else if (contentType == RequestParamType.formdata) {
        body = createBody(data, 1);
      }

      var finalURL = url;
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
      await fetch(finalURL, {
        method: "POST",
        headers: headers,
        body: body,
        agent: httpsAgent,
        // credentials: "include",
      })
        .then((response: any) => {
          if (responseType == ResponseType.json) {
            resolve(response.json());
          } else if (responseType == ResponseType.plain_text) {
            resolve(response.text());
          } else if (responseType == ResponseType.blob) {
            resolve(response.blob());
          } else if (responseType == ResponseType.raw_response) {
            resolve(response);
          } else {
            resolve(response.body);
          }
        })
        .then((data: any) => {
          resolve(data);
        })
        .catch((ex: any) => {
          reject(ex);
        });
    });
  },

  get: (url: string, params: Object, responseType: ResponseType = ResponseType.plain_text) => {
    return new Promise(async function (resolve, reject) {
      var body: any = null;

      var headers = {
        // 'Content-Type': multipart_formdata?'multipart/form-data;':'application/x-www-form-urlencoded',
        // "Accept": "applicaton/json",
      };
      function serialize(obj: any) {
        var str = [];
        for (var p in obj) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      }
      // if (contentType == RequestParamType.urlencoded) {
      //   //urlencoded
      //   body = createBody(data, 2);
      //   headers["Content-Type"] = "application/x-www-form-urlencoded";
      // } else if (contentType == RequestParamType.jsonraw) {
      //   headers["Content-Type"] = "application/json";

      //   body = createBody(data, 3);
      // } else if (contentType == RequestParamType.formdata) {
      //   body = createBody(data, 1);
      // }

      var finalURL = url;

      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });

      if (params != null) finalURL = finalURL + "?" + serialize(params);
      await fetch(finalURL, {
        method: "GET",
        headers: headers,
        body: body,
        agent: httpsAgent,
        // credentials: "include",
      })
        .then((response: any) => {
          if (responseType == ResponseType.json) {
            resolve(response.json());
          } else if (responseType == ResponseType.plain_text) {
            resolve(response.text());
          } else if (responseType == ResponseType.blob) {
            resolve(response.blob());
          } else if (responseType == ResponseType.raw_response) {
            resolve(response);
          }
        })
        .then((data: any) => {
          resolve(data);
        })
        .catch((ex: any) => {
          reject(ex);
        });
    });
  },
};
export default {
  ENC: ENC,
  getSequelize(connectorName: string): Sequelize {
    if (connectorName in Global().DBCon) {
      var con: Sequelize = Global().DBCon[connectorName];
      return con;
    }
    throw "Connector not found";
  },
  apiserve: ResponseService,
  http: http,
};
