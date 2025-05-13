import type { Attribute } from "@/types/tour";
import type { ApiFunction } from "./client";
import ApiClient from "./client";

export const getAttributes: ApiFunction<void, Attribute[]> = async () => {
  const response = await ApiClient.get("api/attributes");
  return response.data;
};

export const postAttribute: ApiFunction<
  {
    name: string;
    type: string;
  },
  void
> = async (data) => {
  const response = await ApiClient.post("api/attributes", data);
  return response.data;
};

export const postViaSignedUrl: ApiFunction<
  {
    url: string;
    signature: string;
  },
  void
> = async (data) => {
  const response = await ApiClient.post(
    data?.url + "&signature=" + data?.signature
  );
  return response.data;
};
