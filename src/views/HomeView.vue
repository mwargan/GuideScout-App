<script setup lang="ts">
import ReferralLink from "@/components/ReferralLink.vue";
import { useUserStore } from "@/stores/user";
import { Vue3Lottie } from "vue3-lottie";
import radarJSON from "@/assets/lottie/radar.json";
import axios from "axios";
import { computed, ref } from "vue";
import CardElement from "@/components/CardElement.vue";
import { relativeRealtime } from "@/helpers/relativeRealtime";
import type { Offer } from "@/types/offer";
import type { Company } from "@/types/user";
import { formatDateTimeToTime } from "@/helpers/date";
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from "@/components/BaseButton.vue";
import Markdown from "vue3-markdown-it";
import source from "./IndependentContractorAgreement.md?raw";

const userStore = useUserStore();

const tourOffers = ref([] as Offer[]);
const currentTour = ref(null as Offer | null);

const userLocation = ref(
  null as {
    latitude: number;
    longitude: number;
  } | null
);

const isAcceptingOffer = ref(false);

const getTourOffers = async () => {
  userLocation.value = (await userStore.fetchAndSaveUserLocation()) ?? null;

  const response = await axios.get(
    `/api/users/${userStore.user?.id}/tours/offers`
  );

  tourOffers.value = response.data;

  const results = await Promise.all(
    tourOffers.value.map(async (offer) => {
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
  const response = await axios.get(
    `/api/users/${userStore.user?.id}/tours/current`
  );

  currentTour.value = response.data;
};

getTourOffers();
getCurrentTour();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(price / 100);
};

const getTourDuration = (offer: any) => {
  const start = new Date(offer.starts_at);
  const end = new Date(offer.ends_at);

  // Format using JS date functions
  return `${formatDateTimeToTime(start)} - ${formatDateTimeToTime(end)}`;
};

const getTourRunningTimeInHours = (offer: any) => {
  const start = new Date(offer.starts_at);
  const end = new Date(offer.ends_at);

  return (end.getTime() - start.getTime()) / 1000 / 60 / 60;
};

const computePrice = (offer: any) => {
  return offer.hourly_rate_eur_cents * getTourRunningTimeInHours(offer);
};

const acceptTourOffer = async (offer: any) => {
  isAcceptingOffer.value = true;

  // First, send the users location to the backend
  userLocation.value = (await userStore.fetchAndSaveUserLocation()) ?? null;

  const response = await axios
    .post(
      `/api/users/${userStore.user?.id}/tours/offers/${offer.offer_id}/accept`
    )
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
      alert("Failed to match tour - " + error.response.data.message);
    });

  if (response && response.data) {
    alert("Tour matched!");
    getTourOffers();
    getCurrentTour();
  }

  isAcceptingOffer.value = false;
};

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
  const response = await axios.get(
    `/api/drive-time?origin[latitude]=${getData.origin.lat}&origin[longitude]=${getData.origin.lon}&destination[latitude]=${getData.destination.lat}&destination[longitude]=${getData.destination.lon}`
  );

  return response.data;
};

const driveTimes = ref<Record<number, number>>({});

const formattedOffers = computed(() => {
  return tourOffers.value.map((offer) => {
    return {
      ...offer,
      driveTime: driveTimes.value[offer.id] ?? null, // Default to null if not fetched yet
    };
  });
});
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

  <div v-else-if="formattedOffers.length > 0">
    <card-element v-for="offer in formattedOffers" :key="offer.id">
      <template #header>
        <hgroup>
          <p>
            {{
              $t("Meet DATETIME", {
                datetime: new Date(offer.suggested_in_office_at).toLocaleString(
                  $i18n.locale,
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    weekday: "short",
                  }
                ),
              })
            }}
            @<router-link :to="'/companies/' + offer.company.id">{{
              offer.company.name
            }}</router-link>
            ({{ $t("min drive from your location", { min: offer.driveTime }) }})
          </p>
          <h2>{{ formatPrice(offer.total_cost_per_guide ?? 0) }}</h2>
        </hgroup>
      </template>
      <ul>
        <li>{{ offer.tour.name }}</li>
        <li>
          {{
            $t("Run tour TIME with X people", {
              time: getTourDuration(offer),
              people: offer.total_pax,
            })
          }}
        </li>
      </ul>
      <p v-if="offer.description">
        {{ offer.description }}
      </p>
      <template #footer>
        <base-modal title="Accept tour offer" triggerText="Match">
          <template #trigger="{ openModal, isOpen }">
            <base-button
              @click="openModal()"
              :aria-busy="isOpen"
              style="width: 100%"
            >
              {{ $t("Match") }}
            </base-button>
          </template>
          <p>
            {{ $t("You will be obligated to run this tour.") }}
            {{
              $t(
                "No cancellations are allowed, you must show up at the time specified."
              )
            }}
            {{
              $t(
                "Not showing up may result in you being banned from the platform."
              )
            }}
          </p>
          <details>
            <summary>{{ $t("Independent Contractor Agreement") }}</summary>
            <Markdown :source="source" />
          </details>
          <p>
            {{
              $t(
                "By accepting this offer, you agree to the Independent Contractor Agreement, in addition to previously accepted terms and conditions."
              )
            }}
          </p>

          <template #footer="{ closeModal, modalId }">
            <base-button
              class="secondary"
              :data-target="modalId"
              @click.prevent="closeModal()"
              :disabled="isAcceptingOffer"
            >
              {{ $t("Cancel") }}
            </base-button>
            <base-button
              :data-target="modalId"
              @click.prevent="
                acceptTourOffer(offer);
                closeModal();
              "
              :disabled="isAcceptingOffer"
            >
              {{ $t("Aceept tour offer") }}
            </base-button>
          </template>
        </base-modal>
      </template>
    </card-element>
  </div>
  <div v-else>
    <div class="empty-state">
      <Vue3Lottie :animationData="radarJSON" :height="200" :width="200" />
      <b>{{ $t("Looking for tours around you") }}</b>
      <p>{{ $t("Check back regularly for new offers") }}</p>
    </div>

    <p>{{ $t("Why not refer a friend to earn some money?") }}</p>
    <referral-link />
  </div>
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
