// stores/userStore.ts

import { ref } from "vue";
import { defineStore } from "pinia";
import type { Ref } from "vue";
import type { Credential, User } from "@/types/user";

import { meService } from "@/services/me";

export const useUserStore = defineStore("user", () => {
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const user = ref<User | null>(null);
  const userEmail = ref(null) as Ref<string | null>;
  const attemptedToFetchUser = ref(false);
  const location = ref<GeolocationPosition | null>(null);
  const locationUpdatedAt = ref<Date | null>(null);
  const activeTeamId = ref<number | string | null>(
    localStorage.getItem("activeTeamId")
  );
  const locationCacheTimeInSeconds = 30;

  const isReady = new Promise((resolve) => {
    const interval = setInterval(() => {
      if (attemptedToFetchUser.value && !isLoading.value) {
        clearInterval(interval);
        resolve(true);
      }
    }, 10);
  });

  async function getUser() {
    isLoading.value = true;
    try {
      user.value = await meService.getUser();
      isAuthenticated.value = true;
      if (user.value?.companies?.length === 1) {
        setActiveTeam(user.value.companies[0].id);
      }
    } catch {
      user.value = null;
      isAuthenticated.value = false;
      attemptedToFetchUser.value = false;
      userEmail.value = null;
    } finally {
      attemptedToFetchUser.value = true;
      isLoading.value = false;
    }
  }

  async function login(email?: string, password?: string) {
    isLoading.value = true;
    try {
      await meService.login(email, password);
      await getUser();
      return true;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(...args: Parameters<typeof meService.register>) {
    isLoading.value = true;
    try {
      await meService.register(...args);
      await getUser();
      return true;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    await meService.logout();
    isAuthenticated.value = false;
    user.value = null;
    isLoading.value = false;
  }

  async function resendEmailConfirmation() {
    if (!user.value?.email) return;
    isLoading.value = true;
    try {
      await meService.resendEmailConfirmation(user.value.email);
      return true;
    } catch {
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function resendPhoneConfirmation() {
    if (!user.value?.phone) return;
    isLoading.value = true;
    try {
      await meService.resendPhoneConfirmation(user.value.phone);
      return true;
    } catch {
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function sendPasswordResetEmail(email: string) {
    if (!email) return false;
    isLoading.value = true;
    try {
      await meService.sendPasswordResetEmail(email);
      return true;
    } finally {
      isLoading.value = false;
    }
  }

  async function sendPasswordReset(
    email: string,
    token: string,
    password: string
  ) {
    if (!email || !token || !password) return false;
    isLoading.value = true;
    try {
      await meService.sendPasswordReset(email, token, password);
      return true;
    } finally {
      isLoading.value = false;
    }
  }

  async function confirmPassword(password: string) {
    if (!password) return false;
    isLoading.value = true;
    try {
      await meService.confirmPassword(password);
      return true;
    } finally {
      isLoading.value = false;
    }
  }

  async function shouldConfirmPassword() {
    isLoading.value = true;
    try {
      const response = await meService.shouldConfirmPassword();
      return !response.confirmed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(
    name?: string | null,
    surname?: string | null,
    email?: string | null,
    phone?: string | null
  ) {
    isLoading.value = true;
    const data = {
      name: name ?? user.value?.name ?? undefined,
      surname: surname ?? user.value?.surname ?? undefined,
      email: email ?? user.value?.email ?? undefined,
      phone: phone ?? user.value?.phone ?? undefined,
    };
    try {
      await meService.updateProfile(data);
      await getUser();
      return true;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAndSaveUserLocation() {
    if (
      locationUpdatedAt.value &&
      new Date().getTime() - locationUpdatedAt.value.getTime() <
        locationCacheTimeInSeconds * 1000
    ) {
      return location.value?.coords;
    }

    try {
      const pos = await meService.fetchUserLocation();
      location.value = pos;
      if (user.value?.id) {
        await meService.saveUserLocation(user.value.id, pos);
      }
      locationUpdatedAt.value = new Date();
      return pos.coords;
    } catch (err) {
      alert("Location access is required.");
      throw err;
    }
  }

  async function sendPhoneOtpCode() {
    if (!user.value) return false;
    await meService.sendPhoneOtpCode();
    return true;
  }

  async function verifyPhoneOtpCode(otp: string) {
    if (!user.value) return false;
    await meService.verifyPhoneOtpCode(otp);
    user.value.phone_verified_at = new Date().toISOString();
    return true;
  }

  async function uploadCV(file: File) {
    if (!user.value) return false;
    await meService.uploadCV(file);
    user.value.latest_cv_status = "pending";
    return true;
  }

  async function getPaymentIntent() {
    if (!user.value) return false;
    const paymentIntent = await meService.getPaymentIntent();
    return paymentIntent;
  }

  async function addPaymentMethod(
    paymentMethodId: Parameters<typeof meService.addPaymentMethod>[0]
  ) {
    if (!user.value) return false;
    const paymentMethod = await meService.addPaymentMethod(paymentMethodId);
    return paymentMethod;
  }

  function setActiveTeam(id: number) {
    activeTeamId.value = id;
    localStorage.setItem("activeTeamId", id.toString());
  }

  function getActiveTeam() {
    return (
      user.value?.companies?.find(
        (company) => company.id === activeTeamId.value
      ) || null
    );
  }

  function loginWithProvider(provider: Credential["provider"]) {
    return meService.loginWithProvider(provider);
  }

  return {
    isAuthenticated,
    isLoading,
    attemptedToFetchUser,
    isReady,
    user,
    userEmail,
    getUser,
    login,
    logout,
    register,
    resendEmailConfirmation,
    resendPhoneConfirmation,
    sendPasswordResetEmail,
    sendPasswordReset,
    confirmPassword,
    shouldConfirmPassword,
    update,
    fetchAndSaveUserLocation,
    sendPhoneOtpCode,
    verifyPhoneOtpCode,
    uploadCV,
    setActiveTeam,
    getActiveTeam,
    activeTeamId,
    loginWithProvider,
    getPaymentIntent,
    addPaymentMethod,
  };
});
