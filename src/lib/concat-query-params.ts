
export const concatQueryParams = (
    url: string,
    params?: URLSearchParams
  ): string => {
    if (params === undefined) {
      return url;
    }
    const paramsString = params.toString();
    return paramsString.length === 0 ? url : `${url}?${paramsString}`;
  };