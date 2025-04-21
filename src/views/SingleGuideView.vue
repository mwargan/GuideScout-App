<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import MapComponent from "@/components/MapComponent.vue";
import { useUserStore } from "@/stores/user";
import BaseAvatar from "@/components/BaseAvatar.vue";
import { relativeRealtime } from "@/helpers/relativeRealtime";
import type { User } from "@/types/user";

const props = defineProps({
  /** The user ID */
  userId: {
    type: Number,
    required: true,
  },
});

const userStore = useUserStore();

const user = ref<User | null>(null);
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

  if (!user.value?.latitude || !user.value?.longitude) {
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

const languages = computed(() => {
  return user.value?.model_attributes_pivot?.filter(
    (attr) => attr.attribute.type === "language"
  );
});
const qualifications = computed(() => {
  return user.value?.model_attributes_pivot?.filter(
    (attr) => attr.attribute.type === "qualification"
  );
});
const certifications = computed(() => {
  return user.value?.model_attributes_pivot?.filter(
    (attr) => attr.attribute.type === "certification"
  );
});
const skills = computed(() => {
  return user.value?.model_attributes_pivot?.filter(
    (attr) => attr.attribute.type === "skill"
  );
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

  <nav
    aria-label="Tab Navigation"
    class="tab-nav"
    style="width: 100%; white-space: nowrap"
  >
    <ul>
      <li>
        <a href="#status">Status</a>
      </li>
      <li>
        <a href="#language" v-if="languages?.length">Languages</a>
      </li>
      <li>
        <a href="#qualifications" v-if="qualifications?.length"
          >Qualifications</a
        >
      </li>
      <li>
        <a href="#certifications" v-if="certifications?.length"
          >Certifications</a
        >
      </li>
      <li>
        <a href="#skills" v-if="skills?.length">Skills</a>
      </li>
      <li>
        <a href="#location">Location</a>
      </li>
    </ul>
  </nav>
  <hr />

  <h2>Status</h2>
  <p>Verified guide with an accepted CV. Passed GuideScout interview.</p>

  <h2>Languages</h2>
  <ul>
    <li
      v-for="{ attribute } in user?.model_attributes_pivot?.filter(
        (attr) => attr.attribute.type === 'language'
      )"
      :key="attribute.id"
    >
      {{ attribute.name }}
    </li>
  </ul>

  <template v-if="qualifications?.length">
    <h2 id="qualifications">Qualifications</h2>

    <ul>
      <li
        v-for="{ attribute } in user?.model_attributes_pivot?.filter(
          (attr) => attr.attribute.type === 'qualification'
        )"
        :key="attribute.id"
      >
        {{ attribute.name }}
      </li>
    </ul>
  </template>

  <template v-if="certifications?.length">
    <h2 id="certifications">Certifications</h2>

    <ul>
      <li
        v-for="{ attribute } in user?.model_attributes_pivot?.filter(
          (attr) => attr.attribute.type === 'certification'
        )"
        :key="attribute.id"
      >
        {{ attribute.name }}
      </li>
    </ul>
  </template>

  <template v-if="skills?.length">
    <h2 id="skills">Skills</h2>
    <ul>
      <li
        v-for="{ attribute } in user?.model_attributes_pivot?.filter(
          (attr) => attr.attribute.type === 'skill'
        )"
        :key="attribute.id"
      >
        <span :for="attribute.name">{{ attribute.type }}: </span>
        <b>{{ attribute.name }}</b>
      </li>
    </ul>
  </template>

  <h2>Location</h2>
  <map-component
    class="full-width"
    v-if="user?.latest_location?.latitude && user?.latest_location?.longitude"
    :markers="[
      {
        latitude: user.latest_location.latitude,
        longitude: user.latest_location.longitude,
        markerName:
          user.name +
          (user.latest_location.created_at
            ? ' (' + relativeRealtime(user.latest_location.created_at) + ')'
            : ''),
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
</template>
