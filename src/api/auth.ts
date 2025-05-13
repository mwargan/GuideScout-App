import type { ApiFunction } from "./client";
import ApiClient from "./client";

export const postLogin: ApiFunction<
  {
    email: string;
    password: string;
    remember: boolean;
  },
  void
> = async (data) => {
  const response = await ApiClient.post("login", data);
  return response.data;
};

export const postRegister: ApiFunction<
  {
    email: string;
    password: string | null;
    password_confirmation: string | null;
    name: string;
    surname: string;
    phone: string;
    city: string | null;
    languages: string[];
    qualifications: string[];
    certifications: string[];
    skills: string[];
    experiences: string[];
    external_review_url: string | null;
    referral_code: string | null;
  },
  void
> = async (data) => {
  const response = await ApiClient.post("register", data);
  return response.data;
};

export const postLogout: ApiFunction = async () => {
  const response = await ApiClient.post("logout");
  return response.data;
};

export const postForgotPassword: ApiFunction<
  {
    email: string;
  },
  void
> = async (data) => {
  const response = await ApiClient.post("forgot-password", data);
  return response.data;
};

export const postResetPassword: ApiFunction<
  {
    email: string;
    password: string;
    password_confirmation: string;
    token: string;
  },
  void
> = async (data) => {
  const response = await ApiClient.post("reset-password", data);
  return response.data;
};
