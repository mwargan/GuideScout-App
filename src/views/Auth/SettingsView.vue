<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import AccountSettings from "@/forms/AccountSettings.vue";
import AddPaymentMethod from "@/forms/AddPaymentMethod.vue";
import PersonalAccessTokens from "@/forms/PersonalAccessTokens.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import type { PersonalAccessToken } from "@/types/user";
import { ref } from "vue";
import { Vue3Lottie } from "vue3-lottie";
import radarJSON from "@/assets/lottie/verified.json";
import UploadCV from "@/forms/UploadCV.vue";
import ConnectWithBokun from "@/forms/ConnectWithBokun.vue";

const userStore = useUserStore();

const handleUpdate = (event: { email: string | undefined }) => {
  // If the email is in the event, redirect to the confirm email page
  if (event.email) {
    router.push({ name: "confirm-email" });
  }
};

const addingNewPaymentMethod = ref(false);

const accessTokens = ref<PersonalAccessToken[]>([]);

userStore
  .getPersonalAccessTokens()
  .then((tokens) => (accessTokens.value = tokens));

const handleCreatedToken = (e: PersonalAccessToken) => {
  accessTokens.value.push(e);
};

const handleDeleteToken = (id: string) => {
  userStore.deletePersonalAccessToken(id);
  const accessTokenIndex = accessTokens.value.findIndex((token) => {
    return token.id === id;
  });
  accessTokens.value.splice(accessTokenIndex);
};

const showDeveloperSettings = ref(
  // If the url has the query param ?showDeveloperSettings=true
  new URLSearchParams(window.location.search).get("showDeveloperSettings") ===
    "true"
);
</script>
<template>
  <h1>{{ $t("My Account") }}</h1>
  <card-element :titleHeadingLevel="2" :title="$t('Settings')">
    <account-settings @updated="handleUpdate"></account-settings>
  </card-element>
  <card-element :titleHeadingLevel="2" :title="$t('Guide profile')">
    <p v-if="!userStore.user?.guide_profile?.verified_at">
      {{ $t("Your profile is still being verified.") }}
    </p>
    <Vue3Lottie v-else :animationData="radarJSON" :height="200" :width="200" />

    <p v-if="userStore.user?.latest_cv_status">
      {{ $t("Your CV has been uploaded and is") }}
      {{ userStore.user?.latest_cv_status }}.
    </p>
    <upload-c-v v-else />

    <label for="city">{{ $t("City") }}</label>
    <input
      type="text"
      id="city"
      :value="userStore.user?.guide_profile?.city.name"
      readonly
    />

    <template
      v-for="{ attribute } in userStore.user?.user_attributes"
      :key="attribute.id"
    >
      <label :for="attribute.name">{{ attribute.type }}</label>
      <input
        type="text"
        :id="attribute.name"
        :value="attribute.name"
        readonly
      />
    </template>
  </card-element>
  <card-element
    v-if="userStore.user?.pm_type"
    :titleHeadingLevel="2"
    :title="$t('Payment methods')"
  >
    <div v-if="userStore.user?.pm_type">
      <p>
        {{ $t("Default payment method") }}:
        {{ userStore.user.pm_type.toUpperCase() }} ****
        {{ userStore.user.pm_last_four }}
      </p>
    </div>
    <div v-else>
      <p>{{ $t("You do not have a default payment method set") }}</p>
    </div>
    <add-payment-method
      v-if="addingNewPaymentMethod"
      @success="
        addingNewPaymentMethod = false;
        userStore.getUser();
      "
    />
    <button
      data-cy="add-payment-button"
      v-else
      @click="addingNewPaymentMethod = true"
      type="button"
    >
      {{ $t("Add a payment method") }}
    </button>
  </card-element>
  <card-element v-if="showDeveloperSettings" :titleHeadingLevel="2" title="API">
    <template v-if="accessTokens.length > 0">
      <ul>
        <li v-for="token in accessTokens" :key="'token-' + token.id">
          <strong>{{ token.name ?? "Untitled token" }}: </strong>
          <span>created {{ token.created_at }}</span>
          <button @click="handleDeleteToken(token.id)" type="button">
            Delete
          </button>
        </li>
      </ul>
    </template>
    <p v-else>{{ $t("You have no API access tokens.") }}</p>
    <personal-access-tokens @created="handleCreatedToken" />
  </card-element>
  <card-element
    :titleHeadingLevel="2"
    title="Integrations"
    v-if="showDeveloperSettings"
  >
    <h3>Bokun</h3>
    <connect-with-bokun
      v-if="
        !userStore.user?.credentials.some(
          (credential) => credential.provider === 'bokun'
        )
      "
    />
    <p v-else>
      {{ $t("You are already connected to Bokun.") }}
    </p>
  </card-element>
</template>
