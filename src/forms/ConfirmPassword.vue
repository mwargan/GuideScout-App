<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import BaseForm from "./BaseForm.vue";
import { handleError } from "@/utils/errorTransformer";

// Password, password, and remember me
const password = ref("");

const success = ref(false);

const baseFormRef = ref();

const emit = defineEmits(["success"]);

const userStore = useUserStore();
// The submit function. If there is just the password, check if the password is valid. If it is not, set the register mode. If it is, set the login mode.
const submitForm = async () => {
  try {
    success.value = await userStore.confirmPassword(password.value);
    emit("success");
  } catch (error) {
    const inputErrors = handleError(error);
    baseFormRef.value.setInputErrors(inputErrors);
  }
  return success.value;
};
</script>

<template>
  <base-form
    v-if="userStore.isAuthenticated"
    ref="baseFormRef"
    @submit="submitForm"
    :disabled="success"
  >
    <label for="password">{{ $t("Password") }}</label>
    <input
      type="password"
      name="password"
      :placeholder="$t('Password')"
      v-model="password"
      :disabled="success"
      autofocus
      auto-complete="current-password"
      required
    />
    <small v-if="success" class="success">{{
      $t("You can now log in with your new password!")
    }}</small>
  </base-form>
  <div v-else>{{ $t("Login or sign up to continue") }}</div>
</template>
