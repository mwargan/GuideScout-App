<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import DropdownSelect from "@/components/DropdownSelect.vue";
import BaseForm from "@/forms/BaseForm.vue";
import type { Tour } from "@/types/offer";
import ApiClient from "@/api/client";

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
  },
});

const currentGeoResults = shallowRef<Tour[]>([]);
const isLoadingGeoResults = ref(false);
const isOpen = ref(false);

const getGeolocationData = async () => {
  if (isLoadingGeoResults.value) {
    return;
  }
  isLoadingGeoResults.value = true;

  const response = await ApiClient.get(
    `/api/companies/${props.companyId}/tours`
  );

  const json = (await response.data) as Tour[];

  currentGeoResults.value = json;
  isLoadingGeoResults.value = false;
};

const selectedGeoResult = ref({} as any);
const selectedGeoResultId = ref([] as string[]);
const geoSearchTerm = ref("");

const selectResult = (result: string[]) => {
  selectedGeoResultId.value = result;
  // Close the dropdown
  isOpen.value = false;
  // Set the selected result

  selectedGeoResult.value = currentGeoResults.value.find(
    // @ts-ignore
    (item) => item.id == result
  );
};

const optionsToShow = computed(() => {
  return currentGeoResults.value?.map((item) => {
    return {
      id: item.id,

      render: item.name,
      raw: item,
    };
  });
});

getGeolocationData();
</script>

<template>
  <base-form :disabled="selectedGeoResultId.length === 0">
    <dropdown-select
      :ariaBusy="isLoadingGeoResults"
      @update:modelValue="selectResult"
      :modelValue="selectedGeoResultId"
      :options="optionsToShow"
      v-model:search="geoSearchTerm"
      searchable
      autofocus
      required
      v-model:isOpen="isOpen"
    >
    </dropdown-select>
  </base-form>
</template>
