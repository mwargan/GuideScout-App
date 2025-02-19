<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import axios from "axios";
import type { Offer } from "@/types/offer";
import { useRouter } from "vue-router";
import CreateOffer from "@/forms/CreateOffer.vue";

const offers = ref<Offer[]>([]);

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
  },
});

const fetchOffers = async () => {
  const response = await axios.get(`/api/companies/${props.companyId}/offers`);
  offers.value = response.data;
};
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
  fetchOffers();
  getCurrentLocation();
});

const router = useRouter();

// On success of creating an offer, show the create pax form by redirecting to the create pax form /offers/:id/pax
const handleSuccess = (offerId: number) => {
  router.push({
    name: "offer-passengers-create",
    params: { offerId },
  });
};
</script>
<template>
  <h1>{{ $t("Create Offer") }}</h1>
  <create-offer :companyId="companyId" @success="handleSuccess" />
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
