<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { handleError } from "@/utils/errorTransformer";

// Password, password, and remember me
const password = ref("");

const emit = defineEmits(["success"]);

const success = ref(false);

const baseFormRef = ref();

const token = router.currentRoute.value.query.token as string;
const email = router.currentRoute.value.query.email as string;

const userStore = useUserStore();
// The submit function. If there is just the password, check if the password is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  try {
    success.value = await userStore.sendPasswordReset(
      email,
      token,
      password.value
    );
    emit("success");
  } catch (e) {
    const inputErrors = handleError(e);
    if (inputErrors.email) {
      inputErrors.password = inputErrors.email;
      delete inputErrors.email;
    }

    baseFormRef.value.setInputErrors(inputErrors);
  }
  return success.value;
};
</script>

<template>
  <base-form ref="baseFormRef" @submit="submitForm" :disabled="success">
    <label for="password">{{ $t("New password") }}</label>
    <input
      type="password"
      name="password"
      :placeholder="$t('New password')"
      v-model="password"
      :disabled="success"
      autofocus
      autocomplete="new-password"
      required
    />
    <small v-if="success" class="success">{{
      $t("You can now log in with your new password!")
    }}</small>
  </base-form>
</template>
