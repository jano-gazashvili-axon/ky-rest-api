import ky from "ky";
import { NormalizedOptions } from "ky/distribution/types/options";
import { createBody } from "./create-body";
import { Mixed, TypeOf } from "io-ts";
import { handleStatus } from "./status-handler";

export type RestMethod =
  | "DELETE"
  | "GET"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT";

type RequestBody = Record<string, any>;

const globalAccessToken = "token";

const createHook = <T extends Mixed>(codec: T, type?: "json" | "file") => ({
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

const request =
  (method: RestMethod) =>
  (
    httpUrl: string,
    body?: RequestBody,
    init?: RequestInit,
    type?: "file" | "json"
  ) => ({
    decode: async <T extends Mixed>(codec: T) => {
      const json = (await ky(`https://fakestoreapi.com${httpUrl}`, {
        ...createBody(method, body),
        ...createHook(codec, type ?? "json"),
        ...init,
      }).json()) as TypeOf<typeof codec>;

      return json;
    },
  });

export const get = request("GET");
export const post = request("POST");
export const put = request("PUT");
export const patch = request("PATCH");
export const del = request("DELETE");
export const options = request("OPTIONS");
