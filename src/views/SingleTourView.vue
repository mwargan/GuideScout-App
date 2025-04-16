<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import MapComponent from "@/components/MapComponent.vue";
import { useUserStore } from "@/stores/user";
import type { Tour } from "@/types/offer";
import BaseButton from "@/components/BaseButton.vue";

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
</script>

<template>
  <hgroup v-if="tour">
    <h1>{{ tour.name }}</h1>
    <p>{{ tour.company?.name }}</p>
  </hgroup>

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
  <p v-if="tour?.description">{{ tour.description }}</p>

  <h2>Duration</h2>
  <p v-if="tour?.minutesDuration">{{ tour.minutesDuration }} minutes tour</p>
  <p v-if="tour?.prepMinutes">+ {{ tour.prepMinutes }} minutes prep time</p>
  <p v-if="tour?.cleanupMinutes">
    + {{ tour.cleanupMinutes }} minutes cleanup time
  </p>
  <b v-if="tour">
    Total:
    {{ tour.minutesDuration + tour.prepMinutes + tour.cleanupMinutes }} minutes
  </b>

  <template v-if="tour?.hard_required_guide_attributes">
    <h2>Required Guide Attributes</h2>
    <ul>
      <li
        v-for="attribute in tour?.hard_required_guide_attributes"
        :key="attribute.id"
      >
        <span :for="attribute.name">{{ attribute.type }}: </span>
        <b>{{ attribute.name }}</b>
      </li>
    </ul>
    <p>Offers for this tour may have additional attributes required.</p>
  </template>
  <template v-if="tour?.url">
    <h2>Tour Website</h2>
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
</template>
