<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import { useEventsBus } from "@/eventBus/events";
import BaseForm from "@/forms/BaseForm.vue";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import { useRouter } from "vue-router";

const phoneSent = ref(false);
const otpCode = ref();

const userStore = useUserStore();
const $bus = useEventsBus();
const router = useRouter();

const resendPhone = async () => {
  // Check if the phone is already in use
  const response = await userStore.sendPhoneOtpCode();

  if (response) {
    phoneSent.value = true;
  } else {
    alert("Something went wrong sending you a new phone. Please try again");
  }
};

const confirmOtp = async () => {
  // Check if the phone is already in use
  const response = await userStore.verifyPhoneOtpCode(otpCode.value);

  if (response) {
    phoneSent.value = true;
  } else {
    alert("Something went wrong sending you a new phone. Please try again");
  }
};

const refreshPage = () => {
  console.log("Verified, refreshing page");
  $bus?.$off("confirmed_phone", refreshPage);
  router.go(0);
};

$bus?.$on("confirmed_phone", refreshPage);
</script>
<template>
  <h1>{{ $t("Confirm your phone") }}</h1>
  <card-element
    :title="$t('Confirm your phone')"
    :subtitle="userStore.user?.phone || ''"
  >
    <p>
      {{ $t("Please confirm your phone number to continue.") }}
    </p>
    <template v-if="phoneSent">
      <p class="success">
        {{ $t("A new code has been sent to you.") }}
      </p>
      <base-form
        :submit-text="$t('Confirm code')"
        @submit="confirmOtp"
        :disabled="!otpCode || otpCode.length !== 6"
      >
        <input v-model="otpCode" />
      </base-form>
    </template>
    <base-form
      v-else
      :submit-text="$t('Send confirmation code')"
      @submit="resendPhone"
    >
      <template #after-submit>
        <!-- Change phone -->
        <router-link to="/settings">{{
          $t("Change phone number")
        }}</router-link>
      </template>
    </base-form>
  </card-element>
</template>
