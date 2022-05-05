import ky from "ky";
import { NormalizedOptions } from "ky/distribution/types/options";
import { createBody } from "./create-body";
import { Mixed, TypeOf, null as nil } from "io-ts";
import { handleStatus } from "./status-handler";

export type RestMethod =
  | "DELETE"
  | "GET"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT";

export type RequestType = "json" | "file" | "blob";
export type RequestBody = Record<string, any>;

const globalAccessToken = "token";

const createHook = <T extends Mixed>(codec: T, type?: RequestType) => ({
  hooks: {
    beforeRequest: [
      (request: Request) => {
        request.headers.set("x-rt", "refresh_token");
        request.headers.set("Authorization", `Bearer ${globalAccessToken}`);
        request.headers.set("Accept-Language", "en-US");
        if (type === "json") {
          request.headers.set("Content-Type", "application/json");
        }
      },
    ],
    afterResponse: [
      async (
        _request: Request,
        _options: NormalizedOptions,
        response: Response
      ) => handleStatus(response, codec),
    ],
  },
});

//if endpoint has prefix url ex: /api
const prefixUrl = "";

//in real situation we have 1, i just used it because of different endpoint for files

const fileUri = "https://ky-test-app.herokuapp.com/api";
const baseUri = "https://fakestoreapi.com";

const request =
  (method: RestMethod) =>
  (httpUrl: string, body?: RequestBody, init?: RequestInit) => {
    const goHttp = (codec: Mixed, type: RequestType) => {
      //it will be removed when API will be one
      const isFileOrBlob = type === "file" || type === "blob";

      return ky(`${isFileOrBlob ? fileUri : baseUri}${httpUrl}`, {
        ...createBody(method, body, type),
        ...createHook(codec, type),
        ...init,
        prefixUrl,
      });
    };
    return {
      decode: <T extends Mixed>(codec: T) => ({
        json: async () => goHttp(codec, "json").json() as TypeOf<typeof codec>,
        file: async () => goHttp(codec, "file").json() as TypeOf<typeof codec>,
      }),
      blob: () => goHttp(nil, "blob").blob(),
    };
  };

export const get = request("GET");
export const post = request("POST");
export const put = request("PUT");
export const patch = request("PATCH");
export const del = request("DELETE");
export const options = request("OPTIONS");
