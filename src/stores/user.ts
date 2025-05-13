import { type Ref, ref } from "vue";
import { defineStore } from "pinia";

import type { Credential, PersonalAccessToken, User } from "@/types/user";
import { useEventsBus } from "@/eventBus/events";
import { getCsrfToken, getSelf, postUserLocation } from "@/api/user";

import {
  deleteUserPersonalAccessToken,
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
} from "@/api/me";
import { postEmailExists, postEmailResendVerification } from "@/api/email";
import {
  postForgotPassword,
  postLogin,
  postLogout,
  postRegister,
  postResetPassword,
} from "@/api/auth";

export const useUserStore = defineStore("user", () => {
  // the state of the user
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const user = ref<User | null>(null);
  const attemptedToFetchUser = ref(false);
  const location = ref(null as GeolocationPosition | null);
  const locationUpdatedAt = ref<Date | null>(null);
  const activeTeamId = ref<number | string | null>(
    localStorage.getItem("activeTeamId")
  );

  const locationCacheTimeInSeconds = 30; // Minimum wait time in seconds before fetching the location again

  const $bus = useEventsBus();
  // A promise that returns true when isLoading is false and attemptedToFetchUser is true
  const isReady = new Promise((resolve) => {
    const interval = setInterval(() => {
      if (attemptedToFetchUser.value && !isLoading.value) {
        clearInterval(interval);
        resolve(true);
      }
    }, 10);
  }).then(() => {
    return true;
  });

  // The userEmail is meant for keeping email state across auth pages, for example when going from login to forgot-password page
  const userEmail = ref(null) as Ref<string | null>;

  /**
   * Get the user
   *
   */
  async function getUser() {
    isLoading.value = true;
    try {
      user.value = await getSelf();
      isAuthenticated.value = true;

      if (user.value?.companies?.length === 1) {
        setActiveTeam(user.value.companies[0].id);
      }

      await getCsrfToken();
    } catch (error) {
      console.log(error);
    } finally {
      attemptedToFetchUser.value = true;
      isLoading.value = false;
    }
  }

  /**
   * Check if the email has an account
   *
   * @param {string} email
   * @return {*}
   */
  async function checkEmail(email: string) {
    // Check if the email is valid
    if (!email) {
      return;
    }

    isLoading.value = true;

    await getCsrfToken().catch((e) => {
      console.error("CSRF cookie fetching error", e);
    });

    try {
      const response = await postEmailExists({ email });
      return response.exists;
    } catch (error: any) {
      if (error.response.status === 404) {
        return false;
      }
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Log in the user
   *
   * @param {string} email
   * @param {string} password
   * @return {*}
   */
  async function login(email: string, password: string) {
    // Check if the email is valid
    if (!email) {
      return false;
    }

    // Check if the password is valid
    if (!password) {
      return false;
    }

    isLoading.value = true;

    // Check if the email is already in use
    try {
      await postLogin({
        email,
        password,
        remember: true,
      });
      await getUser();
      $bus.$emit("logged_in");
      return true;
    } catch (error) {
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Log in the user using an external provider
   *
   * @param {Credential['provider']} provider
   * @return {*}
   */
  async function loginWithProvider(provider: Credential["provider"]) {
    const baseUrl = import.meta.env.VITE_API_URL;
    const redirectUrl = `${baseUrl}${provider}/auth/callback`;
    alert(redirectUrl);

    const url = `${baseUrl}${provider}/auth/redirect?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
    // Go to the url
    window.open(url, "_self");
  }

  /**
   * Register the user
   *
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @param {string} surname
   * @return {*}
   */
  async function register(
    email: string,
    password: string | null = null,
    name: string,
    surname: string,
    phone: string,
    city: string | null = null,
    languages: string[] = [],
    qualifications: string[] = [],
    certifications: string[] = [],
    skills: string[] = [],
    experiences: string[] = [],
    externalReviewUrl: string | null = null,
    referralCode: string | null = null
  ) {
    // Check if the email is valid
    if (!email) {
      return;
    }

    // Check if the name is valid
    if (!name) {
      return;
    }

    // Check if the surname is valid
    if (!surname) {
      return;
    }

    // Check if the phone is valid
    if (!phone) {
      return;
    }

    isLoading.value = true;

    try {
      await postRegister({
        email,
        password,
        password_confirmation: password,
        name,
        surname,
        phone,
        city,
        languages,
        qualifications,
        certifications,
        skills,
        experiences,
        external_review_url: externalReviewUrl,
        referral_code: referralCode,
      });
      await getUser();
      $bus.$emit("registered");
      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Resend a confirm-email email to the user
   *
   * @return {*}
   */
  async function resendEmailConfirmation() {
    if (!user.value) {
      return;
    }
    isLoading.value = true;
    try {
      await postEmailResendVerification({ email: user.value.email });
      return true;
    } catch (error) {
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Resend a confirm-phone text to the user
   *
   * @return {*}
   */
  async function resendPhoneConfirmation() {
    if (!user.value?.phone) {
      return;
    }
    isLoading.value = true;
    try {
      await postUserResendPhoneVerification({ phone: user.value.phone });
      return true;
    } catch (error) {
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Send a reset-password email/request
   *
   * @param {string} email
   * @return {*}
   */
  async function sendPasswordResetEmail(email: string) {
    if (!email) {
      return false;
    }

    isLoading.value = true;

    // Submit a reset password
    try {
      await postForgotPassword({ email });
      $bus.$emit("sent_reset_password_email", { email });
      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Attempt to reset a password
   *
   * @param {string} email
   * @param {string} token
   * @param {string} password
   * @return {*}
   */
  async function sendPasswordReset(
    email: string,
    token: string,
    password: string
  ) {
    if (!email) {
      return false;
    }

    if (!token) {
      return false;
    }

    if (!password) {
      return false;
    }

    isLoading.value = true;

    // Submit a reset password
    try {
      await postResetPassword({
        email,
        token,
        password,
        password_confirmation: password,
      });
      $bus.$emit("reset_password", { email });
      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Confirm the users password
   *
   * @param {string} password
   * @return {*}
   */
  async function confirmPassword(password: string) {
    if (!password) {
      return false;
    }

    isLoading.value = true;

    try {
      await postUserConfirmPassword({ password });
      $bus.$emit("confirmed_password");
      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Determine if the user should confirm their password.
   *
   * @return {*}
   */
  async function shouldConfirmPassword() {
    isLoading.value = true;
    try {
      const response = await getUserShouldConfirmPassword();
      return !response.confirmed;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout the user
   *
   */
  async function logout() {
    isLoading.value = true;
    await postLogout();
    isAuthenticated.value = false;
    user.value = null;
    isLoading.value = false;
    $bus.$emit("logged_out");
  }

  /**
   * Get a payment intent
   *
   * @return {*}
   */
  async function getPaymentIntent() {
    try {
      return getUserPaymentIntent();
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Add a payment method for a user
   *
   * @param {string} paymentMethodId
   * @return {*}
   */
  async function addPaymentMethod(paymentMethodId: string) {
    try {
      await postPaymentMethod({ paymentMethodId });
      $bus.$emit("added_payment_method", { methodId: paymentMethodId });
      await getUser();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Get the payment methods of the user
   *
   * @return {*}
   */
  async function getPaymentMethods() {
    try {
      return getUserPaymentMethods();
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Update a user's profile
   *
   * @param {string} name
   * @param {string} surname
   * @param {string} email
   * @return {*}
   */
  async function update(
    name: string,
    surname: string,
    email: string,
    phone: string
  ) {
    isLoading.value = true;
    try {
      const data = {
        name: name ?? user.value?.name,
        surname: surname ?? user.value?.surname,
        email: email ?? user.value?.email,
        phone: phone ?? user.value?.phone,
      };

      await putUserProfileInformation(data);

      await getUser();

      $bus.$emit("updated_user", {
        changes: data,
      });

      return true;
    } catch (error: any) {
      return error.response;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get all the users personal access tokens
   */
  async function getPersonalAccessTokens(): Promise<PersonalAccessToken[]> {
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
  }

  /**
   * Create a personal access token for the user
   *
   * @param {string} name
   * @return {*}
   */
  async function createPersonalAccessToken(name: string) {
    const data = await postPersonalAccessToken({
      name: name,
      scopes: ["*"],
    });

    $bus.$emit("created_personal_access_token", { tokenId: data.id });

    return data;
  }

  async function deletePersonalAccessToken(tokenId: string) {
    await deleteUserPersonalAccessToken({ tokenId });
    $bus.$emit("deleted_personal_access_token", { tokenId });
    return true;
  }

  async function saveUserLocation() {
    if (!user.value) {
      return;
    }
    if (!location.value) {
      return;
    }
    try {
      postUserLocation({
        userId: user.value.id,
        latitude: location.value.coords.latitude,
        longitude: location.value.coords.longitude,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // Fetch the current users location using the browser's geolocation API
  async function fetchUserLocation(): Promise<{
    latitude: number;
    longitude: number;
  }> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          location.value = position;
          resolve({
            latitude: location.value.coords.latitude,
            longitude: location.value.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    });
  }

  // fetchAndSaveUserLocation is a function that fetches the user's location and saves it to the server
  async function fetchAndSaveUserLocation() {
    // If we tried less than 1 minute ago, don't try again
    if (
      locationUpdatedAt.value &&
      locationUpdatedAt.value >
        new Date(Date.now() - locationCacheTimeInSeconds * 1000)
    ) {
      return location.value?.coords;
    }
    try {
      await fetchUserLocation();
      await saveUserLocation();
      locationUpdatedAt.value = new Date();
      return location.value?.coords;
    } catch (error) {
      console.error("Error fetching user location", error);
      alert(
        "Error fetching your location. You will not be able to use the app without location permissions."
      );
      throw error;
    }
  }

  async function sendPhoneOtpCode() {
    if (!user.value) {
      return false;
    }

    await postUserSendPhoneOtpCode();

    $bus.$emit("sent_phone_otp", {
      phone: user.value.phone,
    });

    return true;
  }

  async function verifyPhoneOtpCode(otp: string) {
    if (!user.value) {
      return false;
    }

    await postUserVerifyPhoneOtpCode({
      otp,
    });

    $bus.$emit("confirmed_phone");

    user.value.phone_verified_at = new Date().toISOString();

    return true;
  }

  async function uploadCV(file: File) {
    if (!user.value) {
      return false;
    }
    const formData = new FormData();
    formData.append("file", file);

    await postUserUploadCv(formData);

    $bus.$emit("uploaded_cv");

    user.value.latest_cv_status = "pending";

    return true;
  }

  async function setActiveTeam(id: number) {
    activeTeamId.value = id;
    // Save in local storage
    localStorage.setItem("activeTeamId", id.toString());
  }

  function getActiveTeam() {
    if (activeTeamId.value && user.value?.companies?.length) {
      const activeTeam = user.value.companies.find(
        (company) => company.id === activeTeamId.value
      );
      if (activeTeam) {
        return activeTeam;
      }
    }
    return null;
  }

  return {
    isAuthenticated,
    checkEmail,
    getUser,
    user,
    userEmail,
    attemptedToFetchUser,
    isLoading,
    login,
    register,
    resendEmailConfirmation,
    sendPasswordResetEmail,
    sendPasswordReset,
    logout,
    update,
    confirmPassword,
    shouldConfirmPassword,
    getPaymentIntent,
    addPaymentMethod,
    getPaymentMethods,
    isReady,
    getPersonalAccessTokens,
    createPersonalAccessToken,
    deletePersonalAccessToken,
    resendPhoneConfirmation,
    fetchAndSaveUserLocation,
    sendPhoneOtpCode,
    verifyPhoneOtpCode,
    fetchUserLocation,
    uploadCV,
    setActiveTeam,
    activeTeamId,
    getActiveTeam,
    loginWithProvider,
  };
});
