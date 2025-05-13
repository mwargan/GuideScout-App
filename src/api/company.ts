import type { Offer, Tour } from "@/types/offer";
import type { ApiFunction } from "./client";
import ApiClient from "./client";
import type { Company } from "@/types/company";
import type { User } from "@/types/user";

export const getCompany: ApiFunction<
  {
    companyId: Company["id"];
  },
  Company
> = async (data) => {
  const response = await ApiClient.get(`/api/companies/${data?.companyId}`);
  return response.data;
};

export const getCompanyOffers: ApiFunction<
  {
    companyId: Company["id"];
  },
  Offer[]
> = async (data) => {
  const response = await ApiClient.get(
    `/api/companies/${data?.companyId}/offers`
  );
  return response.data;
};

export const getCompanyTours: ApiFunction<
  {
    companyId: Company["id"];
  },
  Tour[]
> = async (data) => {
  const response = await ApiClient.get(
    `/api/companies/${data?.companyId}/tours`
  );
  return response.data;
};

export const getCompanyTour: ApiFunction<
  {
    companyId: Company["id"];
    tourId: Tour["id"];
  },
  Tour
> = async (data) => {
  const response = await ApiClient.get(
    `/api/companies/${data?.companyId}/tours/${data?.tourId}`
  );
  return response.data;
};

export const getCompanyUsers: ApiFunction<
  {
    companyId: Company["id"];
    params?: {
      attributeIds?: number[];
      role?: string;
    };
  },
  User[]
> = async (data) => {
  const response = await ApiClient.get(
    `/api/companies/${data?.companyId}/users`,

    // Can remove below (and simplify to just data) when the API is updated
    {
      ...data,
      params: {
        ...data?.params,
        attributes: data?.params?.attributeIds,
      },
    }
  );
  return response.data;
};
