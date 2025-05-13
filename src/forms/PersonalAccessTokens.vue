<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseForm from "./BaseForm.vue";
import { createPersonalAccessToken } from "@/services/me";

const { t } = useI18n();

// Email, password, and remember me
const tokenName = ref("");

const baseFormRef = ref();

const emit = defineEmits(["created"]);

// The submit function. If there is just the email, check if the email is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  if (!tokenName.value) {
    return;
  }

  try {
    const response = await createPersonalAccessToken(tokenName.value);
    emit("created", response);
    const text = t(
      "Your personal access token has been created. This is the only time you can see it."
    );
    alert(text + "\n\n" + response.token);
  } catch (error) {
    const text = t(
      "There was an error creating your personal access token. Please try again."
    );
    alert(text);
  }
};
</script>

<template>
  <base-form
    ref="baseFormRef"
    @submit="submitForm"
    submitText="Create a new API token"
  >
    <label for="name">{{ $t("New token name") }}</label>
    <input
      type="text"
      name="name"
      :placeholder="$t('Token name')"
      required
      v-model="tokenName"
    />
  </base-form>
</template>
