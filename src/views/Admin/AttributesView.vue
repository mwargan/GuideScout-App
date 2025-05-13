<script lang="ts" setup>
import { ref } from "vue";
import BaseForm from "@/forms/BaseForm.vue";
import { postAttribute } from "@/api/attribute";

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
  try {
    await postAttribute({
      name: name.value,
      type: type.value,
    });
    alert("Attribute created!");
  } catch (error) {
    console.error("Error creating attribute:", error);
    alert("Failed to create attribute. Please try again.");
    // Handle error (e.g., show a notification)
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
