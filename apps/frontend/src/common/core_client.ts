import urlJoin from "url-join";
import moment, { type Moment } from "moment-timezone";
import "moment/locale/id.js";
import axios from "axios";
import { type RestApiResponse } from "@shared/types";
// import mqttLib, { MqttClient } from "mqtt";
moment.locale("id");

// const dev = process.env.NODE_ENV !== "production";
// export interface MQTTInstance {
//   client?: MqttClient;
//   clientId?: string;
// }
export enum RequestParamType {
  formdata = "formdata",
  urlencoded = "urlencoded",
  jsonraw = "jsonraw",
}
export enum URLSource {
  file_delivery = 1,
  app_api = 2,
  none = 0,
}
export enum ResponseType {
  json = 1,
  plain_text = 2,
  blob = 3,
  raw_response = 4,
}
// var mqttInstance: MQTTInstance | any = null;

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

export const API = {
  post: function <T>(
    url: string,
    data?: Object,
    contentType: RequestParamType = RequestParamType.jsonraw,
    urlSource: URLSource = URLSource.app_api,
    responseType: ResponseType = ResponseType.json
  ) {
    return new Promise<RestApiResponse<T>>(async function (resolve) {
      var body = null;

      var token = await Core.Storage.get("token");
      // var fid = await Common.getVisitorID();
      var headers: any = {
        // fid: fid,
        // 'Content-Type': multipart_formdata?'multipart/form-data;':'application/x-www-form-urlencoded',
        // "Accept": "applicaton/json",
      };
      if (token != null) {
        headers["token"] = token;
      }
      if (contentType == RequestParamType.urlencoded) {
        //urlencoded
        if (data) body = createBody(data, 2);
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else if (contentType == RequestParamType.jsonraw) {
        headers["Content-Type"] = "application/json";
        if (data) body = createBody(data, 3);
      } else if (contentType == RequestParamType.formdata) {
        if (data) body = createBody(data, 1);
      }

      var base: any = Core.Common.getURLSource(urlSource);

      var finalURL = urlJoin(base, url);
      fetch(finalURL, {
        method: "POST",
        headers: headers,
        body: body,
      } as any)
        .then(async (response) => {
          if (responseType == ResponseType.json) {
            //
            if (response.status == 429) {
              var text = await response.text();
              var m = { statusCode: response.status, message: text, success: false };

              resolve(m as any);
              return;
            }
            var json = await response.json();
            resolve(json);
          } else if (responseType == ResponseType.plain_text) {
            resolve(response.text() as any);
          } else if (responseType == ResponseType.blob) {
            resolve(response.blob() as any);
          } else if (responseType == ResponseType.raw_response) {
            resolve(response as any);
          }
        })
        .then((data) => {
          resolve(data as any);
        })
        .catch(() => {
          if (responseType == ResponseType.json) {
            //  resolve("Something went wrong");
          }
          // reject(ex);
        });
    });
  },

  get: function (
    url: string,
    params: Object,
    urlSource: URLSource = URLSource.app_api,
    responseType: ResponseType = ResponseType.plain_text
  ) {
    return new Promise(async function (resolve, reject) {
      var body = null;

      var token = await Core.Storage.get("token");
      // var fid = await Common.getVisitorID();
      var headers: any = {
        // 'Content-Type': multipart_formdata?'multipart/form-data;':'application/x-www-form-urlencoded',
        // "Accept": "applicaton/json",
      };
      if (token != null) {
        headers["token"] = token;
      }
      function serialize(obj: any) {
        var str = [];
        for (var p in obj) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      }

      var finalURL = urlJoin(Core.Common.getURLSource(urlSource) as any, url);
      if (params != null) finalURL = finalURL + "?" + serialize(params);

      await fetch(finalURL, {
        method: "GET",
        headers: headers,
        body: body,
        credentials: "include",
        // credentials: "include",
      })
        .then((response: Response) => {
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
        .then((data) => {
          resolve(data);
        })
        .catch((ex) => {
          reject(ex);
        });
    });
  },
};
export enum ThumbnailSize {
  Original = "",
  p100 = 100,
  p300 = 300,
  p500 = 500,
  p800 = 800,
}
export const CDN = {
  thumbnail: (url: string, displayWidth: number): string => {
    const determineBestFitSize = (displayWidth: number): ThumbnailSize => {
      const availableSizes = [
        ThumbnailSize.p100,
        ThumbnailSize.p300,
        ThumbnailSize.p500,
        ThumbnailSize.p800,
      ];

      // Find the smallest size that is greater than or equal to the display width
      for (const size of availableSizes) {
        if (Number(size) >= displayWidth) {
          return size;
        }
      }

      // If no size is big enough, fallback to the largest available size
      return ThumbnailSize.Original;
    };
    // Determine the best fit size dynamically
    const bestFitSize = determineBestFitSize(displayWidth);

    // Extract file name and extension
    const fileName = url?.substring(0, url?.lastIndexOf(".")) || url;
    const ext = url?.split(/[#?]/)[0]?.split(".").pop()?.trim();

    // Construct the thumbnail URL
    const thumbnailURL =
      bestFitSize !== ThumbnailSize.Original ? `${fileName}_${bestFitSize}.${ext}` : url;

    return thumbnailURL;
  },
  upload_file: function (url: any, files: any, data: any, onUploadProgress: any = null) {
    return new Promise(async function (resolve, reject) {
      var body = null;
      var token = await Core.Storage.get("cdt");
      var headers = {
        // 'Content-Type': 'multipart/form-data',
        token: token,
      };
      body = createBody({ file: files, ...data }, 1);
      // console.log(body, "aaaaaaaa");
      const instance = axios.create({
        withCredentials: false,
      });
      instance
        .post(urlJoin(import.meta.env.VITE_API_URL as any, url), body, {
          headers: headers,
          onUploadProgress: (progressEvent) => {
            if (onUploadProgress) onUploadProgress(progressEvent);
            //   const progress = (progressEvent.loaded / progressEvent.total) * 50;
            //   setProgress(progress);
          },
          onDownloadProgress: (progressEvent: any) => {
            progressEvent;
            //   const progress = 50 + (progressEvent.loaded / progressEvent.total) * 50;
            //   console.log(progress);
            //   setProgress(progress);
          },
        })
        .then((resp) => {
          // console.log(resp.data,'aaaaaaaaaaaqqqqqqq');
          resolve(resp.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  upload_image: function (image: any) {
    return new Promise(async function (resolve, reject) {
      var body = null;
      var token = await Core.Storage.get("cdt");
      var headers: any = {
        // 'Content-Type': multipart_formdata?'multipart/form-data;':'application/x-www-form-urlencoded',
        // "Accept": "applicaton/json",
        token: token,
      };
      body = createBody({ file: image }, 1);
      await fetch(urlJoin(import.meta.env.VITE_API_URL as any, "/api/cdn/upload_image"), {
        method: "POST",
        headers: headers,
        body: body,
      })
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch((ex) => {
          reject(ex);
        });
    });
  },
  delete_image: function (paths: any) {
    return new Promise(async function (resolve, reject) {
      var body = null;
      var token = await Core.Storage.get("cdt");
      var headers: any = {
        token: token,
        "Content-Type": "application/json",
      };
      if (typeof paths === "string" || paths instanceof String) paths = [paths];

      body = createBody({ paths: paths }, 3);
      await fetch(urlJoin(import.meta.env.VITE_API_URL as any, "delete_image"), {
        method: "POST",
        headers: headers,
        body: body,
      })
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch((ex) => {
          reject(ex);
        });
    });
  },
};
export const Storage = {
  set: async (key: string, value: any) => {
    // if (Capacitor.isNativePlatform()) {
    // 	await Preferences.set({
    // 		key: key,
    // 		value: value,
    // 	});
    // } else {
    localStorage.setItem(key, value);
    // }
  },
  get: async (key: string) => {
    // if (Capacitor.isNativePlatform()) {
    // 	console.log("****", key);
    // 	const { value } = await Preferences.get({
    // 		key: key,
    // 	});
    // 	return value;
    // } else {
    var data = localStorage.getItem(key);
    return data;
    // }
  },
  clear: async () => {
    // if (Capacitor.isNativePlatform()) {
    // 	await Preferences.clear();
    // } else {
    localStorage.clear();
    // }
  },
  remove: async (key: string) => {
    // if (Capacitor.isNativePlatform()) {
    // await Preferences.remove({ key: key });
    // } else {
    localStorage.removeItem(key);
    // }
  },
};
export const Common = {
  concatPaths: (...paths: string[]): string => {
    return paths
      .filter(Boolean) // Remove any empty or undefined paths
      .map((path) => path.replace(/^\/+|\/+$/g, "")) // Trim leading/trailing slashes
      .join("/"); // Join with a single slash
  },
  formatRupiah(amount: number): string {
    let formatted = "Rp. " + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
    return formatted.endsWith(".00") ? formatted.slice(0, -3) : formatted;
  },
  getURLSource(source: URLSource): string | undefined {
    if (source == URLSource.app_api) {
      return import.meta.env.VITE_API_URL;
    } else if (source == URLSource.file_delivery) {
      return import.meta.env.VITE_CDN_URL;
    } else if (source == URLSource.none) {
      return undefined;
    } else {
      throw "URI must be specific";
    }
  },
  getBase64Input: (file: any) => {
    return new Promise(async function (resolve, reject) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function (error) {
        reject(error);
      };
    });
  },
  propperCase: (text: string) =>
    text.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }),
  Time: {
    wib: (v: Moment, dateOnly = false) =>
      dateOnly == false
        ? moment(v).tz("Asia/Jakarta").lang("en").format("MMMM DD, YYYY HH:mm")
        : moment(v).tz("Asia/Jakarta").lang("en").format("DD MMMM  YYYY"),
    local: (v: Moment, dateOnly = false) =>
      dateOnly == false
        ? moment(v).local().format("MMMM DD, YYYY HH:mm")
        : moment(v).local().format("DD MMMM  YYYY"),
    utc: (v: Moment, dateOnly = false) =>
      dateOnly == false
        ? moment(v).tz("UTC").lang("en").format("MMMM DD, YYYY HH:mm")
        : moment(v).tz("UTC").lang("en").format("DD MMMM  YYYY"),
    shortdate: (v: Moment) => moment.utc(v).tz("Asia/Jakarta").format("YYYY-MM-DD "),
    dateOnly: (v: Moment) => moment.utc(v).tz("Asia/Jakarta").format("DD MMMM YYYY "),
    fromNow: (v: Moment) => moment.utc(v).tz("Asia/Jakarta").fromNow(true),
  },
};
export const Core = {
  Common,
  Storage,
  CDN,
  redirect: async (url: string) => {
    window.location.replace(url);
  },
  API,
};

export default Core;
