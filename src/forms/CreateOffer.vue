<script setup lang="ts">
import { computed, reactive, ref, shallowRef } from "vue";
import DropdownSelect from "@/components/DropdownSelect.vue";
import BaseForm from "@/forms/BaseForm.vue";
import axios from "axios";
import type { TourType } from "@/types/tour";

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits<{
  success: [number];
}>();

const platformFee = parseFloat(import.meta.env.VITE_PLATFORM_FEE_PERCENT);

const currentTourResults = shallowRef<TourType[]>([]);
const isLoadingTourResults = ref(false);
const isOpen = ref(false);

const minDateTime = new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 16);

const formData = reactive({
  company_tour_id: "",
  // starts at default to today + 2 hours
  starts_at: minDateTime,
  payment_amount: 12.5,
});

const getTourData = async () => {
  if (isLoadingTourResults.value) {
    return;
  }
  isLoadingTourResults.value = true;

  const response = await axios.get(`/api/companies/${props.companyId}/tours`);

  const json = (await response.data) as TourType[];

  currentTourResults.value = json;
  isLoadingTourResults.value = false;
};

const selectedTourResult = ref({} as any);
const selectedTourResultId = ref([] as string[]);
const tourSearchTerm = ref("");

const selectResult = (result: string[]) => {
  console.log(result);
  selectedTourResultId.value = result;
  formData.company_tour_id = result[0];
  // Close the dropdown
  isOpen.value = false;
  // Set the selected result

  selectedTourResult.value = currentTourResults.value.find(
    // @ts-ignore
    (item) => item.id == result
  );
};

const optionsToShow = computed(() => {
  return currentTourResults.value?.map((item) => {
    return {
      id: item.id,

      render: item.name,
      raw: item,
    };
  });
});

const totalGuideCost = computed(() => {
  return (
    formData.payment_amount * (selectedTourResult.value?.minutesDuration / 60)
  );
});

const totalPrepCleanupCost = computed(() => {
  return (
    (selectedTourResult.value?.prepMinutes +
      selectedTourResult.value?.cleanupMinutes) *
    (formData.payment_amount / 60)
  );
});

const totalPlatformFee = computed(() => {
  return (totalGuideCost.value + totalPrepCleanupCost.value) * platformFee;
});

const totalCost = computed(() => {
  return (
    totalGuideCost.value + totalPlatformFee.value + totalPrepCleanupCost.value
  );
});

getTourData();

const createOffer = async () => {
  const response = await axios
    .post(`/api/companies/${props.companyId}/offers`, {
      ...formData,
      hourly_rate_eur_cents: formData.payment_amount * 100,
      total_cost: Math.round(totalCost.value * 100),

      // The starts at must include timezone info - pass as zulu time
      starts_at: new Date(formData.starts_at).toISOString(),
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
      alert("Failed to create offer - " + error.response.data.message);
      return error.response;
    });

  if (response.status === 201) {
    emit("success", response.data.id);
    alert("Offer created");
  }
};
</script>

<template>
  <base-form
    :disabled="selectedTourResultId.length === 0"
    @submit="createOffer"
  >
    <label for="tour">{{ $t("Tour") }}</label>
    <dropdown-select
      :ariaBusy="isLoadingTourResults"
      @update:modelValue="selectResult"
      :modelValue="[formData.company_tour_id]"
      :options="optionsToShow"
      v-model:search="tourSearchTerm"
      searchable
      autofocus
      required
      v-model:isOpen="isOpen"
    >
    </dropdown-select>

    <label for="starts_at">{{ $t("Start time") }}</label>
    <input
      type="datetime-local"
      :min="minDateTime"
      required
      v-model="formData.starts_at"
    />

    <label for="hourly_rate_eur_cents">{{
      $t("Hourly guide rate in EUR")
    }}</label>
    <input
      type="number"
      required
      step="0.01"
      min="8"
      v-model="formData.payment_amount"
    />

    <details>
      <summary>
        Total cost:
        {{
          new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "EUR",
          }).format(totalCost)
        }}
      </summary>

      <table>
        <tr>
          <td>
            Guide tour payment ({{ selectedTourResult.minutesDuration / 60 }}h *
            {{
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(formData.payment_amount)
            }})
          </td>

          <td>
            {{
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(totalGuideCost)
            }}
          </td>
        </tr>
        <tr>
          <td>
            Guide prep and cleanup time payment ({{
              selectedTourResult.prepMinutes
            }}m *
            {{
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(formData.payment_amount)
            }}
            / h) + ({{ selectedTourResult.cleanupMinutes }}m *
            {{
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(formData.payment_amount)
            }}
            / h)
          </td>
          <td>
            {{
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(
                (selectedTourResult.prepMinutes +
                  selectedTourResult.cleanupMinutes) *
                  (formData.payment_amount / 60)
              )
            }}
          </td>
        </tr>
        <tr>
          <td>{{ $t("Platform fee") }}</td>
          <td>
            {{
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(totalPlatformFee)
            }}
          </td>
        </tr>
        <tr>
          <td>{{ $t("Total cost") }}</td>
          <td>
            {{
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
              }).format(totalCost)
            }}
          </td>
        </tr>
      </table>
    </details>
  </base-form>
</template>
