<script setup lang="ts">
import { type PropType, computed, provide, ref, shallowRef, watch } from "vue";
import { debounce } from "@/helpers/debounce";
import DropdownSelect from "@/components/DropdownSelect.vue";
import axios from "axios";
import MapComponent, { type Marker } from "@/components/MapComponent.vue";

import { type Vue3OpenlayersGlobalOptions } from "vue3-openlayers";
import { transform } from "ol/proj";
import type { Location } from "@/types/tour";

const props = defineProps({
  modelValue: {
    type: Number as PropType<number | null>,
  },
  currentLat: {
    type: Number as PropType<number | null>,
    required: false,
  },
  currentLng: {
    type: Number as PropType<number | null>,
    required: false,
  },
});

const emit = defineEmits<{
  "update:modelValue": [number];
}>();

const currentGeoResults = shallowRef([]);
const isLoadingGeoResults = ref(false);
const isOpen = ref(false);

const getGeolocationData = async (query: string) => {
  if (isLoadingGeoResults.value) {
    return;
  }
  isLoadingGeoResults.value = true;
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=jsonv2&addressdetails=1&limit=5`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  const json = await response.json();

  if (json.error) {
    isLoadingGeoResults.value = false;
    return;
  }
  currentGeoResults.value = json;
  isLoadingGeoResults.value = false;
  return json;
};

const selectedGeoResult = ref({} as any);
const selectedGeoResultId = ref<string[]>([]);
const geoSearchTerm = ref("");

const selectResult = (result: string[]) => {
  selectedGeoResultId.value = result;
  // Close the dropdown
  isOpen.value = false;
  // Set the selected result

  selectedGeoResult.value = currentGeoResults.value.find(
    // @ts-ignore
    (item) => item.place_id == result
  );

  axios
    .get(
      "/api/locations?lat=" +
        selectedGeoResult.value.lat +
        "&lon=" +
        selectedGeoResult.value.lon
    )
    .then((response) => {
      console.log(response.data);
      getDriveTimeData();
      emit("update:modelValue", response.data.id);
    });
};

const getDriveTimeData = async () => {
  if (!selectedGeoResult.value) {
    return;
  }

  if (!props.currentLat || !props.currentLng) {
    return;
  }

  const getData = {
    origin: {
      lat: props.currentLat,
      lon: props.currentLng,
    },
    destination: {
      lat: selectedGeoResult.value.lat,
      lon: selectedGeoResult.value.lon,
    },
  };
  const response = await axios.get(
    `/api/drive-time?origin[latitude]=${getData.origin.lat}&origin[longitude]=${getData.origin.lon}&destination[latitude]=${getData.destination.lat}&destination[longitude]=${getData.destination.lon}`
  );

  console.log(response.data);
};

const optionsToShow = computed(() => {
  return currentGeoResults.value?.map((item) => {
    return {
      // @ts-ignore
      id: item.place_id,
      // @ts-ignore
      render: item.display_name,
      raw: item,
    };
  });
});

// We need to make sure that the optionsToShow also includes the selectedGeoResult
const optionsToShowWithSelected = computed(() => {
  if (
    selectedGeoResult.value?.place_id &&
    // And doesnt already exist in the optionsToShow
    !optionsToShow.value.find(
      (item) => item.id == selectedGeoResult.value.place_id
    )
  ) {
    // Use a set to remove duplicates
    const allData = [
      {
        id: selectedGeoResult.value.place_id,
        render: selectedGeoResult.value.display_name,
        raw: selectedGeoResult.value,
      },
      ...optionsToShow.value,
    ];

    return Array.from(new Set(allData));
  }
  return optionsToShow.value;
});

const debounceGetGeolocationData = debounce(getGeolocationData);

const options: Vue3OpenlayersGlobalOptions = {
  debug: false,
};

provide("ol-options", options);

const transformedResultCoords = computed(() => {
  return transform(
    [selectedGeoResult.value?.lon ?? 40, selectedGeoResult.value?.lat ?? 40],
    "EPSG:4326",
    "EPSG:3857"
  );
});

const transformedCurrentCoords = computed(() => {
  return transform(
    [props.currentLng ?? 40, props.currentLat ?? 40],
    "EPSG:4326",
    "EPSG:3857"
  );
});

// if the modelValue changes, we need to update the selectedGeoResultId
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Fetch the location data
      axios.get<Location>(`/api/locations/${newValue}`).then((response) => {
        selectedGeoResult.value = {
          ...response.data,
          lat: response.data.latitude,
          lon: response.data.longitude,
          place_id: response.data.id.toString(),
          display_name: response.data.name,
          id: response.data.id.toString(),
        };
        selectedGeoResultId.value = [response.data.id.toString()];
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <dropdown-select
    :ariaBusy="isLoadingGeoResults"
    @update:modelValue="selectResult"
    :modelValue="selectedGeoResultId"
    :options="optionsToShowWithSelected"
    v-model:search="geoSearchTerm"
    @update:search="debounceGetGeolocationData($event)"
    searchable
    autofocus
    required
    v-model:isOpen="isOpen"
    :searchLocally="false"
  >
    <template #optionSlot="{ option, updateModelValue }">
      <label>
        <input
          type="checkbox"
          :value="option.id"
          :checked="selectedGeoResultId.includes(option.id)"
          @click="updateModelValue"
        />
        <span>{{ option.render }}</span>
        <small> - {{ option.raw.addresstype }}</small>
      </label>
    </template>
  </dropdown-select>
  <details>
    <summary>{{ $t("Map") }}</summary>
    <map-component
      :markers="
        [
          {
            latitude: selectedGeoResult?.lat ?? 40,
            longitude: selectedGeoResult?.lon ?? 40,
            markerName:
              selectedGeoResult?.name ?? selectedGeoResult?.display_name,
          },
          props.currentLat && props.currentLng
            ? {
                latitude: props.currentLat ?? 40,
                longitude: props.currentLng ?? 40,
                markerName: 'Company',
              }
            : null,
        ].filter(Boolean) as Marker[]
      "
      :showOpenInGoogleMaps="false"
    />
  </details>
</template>
