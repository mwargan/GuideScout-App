import type { PersonalAccessToken, User } from "@/types/user";
import ApiClient, { type ApiFunction } from "./client";

export const getSelf: ApiFunction<void, User> = async () => {
  const response = await ApiClient.get("api/user");
  return response.data;
};

export const getUserPaymentIntent: ApiFunction<
  void,
  {
    client_secret: string;
  }
> = async () => {
  const response = await ApiClient.get("user/payment-intent");
  return response.data;
};

export const getUserPaymentMethods: ApiFunction = async () => {
  const response = await ApiClient.get("/user/payment-methods");
  return response.data;
};

export const getUserShouldConfirmPassword: ApiFunction<
  void,
  {
    confirmed: boolean;
  }
> = async () => {
  const response = await ApiClient.get("user/confirmed-password-status");
  return response.data;
};

export const getUserPersonalAccessTokens: ApiFunction<
  void,
  PersonalAccessToken[] | string
> = async () => {
  const response = await ApiClient.get("/user/personal-access-tokens");
  return response.data;
};

export const putUserProfileInformation: ApiFunction<
  {
    name: string;
    surname: string;
    email: string;
    phone: string;
  },
  User
> = async (data) => {
  const response = await ApiClient.put("user/profile-information", data);
  return response.data;
};

export const postPersonalAccessToken: ApiFunction<
  {
    name: string;
    scopes: string[];
  },
  PersonalAccessToken
> = async (data) => {
  const response = await ApiClient.post("/user/personal-access-tokens", data);
  return response.data;
};

export const postUserSendPhoneOtpCode: ApiFunction = async () => {
  const response = await ApiClient.post(`user/send-phone-otp`);
  return response.data;
};

export const postUserVerifyPhoneOtpCode: ApiFunction<
  {
    otp: string;
  },
  void
> = async (data) => {
  const response = await ApiClient.post<void>(`user/verify-phone-otp`, data);
  return response.data;
};

export const postUserUploadCv: ApiFunction<FormData, void> = async (data) => {
  const response = await ApiClient.post(`user/upload-cv`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const postPaymentMethod: ApiFunction<
  {
    paymentMethodId: string;
  },
  void
> = async (data) => {
  const response = await ApiClient.post<void>("user/payment-methods", data);
  return response.data;
};

export const postUserConfirmPassword: ApiFunction<
  { password: string },
  void
> = async (data) => {
  const response = await ApiClient.post("user/confirm-password", data);
  return response.data;
};

export const postUserResendPhoneVerification: ApiFunction<
  { phone: string },
  void
> = async (data) => {
  const response = await ApiClient.post("user/resend-phone-verification", data);
  return response.data;
};

export const deleteUserPersonalAccessToken: ApiFunction<
  { tokenId: string },
  void
> = async (data) => {
  const response = await ApiClient.delete(
    `/user/personal-access-tokens/${data?.tokenId}`
  );
  return response.data;
};

export const postParseCv: ApiFunction<
  FormData,
  {
    parsed: ParsedCV;
    text: string;
  }
> = async (data) => {
  const response = await ApiClient.post("/parse-cv", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
