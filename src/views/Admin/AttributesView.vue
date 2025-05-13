<script lang="ts" setup>
import { ref } from "vue";
import BaseForm from "@/forms/BaseForm.vue";
import ApiClient from "@/api/client";

const name = ref("");
const type = ref(
  "language" as
    | "language"
    | "skill"
    | "certification"
    | "education"
    | "experience"
    | "qualification"
);
const typeOptions = [
  "language",
  "skill",
  "certification",
  "education",
  "experience",
  "qualification",
];

const createAttribute = async () => {
  const response = await ApiClient.post(`/api/attributes`, {
    name: name.value,
    type: type.value,
  });

  if (response.status === 201) {
    alert("Attribute created!");
  } else {
    alert("Attribute failed to create.");
  }
};
</script>
<template>
  <h1>{{ $t("Attributes") }}</h1>
  <base-form @submit="createAttribute">
    <label for="name">{{ $t("Name") }}</label>
    <input
      type="text"
      id="name"
      name="name"
      :placeholder="$t('Name')"
      v-model="name"
      required
    />
    <label for="type">{{ $t("Type") }}</label>
    <select id="type" name="type" v-model="type" required>
      <option
        v-for="typeOption in typeOptions"
        :key="typeOption"
        :value="typeOption"
      >
        {{ typeOption }}
      </option>
    </select>
  </base-form>
</template>
