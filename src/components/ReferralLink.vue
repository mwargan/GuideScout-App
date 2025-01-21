<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "../stores/user";

const userStore = useUserStore();

const referral = ref(userStore.user?.referral_code);

// A copied message timeout
const copiedTimeout = ref(null as any | null);

const copyUrl = () => {
  const url = `https://app.guidescout.com/sign-up-as-guide?referral=${referral.value}`;
  navigator.clipboard.writeText(url);

  // If there is a timeout, clear it
  if (copiedTimeout.value) {
    clearTimeout(copiedTimeout.value);
  }
  // Set a timeout to remove the copied message
  copiedTimeout.value = setTimeout(() => {
    copiedTimeout.value = null;
  }, 2000);

  // Set the copied message
};
</script>
<template>
  <input
    type="text"
    :value="`https://app.guidescout.com/sign-up-as-guide?referral=${referral}`"
    readonly
  />
  <button @click="copyUrl">
    {{ copiedTimeout ? $t("Copied!") : $t("Copy link") }}
  </button>
</template>
