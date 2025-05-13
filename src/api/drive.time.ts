import type { ApiFunction } from "./client";
import ApiClient from "./client";

export const getDriveTime: ApiFunction<
  {
    origin: {
      lat: number;
      lng: number;
    };
    destination: {
      lat: number;
      lng: number;
    };
  },
  number
> = async (data) => {
  const url = `/api/drive-time?origin[latitude]=${data?.origin.lat}&origin[longitude]=${data?.origin.lng}&destination[latitude]=${data?.destination.lat}&destination[longitude]=${data?.destination.lng}`;

  const response = await ApiClient.get(url);
  return response.data;
};

export const getDriveInfo: ApiFunction<
  {
    origin: {
      lat: number;
      lng: number;
    };
    destination: {
      lat: number;
      lng: number;
    };
  },
  {
    meters: number;
    minutes: number;
    // Path is a linestring so a list of coordinates
    path?: {
      lat: number;
      lng: number;
    }[];
  }
> = async (data) => {
  const url = `/api/drive-data?origin[latitude]=${data?.origin.lat}&origin[longitude]=${data?.origin.lng}&destination[latitude]=${data?.destination.lat}&destination[longitude]=${data?.destination.lng}`;

  const response = await ApiClient.get(url);
  return response.data;
};
