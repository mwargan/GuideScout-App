import type { ApiFunction } from "./client";
import ApiClient from "./client";
import type { Offer, Pax } from "@/types/offer";

export const getOfferPassenger: ApiFunction<
  {
    offerId: number;
    paxId: number;
  },
  Pax
> = async (data) => {
  const response = await ApiClient.get(
    `/api/offers/${data?.offerId}/passengers/${data?.paxId}`
  );
  return response.data;
};

export const postOffer: ApiFunction<
  {
    companyId: number;
    hourly_rate_eur_cents: number;
    total_cost: number;
    starts_at: string;
    company_tour_id: string;
    payment_amount: number;
    required_attribute_ids: never[];
    guide_ids: never[];
    description: string;
  },
  Offer
> = async (data) => {
  const response = await ApiClient.post(
    `api/companies/${data?.companyId}/offers`,
    data
  );
  return response.data;
};

export const getOffer: ApiFunction<
  {
    offerId: number;
  },
  Offer
> = async (data) => {
  const response = await ApiClient.get(`/api/offers/${data?.offerId}`);
  return response.data;
};

export const getOffers: ApiFunction<
  {
    companyId: number;
  },
  Offer[]
> = async (data) => {
  const response = await ApiClient.get(
    `/api/companies/${data?.companyId}/offers`
  );
  return response.data;
};

export const deleteOffer: ApiFunction<
  {
    offerId: number;
  },
  void
> = async (data) => {
  const response = await ApiClient.delete(`/api/offers/${data?.offerId}`);
  return response.data;
};

export const postAcceptOffer: ApiFunction<
  {
    offerId: number;
    userId: number;
  },
  void
> = async (data) => {
  const response = await ApiClient.post(
    `/api/users/${data?.userId}/tours/offers/${data?.offerId}/accept`
  );
  return response.data;
};
