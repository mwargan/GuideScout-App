<script setup lang="ts">
import { type PropType, computed, ref } from "vue";
import DropdownSelect from "@/components/DropdownSelect.vue";
import type { Attribute } from "@/types/tour";
import { getAttributes } from "@/api/attribute";

import { useQuery } from "@tanstack/vue-query";

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
  },
  typeFilter: {
    type: String as PropType<Attribute["type"]>,
    required: false,
  },
});

const emit = defineEmits<{
  "update:modelValue": string[][];
  // Emit whenever the attributes list is updated
  "update:attributes": Attribute[][];
}>();

const isOpen = ref(false);

const formattedOptions = computed(() => {
  return attributes.data?.value
    ?.filter((attribute) => {
      if (!props.typeFilter) {
        return true;
      }

      return (
        attribute.type === props.typeFilter ||
        // Or is selected
        props.modelValue?.includes(`${attribute.id}`)
      );
    })
    .map((attribute) => ({
      id: `${attribute.id}`,
      render: attribute.name,
      raw: attribute,
    }));
});

const getAttributesFromApi = async () => {
  const data = await getAttributes();
  emit("update:attributes", data);
  return data;
};
const attributes = useQuery({
  queryKey: ["attributes"],
  queryFn: getAttributesFromApi,
  staleTime: 1000 * 60, // 1 minute
});

const searchTerm = ref("");
</script>

<template>
  <dropdown-select
    :ariaBusy="attributes.isFetching.value"
    @update:modelValue="emit('update:modelValue', $event)"
    :modelValue="modelValue"
    :options="formattedOptions"
    searchable
    autofocus
    required
    :multiple="true"
    v-model:search="searchTerm"
    v-model:isOpen="isOpen"
    :showSelectedFirst="true"
  >
    <template #optionSlot="{ option, updateModelValue }">
      <label>
        <input
          type="checkbox"
          :value="option.id"
          :checked="modelValue?.includes(option.id)"
          @click="updateModelValue"
        />
        <span>{{ option.render }}</span>
        <small> - {{ option.raw.type }}</small>
      </label>
    </template>
  </dropdown-select>
</template>
