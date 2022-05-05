import ky from "ky";
import { NormalizedOptions } from "ky/distribution/types/options";
import { createBody } from "./create-body";
import { Mixed, TypeOf } from "io-ts";
import { handleStatus } from "./status-handler";

export type Codec<T extends Mixed> = T
export type RestMethod =
  | "DELETE"
  | "GET"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT";

export type RequestBody = Record<string, any>;

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


//if endpoint has prefix url ex: /api
const prefixUrl = ""

//in real situation we have 1, i just used it because of different endpoint for files

const fileUri = 'https://ky-test-app.herokuapp.com/api'
const baseUri = 'https://fakestoreapi.com'

const request =
  (method: RestMethod) =>
  (
    httpUrl: string,
    body?: RequestBody,
    init?: RequestInit,
  ) => ({
    decode: <T extends Mixed>(codec: T) => {

      const goHttp = async (codec: Mixed, type: 'file'| 'json') => {
        const json = await ky(`${type === 'file' ? fileUri : baseUri}${httpUrl}`, {
          ...createBody(method, body, type),
          ...createHook(codec, type),
          ...init,
          prefixUrl,
        }).json() as TypeOf<typeof codec>
        return json
      }

      return {
        json: async () => goHttp(codec, 'json') as TypeOf<typeof codec>,
        file: async () => goHttp(codec, 'file') as TypeOf<typeof codec>

        //with blob work in progress
      }
    }
  })

export const get = request("GET");
export const post = request("POST");
export const put = request("PUT");
export const patch = request("PATCH");
export const del = request("DELETE");
export const options = request("OPTIONS");
