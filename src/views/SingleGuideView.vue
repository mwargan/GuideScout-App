<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import MapComponent from "@/components/MapComponent.vue";
import { useUserStore } from "@/stores/user";
import BaseAvatar from "@/components/BaseAvatar.vue";
import { relativeRealtime } from "@/helpers/relativeRealtime";

const props = defineProps({
  /** The user ID */
  userId: {
    type: Number,
    required: true,
  },
});

const userStore = useUserStore();

const user = ref();
const currentLocation = ref();
const driveInfo = ref();

const fetchUser = async () => {
  const response = await axios.get(`/api/users/${props.userId}`);
  user.value = await response.data;
};

const fetchCurrentLocation = async () => {
  currentLocation.value = await userStore.fetchAndSaveUserLocation();
};

const getDriveTimeData = async () => {
  if (!currentLocation.value) {
    return;
  }

  if (!user.value.latitude || !user.value.longitude) {
    return;
  }

  const getData = {
    origin: {
      lat: currentLocation.value.latitude,
      lon: currentLocation.value.longitude,
    },
    destination: {
      lat: user.value.latitude,
      lon: user.value.longitude,
    },
  };
  const response = await axios.get(
    `/api/drive-data?origin[latitude]=${getData.origin.lat}&origin[longitude]=${getData.origin.lon}&destination[latitude]=${getData.destination.lat}&destination[longitude]=${getData.destination.lon}`
  );

  driveInfo.value = response.data;
};

onMounted(async () => {
  // Fetch the user
  await fetchUser();
  await fetchCurrentLocation();
  getDriveTimeData();
});
</script>

<template>
  <hgroup v-if="user">
    <h1>
      <base-avatar
        v-if="user?.gravatar"
        :name="`${user.name} ${user.surname}`"
        :src="user.gravatar"
      />
      {{ user.name }}
    </h1>
    <p>
      Verified guide
      <template v-if="user.phone_country_code"
        >from {{ user.phone_country_code }}</template
      >
    </p>
  </hgroup>

  <ul>
    <li
      v-for="{ attribute } in user?.model_attributes_pivot"
      :key="attribute.id"
    >
      <span :for="attribute.name">{{ attribute.type }}: </span>
      <b>{{ attribute.name }}</b>
    </li>
  </ul>

  <map-component
    class="full-width"
    v-if="user?.latest_location?.latitude && user?.latest_location?.longitude"
    :markers="[
      {
        latitude: user.latest_location.latitude,
        longitude: user.latest_location.longitude,
        markerName:
          user.name +
          ' (' +
          relativeRealtime(user.latest_location.created_at) +
          ')',
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
  <p v-if="user?.description">{{ user.description }}</p>

  <a v-if="user?.website" :href="user.website" target="_blank">
    {{ user.website }}
  </a>
</template>
