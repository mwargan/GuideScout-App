<script setup lang="ts">
import { type PropType, computed, ref, watch } from "vue";
import DropdownSelect from "@/components/DropdownSelect.vue";
import BaseAvatar from "./BaseAvatar.vue";
import { getCompanyUsers } from "@/api/company";

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
  },
  companyId: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "guide",
  },
  attributeIds: {
    type: Array as PropType<number[]>,
    required: false,
  },
});

const emit = defineEmits<{
  "update:modelValue": string[][];
  // Emit whenever the users list is updated
  "update:users": any[];
}>();

const users = ref([] as any[]);

const isLoadingGeoResults = ref(false);
const isOpen = ref(false);

const getData = async () => {
  const companyId = props.companyId;
  if (!companyId) {
    return;
  }

  isLoadingGeoResults.value = true;

  users.value = await getCompanyUsers({
    companyId: companyId,
    params: {
      role: props.role,
      attributeIds: props.attributeIds,
    },
  });

  emit("update:users", users.value);

  isLoadingGeoResults.value = false;
};

watch(
  () => props.companyId,
  async (companyId) => {
    getData();
  },
  { immediate: true }
);

// Watch the attributeIds
watch(
  () => props.attributeIds,
  async (attributeIds) => {
    getData();
  }
);

const formattedOptions = computed(() => {
  return users.value.map((user) => ({
    id: `${user.id}`,
    render: `${user.name} ${user.surname}`,
    raw: user,
  }));
});
</script>

<template>
  <dropdown-select
    :ariaBusy="isLoadingGeoResults"
    @update:modelValue="emit('update:modelValue', $event)"
    :modelValue="modelValue"
    :options="formattedOptions"
    searchable
    autofocus
    required
    :multiple="true"
    v-model:isOpen="isOpen"
  >
    <template #optionSlot="{ option, updateModelValue }">
      <label>
        <input
          type="checkbox"
          :value="option.id"
          :checked="modelValue?.includes(option.id)"
          @click="updateModelValue"
        />
        <base-avatar
          :name="`${option.raw.name} ${option.raw.surname}`"
          :src="option.raw.gravatar"
        />
        <span>{{ option.render }}</span>
        <small> - {{ option.raw.phone_country_code }}</small>
      </label>
    </template>
  </dropdown-select>
</template>
