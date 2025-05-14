// services/userService.ts

import { postEmailExists, postEmailResendVerification } from "@/api/email";
import {
  deleteUserPersonalAccessToken,
  getSelf,
  getUserPaymentIntent,
  getUserPaymentMethods,
  getUserPersonalAccessTokens,
  getUserShouldConfirmPassword,
  postPaymentMethod,
  postPersonalAccessToken,
  postUserConfirmPassword,
  postUserResendPhoneVerification,
  postUserSendPhoneOtpCode,
  postUserUploadCv,
  postUserVerifyPhoneOtpCode,
  putUserProfileInformation,
} from "@/api/me"; // Reorganize this as needed
import { postUserLocation } from "@/api/user";
import { UserSchema } from "@/schemas/user";

import type { Credential } from "@/types/user";

import $bus from "type-safe-event-bus";
import { z } from "zod";
import { authService } from "./auth";

export const meService = {
  ...authService,

  async getUser() {
    return await getSelf();
  },

  async resendEmailConfirmation(email: string) {
    await postEmailResendVerification({ email });
  },

  async resendPhoneConfirmation(phone: string) {
    return postUserResendPhoneVerification({ phone });
  },

  async confirmPassword(password: string) {
    await postUserConfirmPassword({ password });
    $bus.$emit("confirmed_password");
  },

  async shouldConfirmPassword() {
    return getUserShouldConfirmPassword();
  },

  async updateProfile(data: Partial<z.input<typeof UserSchema>>) {
    if (!data) return;
    const parsedData = UserSchema.parse(data);
    await putUserProfileInformation(parsedData);
    $bus.$emit("updated_user", { changes: data });
  },

  async getPaymentIntent() {
    return getUserPaymentIntent();
  },

  async addPaymentMethod(paymentMethodId: string) {
    await postPaymentMethod({ paymentMethodId });
    $bus.$emit("added_payment_method", {
      methodId: paymentMethodId,
    });
  },

  async getPaymentMethods() {
    return getUserPaymentMethods();
  },

  async sendPhoneOtpCode() {
    await postUserSendPhoneOtpCode();
    $bus.$emit("sent_phone_otp", { phone: null });
  },

  async verifyPhoneOtpCode(otp: string) {
    await postUserVerifyPhoneOtpCode({ otp });
    $bus.$emit("confirmed_phone");
  },

  async uploadCV(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    await postUserUploadCv(formData);
    $bus.$emit("uploaded_cv");
  },

  async saveUserLocation(userId: number, position: GeolocationPosition) {
    return postUserLocation({
      userId,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  },

  async fetchUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000,
      });
    });
  },

  async createPersonalAccessToken(name: string) {
    const data = await postPersonalAccessToken({
      name: name,
      scopes: ["*"],
    });

    $bus.$emit("created_personal_access_token", { tokenId: data.id });

    return data;
  },

  async deletePersonalAccessToken(tokenId: string) {
    await deleteUserPersonalAccessToken({ tokenId });
    $bus.$emit("deleted_personal_access_token", { tokenId });
    return true;
  },

  async getPersonalAccessTokens() {
    const tokens = await getUserPersonalAccessTokens();
    if (typeof tokens === "string") {
      return [];
    }
    return tokens;
  },

  async checkEmailExists(email: string) {
    try {
      await postEmailExists({ email });
      return true;
    } catch (error: any) {
      console.error("Check email exists error:", error);
      return false;
    }
  },

  buildOAuthUrl(provider: Credential["provider"]): string {
    const baseUrl = import.meta.env.VITE_API_URL;
    const redirectUrl = `${baseUrl}${provider}/auth/callback`;
    return `${baseUrl}${provider}/auth/redirect?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
  },

  loginWithProvider(provider: Credential["provider"]) {
    const url = this.buildOAuthUrl(provider);
    window.open(url, "_self");
  },
};
