<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import LoginOrRegister from "@/forms/LoginOrRegister.vue";
import router from "@/router";
import ConnectWithProvider from "@/forms/ConnectWithProvider.vue";
import { useUserStore } from "@/stores/user";

const redirect = () => {
  // Redirect to the home page
  router.push((router.currentRoute.value.query.redirect as string) ?? "/");
};

const userStore = useUserStore();

const showDeveloperSettings =
  // If the url has the query param ?showDeveloperSettings=true
  new URLSearchParams(window.location.search).get("showDeveloperSettings") ===
  "true";
</script>

<template>
  <h1>{{ $t("Authenticate") }}</h1>
  <card-element :titleHeadingLevel="2" :title="$t('Connect')">
    <login-or-register @success="redirect" />
  </card-element>
  <connect-with-provider
    v-if="
      showDeveloperSettings &&
      !userStore.user?.credentials.some(
        (credential) => credential.provider === 'bokun'
      )
    "
    provider="bokun"
  />
  <connect-with-provider
    v-if="
      showDeveloperSettings &&
      !userStore.user?.credentials.some(
        (credential) => credential.provider === 'linkedin-openid'
      )
    "
    provider="linkedin-openid"
  />
</template>
