<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import BaseForm from "@/forms/BaseForm.vue";
import LocationDropdown from "@/components/LocationDropdown.vue";
import BaseButton from "@/components/BaseButton.vue";
import { formatDateTimeForInput } from "@/helpers/date";
import { getOfferPassenger } from "@/api/offer";
import ApiClient from "@/api/client";

const props = defineProps({
  offerId: {
    type: Number,
    required: true,
  },
  paxId: {
    type: Number,
    required: false,
  },
});

const minDateTime = new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 16);

const formData = reactive({
  name: "",
  surname: "",
  phone: "",
  email: "",
  adults: 0,
  children: 0,
  infants: 0,
  pickup_location_id: null as number | null,
  dropoff_location_id: null as number | null,
  pickup_at: minDateTime,
  dropoff_at: minDateTime,
  food_preferences: "",
  notes: "",
});

const pickupAtOffice = ref(true);
const dropoffSameAsPickup = ref(true);

const resetForm = () => {
  // Reset the form
  formData.name = "";
  formData.surname = "";
  formData.phone = "";
  formData.email = "";
  formData.adults = 0;
  formData.children = 0;
  formData.infants = 0;
  formData.pickup_location_id = null;
  formData.dropoff_location_id = null;
  formData.pickup_at = minDateTime;
  formData.dropoff_at = minDateTime;
  formData.food_preferences = "";
  formData.notes = "";

  pickupAtOffice.value = true;
  dropoffSameAsPickup.value = true;
};

const createPax = async () => {
  const method = props.paxId ? "put" : "post";
  const url = `/api/offers/${props.offerId}/passengers${
    props.paxId ? `/${props.paxId}` : ""
  }`;
  const data = {
    ...formData,
    pickup_at: pickupAtOffice.value
      ? null
      : new Date(formData.pickup_at).toISOString(),
    dropoff_at: dropoffSameAsPickup.value
      ? null
      : new Date(formData.dropoff_at).toISOString(),
    pickup_location_id: pickupAtOffice.value
      ? null
      : formData.pickup_location_id,
    dropoff_location_id: dropoffSameAsPickup.value
      ? null
      : formData.dropoff_location_id,
  };

  const response = await ApiClient[method](url, data)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(error);
      alert("Failed to create passenger - " + error.response.data.message);
      return error.response;
    });
  if (response.status === 201) {
    alert("Passenger created. Add another one now or close the form.");
    if (!props.paxId) {
      resetForm();
    }
  } else if (response.status === 200) {
    alert("Passenger updated.");
  }
};

// If there is a paxId, fetch the pax and fill the form
onMounted(async () => {
  if (props.paxId) {
    const pax = await getOfferPassenger({
      offerId: props.offerId,
      paxId: props.paxId,
    });
    if (pax) {
      formData.name = pax.primary.name;
      formData.surname = pax.primary.surname;
      formData.phone = pax.primary.phone;
      formData.email = pax.primary.email;
      formData.adults = pax.adults;
      formData.children = pax.children;
      formData.infants = pax.infants;
      formData.pickup_location_id = pax.pickup_location_id;
      formData.dropoff_location_id = pax.dropoff_location_id;
      formData.pickup_at = pax.pickup_at
        ? formatDateTimeForInput(new Date(pax.pickup_at))
        : minDateTime;
      formData.dropoff_at = pax.dropoff_at
        ? formatDateTimeForInput(new Date(pax.dropoff_at))
        : minDateTime;
      formData.food_preferences = pax.food_preferences;
      formData.notes = pax.notes;
      pickupAtOffice.value = !pax.pickup_location_id;
      dropoffSameAsPickup.value = !pax.dropoff_location_id;
    }
  }
});
</script>

