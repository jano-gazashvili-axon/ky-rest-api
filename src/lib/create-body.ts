import { RestMethod } from "./http-request";

export const createBody = (
  method: RestMethod,
  body: Record<string, any> | undefined
) => {
  if (method === "GET") {
    return {
      method,
    };
  }

  if (body === undefined) {
    return {
      method,
    };
  }

  const formData = new FormData();

  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value)) {
      for (const file of value) {
        formData.append(key, file);
      }
    } else {
      formData.append(key, value);
    }
  }

  return {
    body: formData,
    method,
  };
};
