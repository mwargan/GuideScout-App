import type { GuideProfile, User } from "@/types/user";
import ApiClient, { type ApiFunction } from "./client";
import type { Offer } from "@/types/offer";

export const getSelf: ApiFunction<void, User> = async () => {
  const response = await ApiClient.get("api/user");
  return response.data;
};

export const getCsrfToken: ApiFunction = async () => {
  await ApiClient.get("sanctum/csrf-cookie");
};

export const getUsers: ApiFunction<
  {
    params?: {
      attributes?: string[];
    };
  },
  User[]
> = async (data) => {
  const response = await ApiClient.get("api/users", data);
  return response.data;
};

export const getUser: ApiFunction<
  {
    userId: User["id"];
  },
  User
> = async (data) => {
  const response = await ApiClient.get(`api/users/${data?.userId}`);
  return response.data;
};

export const postUserLocation: ApiFunction<
  {
    userId: User["id"];
    latitude: number;
    longitude: number;
  },
  void
> = async (data) => {
  const response = await ApiClient.post(
    `api/users/${data?.userId}/locations`,
    data
  );
  return response.data;
};

export const putUserAttributes: ApiFunction<
  {
    userId: User["id"];
    attributeIds: string[];
  },
  void
> = async (data) => {
  const response = await ApiClient.put(
    `/api/users/${data?.userId}/attributes`,
    data
  );
  return response.data;
};

export const postVerifyUsersGuideProfile: ApiFunction<
  {
    guideProfileId: GuideProfile["id"];
  },
  void
> = async (data) => {
  const response = await ApiClient.post(
    `/api/guide-profiles/${data?.guideProfileId}/verify`
  );
  return response.data;
};

export const getUsersTours: ApiFunction<
  {
    userId: User["id"];
  },
  Offer[]
> = async (data) => {
  const response = await ApiClient.get(`/api/users/${data?.userId}/tours`);
  return response.data;
};

export const getUsersReferrals: ApiFunction<
  {
    userId: User["id"];
  },
  User[]
> = async (data) => {
  const response = await ApiClient.get(`/api/users/${data?.userId}/referrals`);
  return response.data;
};

export const getUsersCurrentTours: ApiFunction<
  {
    userId: User["id"];
  },
  Offer
> = async (data) => {
  const response = await ApiClient.get(
    `/api/users/${data?.userId}/tours/current`
  );
  return response.data;
};

export const getUsersTourOffers: ApiFunction<
  {
    userId: User["id"];
  },
  Omit<Offer & { offer_id: Offer["id"] }, "id">[]
> = async (data) => {
  const response = await ApiClient.get(
    `/api/users/${data?.userId}/tours/offers`
  );
  return response.data;
};
