<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { defineEmits, ref } from "vue";
import BaseForm from "./BaseForm.vue";

// Password, password, and remember me
const file = ref(null as File | null);
const isLoading = ref(false);

const success = ref(false);

const baseFormRef = ref();

const userStore = useUserStore();

const emit = defineEmits(["success"]);

// The submit function. If there is just the password, check if the password is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!file.value) {
    return;
  }
  isLoading.value = true;
  const response = await userStore.uploadCV(file.value);
  if (response === true) {
    success.value = response;
    emit("success");
  }

  // else if (typeof response === "object") {
  //   if (response.data.errors.email) {
  //     response.data.errors.password = response.data.errors.email;
  //     delete response.data.errors.email;
  //   }
  //   baseFormRef.value.setInputErrors(response.data.errors);
  // }
  else {
    alert("Something went wrong. Please try again.");
  }
  isLoading.value = false;
  return success.value;
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    file.value = files[0];
  } else {
    file.value = null;
  }
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @submit="submitForm"
    :disabled="success"
    :submitText="$t('Upload CV')"
    :isLoading="isLoading"
  >
    <label for="cv">{{ $t("CV (PDF)") }}</label>
    <input
      type="file"
      id="cv"
      name="cv"
      accept=".pdf"
      required
      @change="handleFileChange"
      :disabled="success"
      autofocus
    />
  </base-form>
</template>
