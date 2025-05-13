<script setup lang="ts">
import { onMounted, ref } from "vue";
import MapComponent from "@/components/MapComponent.vue";
import { useUserStore } from "@/stores/user";
import type { Company } from "@/types/company";
import { getCompany } from "@/api/company";
import { getDriveInfo } from "@/api/drive.time";

const props = defineProps({
  /** The company ID */
  companyId: {
    type: Number,
    required: true,
  },
});

const userStore = useUserStore();

const company = ref<Company>();
const currentLocation = ref();
const driveInfo = ref();

const fetchCompany = async () => {
  company.value = await getCompany({
    companyId: props.companyId,
  });
};

const fetchCurrentLocation = async () => {
  currentLocation.value = await userStore.fetchAndSaveUserLocation();
};

const getDriveTimeData = async () => {
  if (!currentLocation.value) {
    return;
  }

  if (!company.value?.latitude || !company.value?.longitude) {
    return;
  }

  const getData = {
    origin: {
      lat: currentLocation.value.latitude,
      lng: currentLocation.value.longitude,
    },
    destination: {
      lat: company.value.latitude,
      lng: company.value.longitude,
    },
  };

  driveInfo.value = await getDriveInfo(getData);
};

onMounted(async () => {
  // Fetch the company
  await fetchCompany();
  await fetchCurrentLocation();
  getDriveTimeData();
});
</script>

<template>
  <hgroup v-if="company">
    <h1>{{ company.name }}</h1>
    <p>{{ company.address }}</p>
  </hgroup>

  <map-component
    class="full-width"
    v-if="company?.latitude && company?.longitude"
    :markers="[
      {
        latitude: company.latitude,
        longitude: company.longitude,
        markerName: company.name,
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
  <p v-if="company?.description">{{ company.description }}</p>

  <a v-if="company?.website" :href="company.website" target="_blank">
    {{ company.website }}
  </a>

  <h2>Tours</h2>
  <ul v-if="company?.tours?.length">
    <li v-for="tour in company?.tours" :key="tour.id">
      <router-link :to="`/companies/${company.id}/tours/${tour.id}`">
        {{ tour.name }}
      </router-link>
    </li>
  </ul>
</template>
