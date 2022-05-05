import { isLeft } from "fp-ts/lib/Either";
import { Mixed } from "io-ts";
import { isRequestError, requestError } from "./error";

export const handleStatus = async <T extends Mixed>(
  response: Response,
  codec: T
) => {
  try {
    if (response.status === 401) {
      window.location.reload();
    }

    if (response.status >= 500) {
      throw requestError({
        response,
        type: "server",
      });
    }

    if (response.status >= 400) {
      try {
        const error = await response.json();

        throw requestError({
          type: "client",
          response,
          code: error.code,
          message: error.message,
        });
      } catch (error) {
        if (isRequestError(error)) {
          throw error;
        }

        if (error instanceof Error) {
          throw requestError({
            error,
            response,
            type: "parse_json",
          });
        }

        throw error;
      }
    }
    if (codec.name !== "null") {
      if (isLeft(codec.decode(await response.json())))
        throw requestError({
          json: response,
          message: "Failed to decode",
          type: "decode_body",
        });
    }
  } catch (error) {
    if (isRequestError(error)) {
      throw error;
    }

    if (error instanceof Error) {
      throw requestError({
        error,
        type: "network",
      });
    }

    throw error;
  }
};