<template>
  <base-form @submit="createPax">
    <fieldset>
      <h2>{{ $t("Primary") }}</h2>
      <label for="name">{{ $t("Name") }}</label>
      <input
        type="text"
        id="name"
        name="name"
        :placeholder="$t('Name')"
        v-model="formData.name"
        required
      />

      <label for="surname">{{ $t("Surname") }}</label>
      <input
        type="text"
        id="surname"
        name="surname"
        :placeholder="$t('Surname')"
        v-model="formData.surname"
        required
      />

      <label for="phone">{{ $t("Phone") }}</label>
      <input
        type="tel"
        id="phone"
        name="phone"
        :placeholder="$t('Phone')"
        v-model="formData.phone"
        required
      />

      <label for="email">{{ $t("Email") }}</label>
      <input
        type="email"
        id="email"
        name="email"
        :placeholder="$t('Email')"
        v-model="formData.email"
        required
      />
    </fieldset>
    <fieldset>
      <h2>Guests</h2>
      <label for="adults">{{ $t("Adults") }}</label>
      <input
        type="number"
        id="adults"
        name="adults"
        :placeholder="$t('Adults')"
        min="0"
        v-model="formData.adults"
        required
      />

      <label for="children">{{ $t("Children") }}</label>
      <input
        type="number"
        id="children"
        name="children"
        :placeholder="$t('Children')"
        min="0"
        v-model="formData.children"
        required
      />

      <label for="infants">{{ $t("Infants") }}</label>
      <input
        type="number"
        id="infants"
        name="infants"
        :placeholder="$t('Infants')"
        min="0"
        v-model="formData.infants"
        required
      />
    </fieldset>

    <fieldset>
      <h2>{{ $t("Pickup and dropoff") }}</h2>
      <h3>{{ $t("Pickup") }}</h3>
      <label for="pickupAtOffice">
        <input
          type="checkbox"
          id="pickupAtOffice"
          name="pickupAtOffice"
          v-model="pickupAtOffice"
        />{{ $t("Pickup at office") }}
      </label>

      <template v-if="!pickupAtOffice">
        <label for="pickup_location_id">{{ $t("Pickup Location") }}</label>
        <location-dropdown v-model="formData.pickup_location_id" />

        <label for="pickup_at">{{ $t("Pickup At") }}</label>
        <input
          type="datetime-local"
          id="pickup_at"
          name="pickup_at"
          :placeholder="$t('Pickup At')"
          v-model="formData.pickup_at"
          required
        />
      </template>

      <h3>{{ $t("Dropoff") }}</h3>
      <label for="dropoffSameAsPickup">
        <input
          type="checkbox"
          id="dropoffSameAsPickup"
          name="dropoffSameAsPickup"
          v-model="dropoffSameAsPickup"
        />{{ $t("Dropoff same as pickup") }}
      </label>
      <template v-if="!dropoffSameAsPickup">
        <label for="dropoff_location_id">{{ $t("Dropoff Location") }}</label>
        <location-dropdown v-model="formData.dropoff_location_id" />

        <label for="dropoff_at">{{ $t("Dropoff At") }}</label>
        <input
          type="datetime-local"
          id="dropoff_at"
          name="dropoff_at"
          :placeholder="$t('Dropoff At')"
          v-model="formData.dropoff_at"
          required
        />
      </template>
    </fieldset>

    <fieldset>
      <h2>{{ $t("Details") }}</h2>
      <label for="food_preferences">{{ $t("Food Preferences") }}</label>
      <input
        type="text"
        id="food_preferences"
        name="food_preferences"
        :placeholder="$t('Food Preferences')"
        v-model="formData.food_preferences"
      />

      <label for="notes">{{ $t("Notes") }}</label>
      <textarea
        id="notes"
        name="notes"
        :placeholder="$t('Notes')"
        v-model="formData.notes"
      ></textarea>
    </fieldset>

    <template #after-submit v-if="paxId">
      <base-button @click="resetForm" class="danger">
        {{ $t("Mark passengers as cancelled") }}
      </base-button>
    </template>
  </base-form>
</template>
