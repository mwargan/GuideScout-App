<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "../stores/user";

const userStore = useUserStore();

const referral = ref(userStore.user?.referral_code);

const copyUrl = () => {
  const url = `https://app.guidescout.com/sign-up-as-guide?referral=${referral.value}`;
  navigator.clipboard.writeText(url);
};
</script>

<template>
  <h1>{{ $t("Tour Offers") }}</h1>
  <div>
    <b>{{ $t("Your profile is still being verified.") }}</b>
    <p>{{ $t("Why not refer a friend to earn some money?") }}</p>

    <input
      type="text"
      :value="`https://app.guidescout.com/sign-up-as-guide?referral=${referral}`"
      readonly
    />

    <router-link to="/referrals">{{ $t("Refer a friend") }}</router-link>
  </div>
</template>
