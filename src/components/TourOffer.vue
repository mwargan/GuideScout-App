<script setup lang="ts">
import { type PropType, ref } from "vue";
import CardElement from "./CardElement.vue";
import type { Offer } from "@/types/offer";
import { formatDateTimeToTime } from "@/helpers/date";
import source from "@/views/IndependentContractorAgreement.md?raw";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import BaseModal from "@/components/modals/BaseModal.vue";
import BaseButton from "@/components/BaseButton.vue";
import Markdown from "vue3-markdown-it";

defineProps({
  /** The title of the card */
  offer: {
    type: Object as PropType<Offer>,
    required: true,
  },
  driveTime: {
    type: Number,
    required: false,
  },
});

const userStore = useUserStore();

const userLocation = ref(
  null as {
    latitude: number;
    longitude: number;
  } | null
);

const isAcceptingOffer = ref(false);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(price / 100);
};

const getTourDuration = (offer: Offer) => {
  const start = new Date(offer.starts_at);
  const end = new Date(offer.ends_at);

  // Format using JS date functions
  return `${formatDateTimeToTime(start)} - ${formatDateTimeToTime(end)}`;
};

const acceptTourOffer = async (offer: Offer) => {
  isAcceptingOffer.value = true;

  // First, send the users location to the backend
  userLocation.value = (await userStore.fetchAndSaveUserLocation()) ?? null;

  const response = await axios
    .post(`/api/users/${userStore.user?.id}/tours/offers/${offer.id}/accept`)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
      alert("Failed to match tour - " + error.response.data.message);
    });

  if (response && response.data) {
    alert("Tour matched!");
  }

  isAcceptingOffer.value = false;
};
</script>

<template>
  <card-element>
    <template #header>
      <hgroup>
        <p>
          {{
            $t("Meet DATETIME", {
              datetime: new Date(
                offer.suggested_in_office_at ?? offer.starts_at
              ).toLocaleString($i18n.locale, {
                hour: "2-digit",
                minute: "2-digit",
                weekday: "short",
              }),
            })
          }}
          @<router-link
            v-if="offer.company"
            :to="'/companies/' + offer.company.id"
            >{{ offer.company.name }}</router-link
          >
          <template v-if="driveTime">
            ({{
              $t("min drive from your location", { min: driveTime })
            }})</template
          >
        </p>
        <h2
          v-if="offer.total_cost_per_guide"
          :data-tooltip="
            formatPrice(offer.hourly_rate_eur_cents ?? 0) + ' ' + $t('per hour')
          "
          style="border-bottom: none; width: fit-content"
        >
          {{ formatPrice(offer.total_cost_per_guide ?? 0) }}
          total
        </h2>
        <h2 v-else>
          {{
            formatPrice(offer.hourly_rate_eur_cents ?? 0) + " " + $t("per hour")
          }}
        </h2>
      </hgroup>
    </template>
    <ul>
      <li v-if="offer.company">
        <router-link
          :to="`/companies/${offer.company.id}/tours/${offer.tour.id}`"
        >
          {{ offer.tour.name }}
        </router-link>
      </li>
      <li>
        {{
          $t("Run tour TIME with X people", {
            time: getTourDuration(offer),
            people:
              offer.total_pax > 0
                ? offer.total_pax
                : offer.tour.max_pax
                ? "up to " + offer.tour.max_pax
                : "an unknown number of",
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
</template>
