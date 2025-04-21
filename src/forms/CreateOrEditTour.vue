<script setup lang="ts">
import { reactive } from "vue";
import BaseForm from "@/forms/BaseForm.vue";
import axios from "axios";
import AttributeDropdown from "@/components/AttributeDropdown.vue";

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
  },
  tourId: {
    type: Number,
    required: false,
  },
});

const emit = defineEmits<{
  success: [number];
}>();

const formData = reactive({
  name: "",
  // starts at default to today + 2 hours
  minutesDuration: 120,
  prepMinutes: 30,
  cleanupMinutes: 30,
  requiredAttributeIds: [],
  description: "",
});

const createTour = async () => {
  const method = props.tourId ? "put" : "post";
  const url = props.tourId
    ? `/api/companies/${props.companyId}/tours/${props.tourId}`
    : `/api/companies/${props.companyId}/tours`;
  const response = await axios[method](url, {
    ...formData,
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
      alert("Failed to create tour - " + error.response.data.message);
      return error.response;
    });

  if (response.status === 201) {
    emit("success", response.data.id);
    alert("Tour created");
  } else if (response.status === 200) {
    emit("success", response.data.id);
    alert("Tour updated");
  } else {
    alert("Failed to create tour - " + response.data.message);
  }
};

const fetchTour = async () => {
  const response = await axios
    .get(`/api/companies/${props.companyId}/tours/${props.tourId}`)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
      alert("Failed to fetch tour - " + error.response.data.message);
      return error.response;
    });

  if (response.status === 200) {
    formData.name = response.data.name;
    formData.minutesDuration = response.data.minutesDuration;
    formData.prepMinutes = response.data.prepMinutes;
    formData.cleanupMinutes = response.data.cleanupMinutes;
    formData.requiredAttributeIds = response.data.required_attributes.map(
      (attr: { id: number }) => `${attr.id}`
    );
    formData.description = response.data.description;
  }
};

// If there is a tourId, fetch the tour and fill the form
if (props.tourId) {
  fetchTour();
}
</script>

<template>
  <base-form @submit="createTour">
    <label for="tour">{{ $t("Name") }}</label>
    <input type="text" required v-model="formData.name" />

    <label for="starts_at">{{ $t("Duration in minutes") }}</label>
    <input
      type="number"
      required
      min="30"
      max="1440"
      v-model="formData.minutesDuration"
    />

    <label>{{ $t("Required guide attributes") }}</label>
    <attribute-dropdown
      v-model="formData.requiredAttributeIds"
    ></attribute-dropdown>
    <small>
      {{
        $t(
          "Select the attributes that the guide must have specifically for this tour, in addition to the tours already required attributes: "
        )
      }}
    </small>
  </base-form>
</template>
