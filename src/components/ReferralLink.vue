<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "../stores/user";

const userStore = useUserStore();

const referral = ref(userStore.user?.referral_code);

const copyUrl = () => {
  const url = `https://app.guidescout.com/sign-up-as-guide?referral=${referral.value}`;
  navigator.clipboard.writeText(url);

  // If there is a timeout, clear it
  if (copiedTimeout.value) {
    clearTimeout(copiedTimeout);
  }
  // Set a timeout to remove the copied message
  copiedTimeout.value = setTimeout(() => {
    copiedTimeout.value = null;
  }, 2000);

  // Set the copied message
};

// A copied message timeout
const copiedTimeout: number | null = ref(null);
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
