<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import MapComponent from "@/components/MapComponent.vue";
import { useUserStore } from "@/stores/user";
import type { Offer, Tour } from "@/types/offer";
import BaseButton from "@/components/BaseButton.vue";
import TourOffer from "@/components/TourOffer.vue";

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
  },
  /** The tour ID */
  tourId: {
    type: Number,
    required: true,
  },
});

const userStore = useUserStore();

const tour = ref<Tour>();
const currentLocation = ref();
const driveInfo = ref();

const fetchTour = async () => {
  const response = await axios.get(
    `/api/companies/${props.companyId}/tours/${props.tourId}`
  );
  tour.value = await response.data;
};

const fetchCurrentLocation = async () => {
  currentLocation.value = await userStore.fetchAndSaveUserLocation();
};

const getDriveTimeData = async () => {
  if (!currentLocation.value || !tour.value) {
    return;
  }

  if (!tour.value.company?.latitude || !tour.value.company?.longitude) {
    return;
  }

  const getData = {
    origin: {
      lat: currentLocation.value.latitude,
      lon: currentLocation.value.longitude,
    },
    destination: {
      lat: tour.value.company.latitude,
      lon: tour.value.company.longitude,
    },
  };
  const response = await axios.get(
    `/api/drive-data?origin[latitude]=${getData.origin.lat}&origin[longitude]=${getData.origin.lon}&destination[latitude]=${getData.destination.lat}&destination[longitude]=${getData.destination.lon}`
  );

  driveInfo.value = response.data;
};

onMounted(async () => {
  // Fetch the tour
  await fetchTour();
  await fetchCurrentLocation();
  getDriveTimeData();
});

const formattedOffers = computed<Offer[]>(() => {
  return (
    tour.value?.future_offers?.map((item) => {
      return {
        ...item,
        offer_id: item.id,
        tour: tour.value as Tour,
        company: tour.value?.company,
      };
    }) ?? []
  );
});
</script>

<template>
  <hgroup v-if="tour">
    <h1>{{ tour.name }}</h1>
    <p>{{ tour.company?.name }}</p>
  </hgroup>

  <nav
    aria-label="Tab Navigation"
    class="tab-nav"
    style="width: 100%; white-space: nowrap"
  >
    <ul>
      <li>
        <a href="#start">Tour Start Point</a>
      </li>
      <li v-if="tour?.description">
        <a href="#description">Description</a>
      </li>
      <li>
        <a href="#duration">Duration</a>
      </li>
      <li>
        <a href="#attributes">Required attributes</a>
      </li>
      <li v-if="tour?.url">
        <a href="#website">Website</a>
      </li>
      <li v-if="formattedOffers?.length">
        <a href="#offers">Offers</a>
      </li>
    </ul>
  </nav>
  <hr />

  <h2 id="start">Start point</h2>
  <map-component
    class="full-width"
    v-if="tour?.company?.latitude && tour?.company?.longitude"
    :markers="[
      {
        latitude: tour.company?.latitude,
        longitude: tour.company?.longitude,
        markerName: tour.name,
      },
      {
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        markerName: 'Your location',
      },
    ]"
    :lineStrings="[
      {
        ...driveInfo?.path,
        meters: driveInfo?.meters,
        minutes: driveInfo?.minutes,
      },
    ]"
  />

  <h2 id="description">Description</h2>
  <p v-if="tour?.description">{{ tour.description }}</p>

  <h2 id="duration">Duration</h2>
  <p v-if="tour?.minutesDuration">{{ tour.minutesDuration }} minutes tour</p>
  <p v-if="tour?.prepMinutes">+ {{ tour.prepMinutes }} minutes prep time</p>
  <p v-if="tour?.cleanupMinutes">
    + {{ tour.cleanupMinutes }} minutes cleanup time
  </p>
  <b v-if="tour">
    Total:
    {{ tour.minutesDuration + tour.prepMinutes + tour.cleanupMinutes }} minutes
  </b>

  <h2 id="attributes">Required Guide Attributes</h2>
  <ul v-if="tour?.hard_required_guide_attributes?.length">
    <li
      v-for="attribute in tour?.hard_required_guide_attributes"
      :key="attribute.id"
    >
      <span :for="attribute.name">{{ attribute.type }}: </span>
      <b>{{ attribute.name }}</b>
    </li>
  </ul>
  <p>Offers for this tour may have additional attributes required.</p>

  <template v-if="tour?.url">
    <h2 id="website">Tour Website</h2>
    <iframe
      :src="tour.url"
      width="100%"
      height="500px"
      frameborder="0"
      allowfullscreen
    ></iframe>
    <base-button v-if="tour?.url" :href="tour.url" target="_blank">
      {{ $t("Open tour website") }}
    </base-button>
  </template>

  <template v-if="formattedOffers?.length">
    <h2 id="offers">Offers</h2>
    <tour-offer
      :offer="offer"
      v-for="offer in formattedOffers"
      :key="offer.id"
    />
  </template>
</template>
