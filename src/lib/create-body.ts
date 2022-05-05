import { RequestBody, RestMethod } from "./http-request";

export const createBody = (
  method: RestMethod,
  body?: RequestBody,
  type?: 'json' | 'file'
) => {
  if (method === "GET") return {method}

  if(body === undefined) return {method}

  if(type === 'json') return {
    body: JSON.stringify(body) as BodyInit,
    method,
  };

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
