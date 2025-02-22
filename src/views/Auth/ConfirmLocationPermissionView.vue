<script setup lang="ts">
import CardElement from "@/components/CardElement.vue";
import BaseForm from "@/forms/BaseForm.vue";
import { useUserStore } from "@/stores/user";
import { Vue3Lottie } from "vue3-lottie";
import locationJSON from "@/assets/lottie/location.json";

const store = useUserStore();

const requestLocationPermissions = async () => {
  // Request location permissions
  console.log("Requesting location permissions");
  await navigator.permissions
    .query({ name: "geolocation" })
    .then(async (result) => {
      if (result.state === "prompt") {
        alert(
          "You must give us location permissions to continue. Your location is used to show you the nearest tours available to you."
        );
        await store.fetchAndSaveUserLocation();
      } else if (result.state === "denied") {
        alert(
          "You did not give us location permissions. You must give us location permissions to continue. Your location is used to show you the nearest tours available to you."
        );
      }
    });
};
</script>
<template>
  <h1>{{ $t("Allow location permissions") }}</h1>
  <card-element :title="$t('Allow location permissions')">
    <template #images>
      <Vue3Lottie :animationData="locationJSON" />
    </template>
    <p>
      {{
        $t(
          "You must give us location permissions to continue. Your location is used to show you the nearest tours available to you."
        )
      }}
    </p>

    <base-form
      :submit-text="$t('Give location permission')"
      @submit="requestLocationPermissions"
    >
    </base-form>
  </card-element>
</template>
