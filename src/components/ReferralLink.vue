<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "../stores/user";
import BaseButton from "./BaseButton.vue";

const userStore = useUserStore();

const referral = ref(userStore.user?.referral_code);

// A copied message timeout
const copiedTimeout = ref(null as any | null);

const copyUrl = () => {
  const url = `https://app.guidescout.net/sign-up-as-guide?referral=${referral.value}`;
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
  <div role="group">
    <input
      type="text"
      :value="`https://app.guidescout.net/sign-up-as-guide?referral=${referral}`"
      readonly
    />
    <base-button @click="copyUrl" style="white-space: nowrap">
      {{ copiedTimeout ? $t("Copied!") : $t("Copy link") }}
    </base-button>
  </div>
</template>
