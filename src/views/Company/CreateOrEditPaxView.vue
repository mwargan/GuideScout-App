<script lang="ts" setup>
import { onMounted, reactive } from "vue";
import CreatePax from "@/forms/CreatePax.vue";

defineProps({
  offerId: {
    type: Number,
    required: true,
  },
  paxId: {
    type: Number,
    required: false,
  },
});

const currentLocation = reactive({
  lat: 0,
  lng: 0,
});

const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
      currentLocation.lat = position.coords.latitude;
      currentLocation.lng = position.coords.longitude;
    });
  }
};

onMounted(() => {
  getCurrentLocation();
});
</script>
<template>
  <h1>{{ !paxId ? $t("Add Pax") : $t("Edit Pax") }}</h1>
  <create-pax :offerId="offerId" :paxId="paxId" />
</template>
<style scoped>
th {
  position: sticky;
  top: 0;
}
table {
  position: relative;
  border-collapse: collapse;
}
</style>
