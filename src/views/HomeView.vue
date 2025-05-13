<script setup lang="ts">
import ReferralLink from "@/components/ReferralLink.vue";
import { useUserStore } from "@/stores/user";
import { Vue3Lottie } from "vue3-lottie";
import radarJSON from "@/assets/lottie/radar.json";
import { ref } from "vue";
import CardElement from "@/components/CardElement.vue";
import { relativeRealtime } from "@/helpers/relativeRealtime";
import type { Offer } from "@/types/offer";
import type { Company } from "@/types/company";
import TourOffer from "@/components/TourOffer.vue";
import ApiClient from "@/api/client";

const userStore = useUserStore();

const tourOffers = ref<Readonly<Offer>[]>([]);
const currentTour = ref<Readonly<Offer> | null>(null);

const userLocation = ref(
  null as {
    latitude: number;
    longitude: number;
  } | null
);

const getTourOffers = async () => {
  userLocation.value = (await userStore.fetchAndSaveUserLocation()) ?? null;

  const response = await ApiClient.get<
    Omit<Offer & { offer_id: Offer["id"] }, "id">[]
  >(`/api/users/${userStore.user?.id}/tours/offers`);

  tourOffers.value = response.data.map((offer) => ({
    ...offer,
    id: offer.offer_id,
  }));

  const results = await Promise.all(
    tourOffers.value.map(async (offer) => {
      if (!offer.company) {
        return { id: offer.id, time: 0 };
      }
      const time = await computeDriveTime(offer.company);
      return { id: offer.id, time };
    })
  );

  driveTimes.value = results.reduce((acc, { id, time }) => {
    acc[id] = time;
    return acc;
  }, {} as Record<number, number>);
};

const getCurrentTour = async () => {
  const response = await ApiClient.get(
    `/api/users/${userStore.user?.id}/tours/current`
  );

  currentTour.value = response.data;
};

getTourOffers();
getCurrentTour();

const computeDriveTime = async (company: Company) => {
  if (!userLocation.value) {
    return 0;
  }
  const getData = {
    origin: {
      lat: userLocation.value.latitude,
      lon: userLocation.value.longitude,
    },
    destination: {
      lat: company.latitude,
      lon: company.longitude,
    },
  };
  const response = await ApiClient.get(
    `/api/drive-time?origin[latitude]=${getData.origin.lat}&origin[longitude]=${getData.origin.lon}&destination[latitude]=${getData.destination.lat}&destination[longitude]=${getData.destination.lon}`
  );

  return response.data;
};

const driveTimes = ref<Record<number, number>>({});
</script>

<template>
  <h1>{{ $t("Tour Offers") }}</h1>
  <template v-if="currentTour && currentTour.company">
    <card-element class="fixed-card" to="/tours">
      <template #header>
        <hgroup>
          <p>{{ currentTour.tour.name }}</p>
          <h2>
            Meet {{ relativeRealtime(currentTour.starts_at) }} @{{
              currentTour.company.name
            }}
          </h2>
        </hgroup>
        <svg
          width="18"
          height="19"
          viewBox="0 0 18 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.05733 16.5573L8.94267 18.4427L17.8853 9.50001L8.94267 0.557343L7.05733 2.44268L12.7813 8.16668H0V10.8333H12.7813L7.05733 16.5573Z"
            fill="#1E1E1E"
          />
        </svg>
      </template>
    </card-element>
  </template>

  <div v-if="!userStore.user?.guide_profile?.verified_at">
    <b>{{ $t("Your profile is still being verified.") }}</b>
    <p>{{ $t("Why not refer a friend to earn some money?") }}</p>
    <referral-link />
  </div>

  <template v-else-if="tourOffers.length > 0">
    <tour-offer
      :offer="offer"
      :driveTime="driveTimes[offer.id] ?? null"
      v-for="offer in tourOffers"
      :key="offer.id"
    />
  </template>
  <template v-else>
    <div class="empty-state">
      <Vue3Lottie :animationData="radarJSON" :height="200" :width="200" />
      <b>{{ $t("Looking for tours around you") }}</b>
      <p>{{ $t("Check back regularly for new offers") }}</p>
    </div>

    <p>{{ $t("Why not refer a friend to earn some money?") }}</p>
    <referral-link />
  </template>
</template>
<style scoped>
.empty-state {
  text-align: center;
  padding: 7rem 0;
}

.fixed-card {
  position: fixed;
  bottom: 0;
  margin-bottom: 0;
  z-index: 10;

  /* Offer Card */

  left: 0;
  right: 0;

  box-sizing: border-box;
  overflow: hidden;

  border: 1px solid #2c2c2c;
  box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.25);
  border-radius: 24px;
  margin-bottom: calc(var(--pico-block-spacing-vertical) * -1);
}

.fixed-card article {
  margin-bottom: 0;
}
</style>
