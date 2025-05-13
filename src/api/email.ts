import type { ApiFunction } from "./client";
import ApiClient from "./client";

export const postEmailExists: ApiFunction<
  {
    email: string;
  },
  void
> = async (data) => {
  const response = await ApiClient.post("email-exists/" + data?.email);
  return response.data;
};

export const postEmailResendVerification: ApiFunction<
  {
    email: string;
  },
  void
> = async (data) => {
  const response = await ApiClient.post(
    "email/verification-notification",
    data
  );
  return response.data;
};

export const postSendEmail: ApiFunction<
  {
    email: string;
    subject: string;
    body: string;
  },
  void
> = async (data) => {
  const response = await ApiClient.post(
    `/api/emails/${data?.email}/send`,
    data
  );
  return response.data;
};
