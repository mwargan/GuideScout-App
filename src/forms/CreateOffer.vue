<script setup lang="ts">
import { computed, reactive, ref, shallowRef } from "vue";
import DropdownSelect from "@/components/DropdownSelect.vue";
import BaseForm from "@/forms/BaseForm.vue";
import axios from "axios";
import type { TourType } from "@/types/tour";
import AttributeDropdown from "@/components/AttributeDropdown.vue";
import CompanyUserDropdown from "@/components/CompanyUserDropdown.vue";

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
  },
  allowManualGuideAssignment: {
    type: Boolean,
    default: false,
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
  required_attribute_ids: [],
  guide_ids: [],
  description: "",
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

const selectedTourResult = ref({} as TourType | null);
const selectedTourResultId = ref([] as string[]);
const tourSearchTerm = ref("");

const tourRequiredAttributes = ref([] as number[]);

const tourRequiredAttributeNames = computed(() => {
  return tourRequiredAttributes.value.map((attrId) => {
    return currentTourResults.value
      .flatMap((tour) => tour.hard_required_guide_attributes)
      .find((attr) => attr.id === attrId)?.name;
  });
});

const selectResult = (result: string[]) => {
  selectedTourResultId.value = result;
  formData.company_tour_id = result[0];
  // Close the dropdown
  isOpen.value = false;
  // Set the selected result

  selectedTourResult.value =
    currentTourResults.value.find(
      // @ts-ignore
      (item) => item.id == result
    ) ?? null;

  if (!selectedTourResult.value) {
    return;
  }

  tourRequiredAttributes.value =
    selectedTourResult.value.hard_required_guide_attributes.map(
      (attr) => attr.id
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
  if (!selectedTourResult.value) {
    return 0;
  }
  return (
    formData.payment_amount * (selectedTourResult.value?.minutesDuration / 60)
  );
});

const totalPrepCleanupCost = computed(() => {
  if (!selectedTourResult.value) {
    return 0;
  }
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
      <summary>{{ $t("Advanced options") }}</summary>
      <div>
        <label>{{ $t("Required guide attributes") }}</label>
        <attribute-dropdown
          v-model="formData.required_attribute_ids"
        ></attribute-dropdown>
        <small>
          {{
            $t(
              "Select the attributes that the guide must have specifically for this offer, in addition to the tours already required attributes: "
            )
          }}
          {{ tourRequiredAttributeNames.join(", ") }}
        </small>
        <template v-if="allowManualGuideAssignment">
          <label>{{ $t("Assign guides manually") }}</label>
          <company-user-dropdown
            :companyId="props.companyId"
            v-model="formData.guide_ids"
            :attributeIds="[
              ...formData.required_attribute_ids,
              ...tourRequiredAttributes,
            ]"
          ></company-user-dropdown>
        </template>

        <label>{{ $t("Offer description") }}</label>
        <textarea
          v-model="formData.description"
          :placeholder="
            $t('Description for the guide to see before accepting the offer')
          "
          rows="3"
          cols="30"
        ></textarea>
        <small>
          {{
            $t(
              "This description will be shown to the guide before they accept the offer."
            )
          }}
        </small>
      </div>
    </details>

    <details v-if="selectedTourResult?.id">
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
