import type { Location } from "@/types/tour";
import type { ApiFunction } from "./client";
import ApiClient from "./client";

export const getLocation: ApiFunction<
  {
    id: Location["id"];
  },
  Location
> = async (data) => {
  const response = await ApiClient.get(`/api/locations/${data?.id}`);
  return response.data;
};

export const getLocationByCoordinates: ApiFunction<
  {
    lat: Location["latitude"];
    lng: Location["longitude"];
  },
  Location
> = async (data) => {
  const url = `/api/locations?lat=${data?.lat}&lon=${data?.lng}`;

  const response = await ApiClient.get(url);
  return response.data;
};
