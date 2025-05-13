import type { Deal } from "@/types/deal";
import type { ApiFunction } from "./client";
import ApiClient from "./client";

export const getDeals: ApiFunction<void, Deal[]> = async () => {
  const response = await ApiClient.get("api/deals");
  return response.data;
};
