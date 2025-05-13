// services/userService.ts

import {
  postForgotPassword,
  postLogin,
  postLogout,
  postRegister,
  postResetPassword,
} from "@/api/auth";
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

import type { Credential } from "@/types/user";

import $bus from "type-safe-event-bus";

export const meService = {
  async getUser() {
    return await getSelf();
  },

  async login(email: string, password: string) {
    try {
      await postLogin({ email, password, remember: true });
      $bus.$emit("logged_in");
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response.data.message);
    }
  },

  async logout() {
    try {
      await postLogout();
      $bus.$emit("logged_out");
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.response.data.message);
    }
  },

  async register(userData: Parameters<typeof postRegister>[0]) {
    try {
      await postRegister(userData);
      $bus.$emit("registered");
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.response.data.message);
    }
  },

  async resendEmailConfirmation(email: string) {
    return postEmailResendVerification({ email });
  },

  async resendPhoneConfirmation(phone: string) {
    return postUserResendPhoneVerification({ phone });
  },

  async sendPasswordResetEmail(email: string) {
    try {
      await postForgotPassword({ email });
      $bus.$emit("sent_reset_password_email", { email });
    } catch (error: any) {
      console.error("Password reset email error:", error);
      throw new Error(error.response.data.message);
    }
  },

  async sendPasswordReset(email: string, token: string, password: string) {
    try {
      await postResetPassword({
        email,
        token,
        password,
        password_confirmation: password,
      });
      $bus.$emit("reset_password", { email });
    } catch (error: any) {
      console.error("Password reset error:", error);
      throw new Error(error.response.data.message);
    }
  },

  async confirmPassword(password: string) {
    try {
      await postUserConfirmPassword({ password });
      $bus.$emit("confirmed_password");
    } catch (error: any) {
      console.error("Confirm password error:", error);
      throw new Error(error.response.data.message);
    }
  },

  async shouldConfirmPassword() {
    return getUserShouldConfirmPassword();
  },

  async updateProfile(data: any) {
    try {
      await putUserProfileInformation(data);
      $bus.$emit("updated_user", { changes: data });
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw new Error(error.response.data.message);
    }
  },

  async getPaymentIntent() {
    return getUserPaymentIntent();
  },

  async addPaymentMethod(paymentMethodId: string) {
    return postPaymentMethod({ paymentMethodId });
  },

  async getPaymentMethods() {
    return getUserPaymentMethods();
  },

  async sendPhoneOtpCode() {
    try {
      await postUserSendPhoneOtpCode();
      $bus.$emit("sent_phone_otp", { phone: null });
    } catch (error: any) {
      console.error("Send phone OTP error:", error);
      throw new Error(error.response.data.message);
    }
  },

  async verifyPhoneOtpCode(otp: string) {
    try {
      await postUserVerifyPhoneOtpCode({ otp });
      $bus.$emit("confirmed_phone");
    } catch (error: any) {
      console.error("Verify phone OTP error:", error);
      throw new Error(error.response.data.message);
    }
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
    try {
      const tokens = await getUserPersonalAccessTokens();
      if (typeof tokens === "string") {
        return [];
      }
      return tokens;
    } catch (error: any) {
      console.log("Personal access tokens error", error);
      alert(error.response.data.message);
      return [];
    }
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

  loginWithProvider(provider: Credential["provider"]) {
    const baseUrl = import.meta.env.VITE_API_URL;
    const redirectUrl = `${baseUrl}${provider}/auth/callback`;
    const url = `${baseUrl}${provider}/auth/redirect?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
    window.open(url, "_self");
  },
};
