<script lang="ts" setup>
import { useRouter } from "vue-router";
import CreateOrEditTour from "@/forms/CreateOrEditTour.vue";

defineProps({
  companyId: {
    type: Number,
    required: true,
  },
  tourId: {
    type: Number,
    required: false,
  },
});

const router = useRouter();

// On success of creating an offer, show the create pax form by redirecting to the create pax form /offers/:id/pax
const handleSuccess = (offerId: number) => {
  router.push({
    name: "company-offers-create",
    params: { offerId },
  });
};
</script>
<template>
  <h1 v-if="tourId">{{ $t("Edit Tour") }}</h1>
  <h1 v-else>{{ $t("Create Tour") }}</h1>
  <create-or-edit-tour
    :companyId="companyId"
    :tourId="tourId"
    @success="handleSuccess"
  />
</template>
