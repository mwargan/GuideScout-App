<script setup lang="ts">
import ReferralLink from "@/components/ReferralLink.vue";
import { useUserStore } from "@/stores/user";
import { Vue3Lottie } from "vue3-lottie";
import radarJSON from "@/assets/lottie/radar.json";
import { onMounted, ref } from "vue";
import CardElement from "@/components/CardElement.vue";
import { relativeRealtime } from "@/helpers/relativeRealtime";
import type { Offer } from "@/types/offer";
import type { Company } from "@/types/company";
import TourOffer from "@/components/TourOffer.vue";
import { getDriveTime } from "@/api/drive.time";
import { getUsersTourOffers } from "@/api/user";
import { useCurrentTourOffer } from "@/composables/useCurrentTourOffer";

const userStore = useUserStore();
const { currentTourQuery } = useCurrentTourOffer();
const tourOffers = ref<
  Omit<
    Offer & {
      offer_id: Offer["id"];
    },
    "id"
  >[]
>([]);

const getTourOffers = async () => {
  await userStore.fetchAndSaveUserLocation();
  tourOffers.value = await getUsersTourOffers({
    userId: userStore.user?.id,
  });

  const results = await Promise.all(
    tourOffers.value.map(async (offer) => {
      if (!offer.company) {
        return { id: offer.offer_id, time: 0 };
      }
      const time = await computeDriveTime(offer.company);
      return { id: offer.offer_id, time };
    })
  );

  driveTimes.value = results.reduce((acc, { id, time }) => {
    acc[id] = time;
    return acc;
  }, {} as Record<number, number>);
};

const computeDriveTime = async (company: Company) => {
  const userLocation = await userStore.fetchAndSaveUserLocation();
  if (!userLocation) {
    return 0;
  }
  const getData = {
    origin: {
      lat: userLocation.latitude,
      lng: userLocation.longitude,
    },
    destination: {
      lat: company.latitude,
      lng: company.longitude,
    },
  };

  return getDriveTime(getData);
};

const driveTimes = ref<Record<number, number>>({});

onMounted(() => {
  getTourOffers();
});
</script>

<template>
  <h1>{{ $t("Tour Offers") }}</h1>
  <template v-if="currentTourQuery && currentTourQuery.data.value?.company">
    <card-element class="fixed-card" to="/tours">
      <template #header>
        <hgroup>
          <p>{{ currentTourQuery.data.value?.tour.name }}</p>
          <h2>
            Meet
            {{ relativeRealtime(currentTourQuery.data.value?.starts_at) }}
            @{{ currentTourQuery.data.value?.company.name }}
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
      :offer="{ ...offer, id: offer.offer_id }"
      :driveTime="driveTimes[offer.offer_id] ?? null"
      v-for="offer in tourOffers"
      :key="offer.offer_id"
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
