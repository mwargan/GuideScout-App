<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import CardElement from "@/components/CardElement.vue";
import MapComponent from "@/components/MapComponent.vue";

const deals = ref([] as any[]);
const loading = ref(true);

const fetchDeals = async () => {
  loading.value = true;
  const response = await axios.get(`/api/deals`);
  deals.value = response.data;
  loading.value = false;
};

onMounted(() => {
  fetchDeals();
});

const dealMarkers = computed(() => {
  return deals.value.map((deal) => ({
    latitude: deal.company.latitude,
    longitude: deal.company.longitude,
    markerName: deal.name + " - " + deal.company.name,
  }));
});
</script>
<template>
  <hgroup>
    <h1>{{ $t("Deals") }}</h1>
    <p>
      Get awesome deals from local businesses just by being a guide on
      GuideScout!
    </p>
  </hgroup>

  <card-element
    v-for="deal in deals"
    :key="deal.name"
    :title="deal.name"
    :subtitle="deal.company.name"
    :titleHeadingLevel="2"
    :images="
      deal.image_url
        ? [
            {
              src: deal.image_url,
              alt: deal.company.name,
            },
          ]
        : undefined
    "
  >
    <p v-if="deal.description">
      {{ deal.description }}
    </p>
    <p v-if="deal.company.description">{{ deal.company.description }}</p>
    <template #footer>
      <small>
        <address>
          Use this deal by visitng the business {{ deal.company.name }} at
          {{ deal.company.address }}
        </address>
      </small>
    </template>
  </card-element>

  <details v-if="dealMarkers.length">
    <summary>{{ $t("Map") }}</summary>
    <map-component
      class="full-width"
      :markers="dealMarkers"
      :showOpenInGoogleMaps="false"
    />
  </details>

  <p>
    We are continously finding and negotiating deals with local businesses just
    for you!
  </p>
  <small
    >Check back often to see what you can benefit from by just being a
    GuideScout member.</small
  >
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
