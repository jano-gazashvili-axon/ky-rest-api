import { isRight } from "fp-ts/lib/Either";
import * as t from "io-ts";

export type RequestErrorClient = {
  type: "client";
  response: Response;
  message: string;
  code?: string;
};

export type RequestError =
  | RequestErrorClient
  | {
      type: "decode_headers";
      headers: Record<string, string>;
      message: string;
    }
  | { type: "decode_body"; json: unknown; message: string }
  | { type: "network"; error: TypeError }
  | { type: "parse_blob"; response: Response; error: Error }
  | { type: "parse_json"; response: Response; error: Error }
  | { type: "server"; response: Response };

const TRequestError = t.type({
  _isRequestError: t.literal(true),
});

export const isRequestError = (error: unknown): error is RequestError => {
  return isRight(TRequestError.decode(error));
};

export const isClientError = (error: unknown): error is RequestErrorClient => {
  return isRequestError(error) && error.type === "client";
};

export const requestError = (
  error: RequestError
): RequestError & { _isRequestError: true } => {
  return {
    _isRequestError: true,
    ...error,
  };
};
