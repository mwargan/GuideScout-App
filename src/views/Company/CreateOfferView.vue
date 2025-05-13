<script lang="ts" setup>
import { onMounted, ref } from "vue";
import type { Offer } from "@/types/offer";
import { useRouter } from "vue-router";
import CreateOffer from "@/forms/CreateOffer.vue";
import ApiClient from "@/api/client";

const offers = ref<Offer[]>([]);

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
  },
});

const fetchOffers = async () => {
  const response = await ApiClient.get(
    `/api/companies/${props.companyId}/offers`
  );
  offers.value = response.data;
};

onMounted(() => {
  fetchOffers();
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
