<script setup lang="ts">
import { type PropType, computed, ref } from "vue";
import DropdownSelect from "@/components/DropdownSelect.vue";
import axios from "axios";
import type { Attribute } from "@/types/tour";

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

const attributes = ref<Attribute[]>([]);

const isLoading = ref(false);
const isOpen = ref(false);

const formattedOptions = computed(() => {
  return attributes.value
    .filter((attribute) => {
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

const getAttributes = async () => {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  const response = await axios.get<Attribute[]>(`/api/attributes`);

  attributes.value = response.data;

  emit("update:attributes", attributes.value);

  isLoading.value = false;
};

const searchTerm = ref("");

getAttributes();
</script>

<template>
  <dropdown-select
    :ariaBusy="isLoading"
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
